// ipcHandlers.js
const { ipcMain } = require('electron');
const { getSessionToken, saveSessionToken, getUserData, saveDownloadDirectory } = require('./userDataStore');
const getOrders = require('./fetchOrders');
const cache = require('./cache');
const { writeFile, existsSync, mkdirSync, readFileSync } = require('fs');
const { join } = require('path');
const getOrdersFromFile = require('./getOrdersFromFile');
const getDownloadPages = require('./fetchDownloadItems');

const { CONSTANTS } = require('./constants');
const { DATA_DIR } = CONSTANTS;

const { getDB, closeDB } = require('./database/getDB');
const allOrderPagesParsed = require('./database/allOrderPagesParsed');
const getOrdersWithCreations = require('./database/getOrdersWithCreations');

const setupIpcHandlers = () => {
	ipcMain.on('requestSessionToken', (event) => {
		event.reply('sessionToken', getSessionToken());
	});

	ipcMain.on('requestUserData', (event) => {
		console.log('requestUserData');
		event.reply('userData-reply', getUserData());
	});

	ipcMain.on('saveSessionToken', (event, token) => {
		saveSessionToken(token);
	});

	ipcMain.on('saveDownloadDirectory', (event, directory) => {
		saveDownloadDirectory(directory);
	});

	ipcMain.on('fetch-orders', async (event, url = '') => {
		// console.log(url);
		getOrders(url);
	});

	ipcMain.on('get-cache', async (event, url = '') => {
		const data = cache.getSync(url);
		event.reply('get-cache-reply', data);
	});

	ipcMain.on('clear-cache', async (event) => {
		await cache.clear();
		event.reply('cache-cleared');
	});

	ipcMain.on('all-order-pages-parsed', async (event, orders) => {
		const dir = DATA_DIR;
		const file = join(dir, 'orders.json');

		// Check if the directory exists
		if (!existsSync(dir)) {
			// If the directory does not exist, create it
			mkdirSync(dir);
		}

		if (!existsSync(file)) {
			writeFile(file, JSON.stringify([], null, 2), (err) => {
				if (err) throw err;
			});
		}

		// read the file if it exists and parse the JSON
		const allOrders = existsSync(file)
			? JSON.parse(readFileSync(file))
			: [];

		// loop through existing orders and compare new orders to see if they exist
		orders.forEach((order) => {
			const existingOrder = allOrders.find((o) => o.number === order.number);
			if (!existingOrder) {
				console.log('Adding order: ', order.number);
				allOrders.push(order);
			} else {
				console.log('Order already exists: ', order.number);
			}
		});

		writeFile(DATA_DIR + '/orders.json', JSON.stringify(allOrders, null, 2), (err) => {
			if (err) throw err;
		});
		// event.reply('all-order-pages-parsed-reply');

		await allOrderPagesParsed(orders);

		event.reply('all-order-pages-parsed-reply');
	});

	ipcMain.on('get-orders-from-file', async (event) => {
		const orders = await getOrdersFromFile();
		event.reply('get-orders-from-file-reply', orders);
	});

	ipcMain.on('fetch-download-page', async (event, url = '', orderNumber = '') => {
		getDownloadPages(url, orderNumber);
	});

	ipcMain.on('add-order-download-links-to-orders-json-file', async (event, data) => {
		console.log(data);
		const { orderNumber, downloadLinks } = data;

		const orders = await getOrdersFromFile();
		// console.log('orders: ', orders);
		// loop through orders till we find the order with the matching order number
		// console.log(event);
		let order = null;
		// do this with a foreach loop instead of a find loop
		orders.forEach((o) => {
			if (o.number === orderNumber) {
				order = o;
				// break out of the loop
			}
		});

		if (!order) {
			console.log('No matching order found for order: ', orderNumber);
			return;
		}

		// loop through the creations to find the creation that has the link that matches a key in the downloadLinks object
		let updatedOrder = false;

		order.creations.forEach((creation) => {
			// console.log(downloadLinks);
			Object.keys(downloadLinks).forEach((key) => {
				console.log(key);
				console.log(creation.link);

				if (creation.link.endsWith(key)) {
					updatedOrder = true;
					creation.downloadLinks = downloadLinks[key];
				}
			});
		});
		if (!updatedOrder) {
			console.log('No matching creation found for order: ', orderNumber);
			return;
		}
		// write the orders back to the file
		writeFile(DATA_DIR + '/orders.json', JSON.stringify(orders, null, 2), (err) => {
			if (err) throw err;
		});
	});

	ipcMain.on('get-orders-from-db', (event) => {
		const db = getDB();
		db.all('SELECT * FROM orders', [], (err, rows) => {
			if (err) {
				throw err;
			}
			event.reply('get-orders-from-db-reply', rows);
		});
		closeDB(db);
	});

	ipcMain.on('get-creations-from-db', (event) => {
		const db = getDB();
		db.all('SELECT * FROM creations', [], (err, rows) => {
			if (err) {
				throw err;
			}
			event.reply('get-creations-from-db-reply', rows);
		});
		closeDB(db);
	});

	ipcMain.on('get-orders-with-creations', async (event) => {
		const orders = await getOrdersWithCreations();
		event.reply('get-orders-with-creations-reply', orders);
	});
};

module.exports = { setupIpcHandlers };
