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
const { getOrderById } = require('./database/getOrderByX');
const { getCreationsByOrderId, getCreationsByOrderNumber } = require('./database/getCreationByX');
const getCreationPage = require('./fetchCreationExtraData');
const testToken = require('./testSessionToken');

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

	ipcMain.on('fetch-download-page', async (event, url = '', orderNumber = '', creations = []) => {
		getDownloadPages(url, orderNumber, creations);
	});

	// get the order from database with the orderNumber matching the item id
	ipcMain.handle('get-order-by-id', async (event, itemId) => {
		console.log('\n\n\n\n\n\n\n\n');
		console.log('get-order-by-id', itemId);
		const order = await getOrderById(itemId);
		console.log(order);

		const creations = await getCreationsByOrderId(order.id);

		console.log('\n\n\n\n\n\n\n\n');
		console.log('creations:', creations);
		return order;
	});

	ipcMain.handle('get-creations-by-order-id', async (event, orderId) => {
		console.log('get-creations-by-order-id', orderId);
		return await getCreationsByOrderId(orderId);
	});

	ipcMain.handle('get-creations-by-order-number', async (event, orderNumber) => {
		console.log('get-creations-by-order-number', orderNumber);
		return await getCreationsByOrderNumber(orderNumber);
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

	ipcMain.on('fetch-creation-page', async (event, creationInfo) => {
		console.log('fetch-creation-page', creationInfo);
		const { link, id } = creationInfo;
		console.log('destructured', link, id);
		getCreationPage(link, id);
	});

	ipcMain.on('save-creation-data', async (event, data) => {
		const db = getDB();
		const { description, tags, id } = data;

		// Check if the row already exists
		db.get('SELECT * FROM creations WHERE id = ?', [id], (err, row) => {
			if (err) {
				throw err;
			}
			if (row) {
				// If the row does not exist, insert a new row
				const sql = `
					INSERT OR REPLACE INTO creations (id, name, link, thumbnail, creator, description, tags, order_id, order_number)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
				`;
				const params = [row.id, row.name, row.link, row.thumbnail, row.creator, description, tags, row.order_id, row.order_number];
				db.run(sql, params, (err) => {
					if (err) {
						throw err;
					}
					event.reply('save-creation-data-reply');
				});
			} else {
				console.log('Row does not exist:', row);
			}
		});

		closeDB(db);
	});

	ipcMain.on('save-files-data', async (event, data) => {
		const db = getDB();


		closeDB(db);
	});

	ipcMain.handle('test-session-token', async (event, token) => {
		return testToken();
	});
};

module.exports = { setupIpcHandlers };
