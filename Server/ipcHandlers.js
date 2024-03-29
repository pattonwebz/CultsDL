// ipcHandlers.js
const { ipcMain } = require('electron');
const { getSessionToken, saveSessionToken, getUserData, saveDownloadDirectory, getDebug, saveDebug } = require('./userDataStore');
const getOrders = require('./fetchOrders');
const cache = require('./cache');
const { writeFile, existsSync, mkdirSync, readFileSync } = require('fs');
const { join } = require('path');
const getOrdersFromFile = require('./getOrdersFromFile');
const getDownloadPages = require('./fetchDownloadItems');

const { CONSTANTS } = require('./constants');
const { DATA_DIR, BASE_URL } = CONSTANTS;

const { getDB, closeDB } = require('./database/getDB');
const allOrderPagesParsed = require('./database/allOrderPagesParsed');
const getOrdersWithCreations = require('./database/getOrdersWithCreations');
const { getOrderById } = require('./database/getOrderByX');
const { getCreationsByOrderId, getCreationsByOrderNumber, getAllCreations} = require('./database/getCreationByX');
const getCreationPage = require('./fetchCreationExtraData');
const requestPage = require('./requests/pageRequests');
const testToken = require('./testSessionToken');
const { createDataDirectories, maybeCreateDb } = require('./initialSetup');
const { getAllFileRows, addCreationIdToFileByFileId } = require('./database/addFile');
const logger = require('./logger/logger');
const {getRowsByColumnWhereValue} = require('./database/getRowInColumnByValue');

const setupIpcHandlers = () => {
	ipcMain.handle('install', (event, arg) => {
		createDataDirectories();
		maybeCreateDb();
		return true;
	});

	ipcMain.on('requestSessionToken', (event) => {
		event.reply('sessionToken', getSessionToken());
	});

	ipcMain.on('requestUserData', (event) => {
		event.reply('userData-reply', getUserData());
	});

	ipcMain.on('saveSessionToken', (event, token) => {
		saveSessionToken(token);
	});

	ipcMain.on('saveDownloadDirectory', (event, directory) => {
		saveDownloadDirectory(directory);
	});

	ipcMain.on('saveDebug', (event, debug) => {
		saveDebug(debug);
	});

	ipcMain.on('fetch-orders', async (event, url = '') => {
		getOrders(url);
	});

	ipcMain.on('get-cache', async (event, url = '') => {
		const data = cache.getSync(url);
		event.reply('get-cache-reply', data);
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
				logger.info('Adding order: ', { message: order.number });
				allOrders.push(order);
			} else {
				logger.warn('Order already exists: ', { message: order.number });
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

	ipcMain.handle('get-html-body', async (event, url = '') => {
		return await requestPage(url);
	});

	// get the order from database with the orderNumber matching the item id
	ipcMain.handle('get-order-by-id', async (event, itemId) => {
		const order = await getOrderById(itemId);

		const creations = await getCreationsByOrderId(order.id);

		return order;
	});

	ipcMain.handle('get-creations-by-order-id', async (event, orderId) => {
		logger.info('get-creations-by-order-id', orderId);
		return await getCreationsByOrderId(orderId);
	});

	ipcMain.handle('get-creations-by-order-number', async (event, orderNumber) => {
		logger.info('get-creations-by-order-number', orderNumber);
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

	ipcMain.on('get-orders-with-creations', async (event, ids = []) => {
		const orders = await getOrdersWithCreations(ids);
		event.reply('get-orders-with-creations-reply', orders);
	});

	ipcMain.handle('fetch-creation-page', async (event, creationInfo) => {
		const { link, id } = creationInfo;

		const data = await getCreationPage(link, id);
		return data;
	});

	ipcMain.handle('save-creation-data', async (event, data) => {
		const db = getDB();
		const { images, description, tags, id } = data;
		let saved = false;

		logger.info('save-creation-data', { message: data });
		logger.info('save-creation-data', { message: images, description, tags, id });

		// Check if the row already exists
		db.get('SELECT * FROM creations WHERE id = ?', [id], (err, row) => {
			if (err) {
				logger.error('Error getting row', { message: err })
				throw err;
			}
			if (row) {
				// If the row does not exist, insert a new row
				const sql = `
					INSERT OR REPLACE INTO creations (id, name, link, thumbnail, images, creator, description, tags, order_id, order_number)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				`;
				const params = [row.id, row.name, row.link, row.thumbnail, images, row.creator, description, tags, row.order_id, row.order_number];
				db.run(sql, params, (err) => {
					if (err) {
						throw err;
					}
					saved = true;
				});
			} else {
				logger.debug('Row does not exist:', { message: row });
			}
		});

		closeDB(db);
		return saved;
	});

	ipcMain.on('save-files-data', async (event, data) => {
		const db = getDB();

		closeDB(db);
	});

	ipcMain.handle('test-session-token', async (event, token) => {
		return testToken();
	});

	ipcMain.handle('get-all-files', async (event) => {
		let rowsToSendBack = [];
		const rows = await getAllFileRows().then((rows) => {
			logger.info('getAllFileRows', { message: rows});
			rowsToSendBack = rows;
		});
		return rowsToSendBack;
	});

	ipcMain.handle('get-orders-with-creations', async (event, orderIds) => {

	});

	ipcMain.on('add-creation-to-file-in-database', async (event, data) => {
		logger.info('add-creation-to-file-in-database', { message: data });
		await addCreationIdToFileByFileId(data.selectedFileIds, data.selectedCreationId);
		event.reply('add-creation-to-file-in-database-reply', true);
	});

	ipcMain.on('clear-cache-for-first-order-page', async (event) => {
		await cache.deleteSync(BASE_URL + '/en/orders');
		event.reply('cache-cleared', true);
	});

	ipcMain.on('clear-cache', async (event, type = 'all') => {
		switch (type) {
			case 'all':
				await cache.clear();
				break;
			case 'first-order-page':
				console.log('clearing first order page');
				await cache.remove(BASE_URL + '/en/orders');
				break;
			default:
				await cache.clear();
				break;
		}
		event.reply('cache-cleared', { cleared: true, type });
	});

	ipcMain.handle('get-creations-with-files', async (event) => {
		// Fetch all creations from the database
		const creations = await getAllCreations();
		//logger.info('getAllCreations', {message: creations});
		//console.log('gotcrat', creations);

		// For each creation, fetch the associated files and add them to the creation object
		for (const creation of creations) {
			const files = await getRowsByColumnWhereValue('files', 'creation_id', creation.id);
			console.log('files', files);
			creation.files = files;
		}

		// Return the creations with their associated files
		console.log('creations', creations.length);
		return creations;
	});
};

module.exports = { setupIpcHandlers };
