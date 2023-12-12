const { BrowserWindow } = require('electron');
const { CONSTANTS } = require('./constants');
const { BASE_URL } = CONSTANTS;

const cache = require('./cache');
const requestPage = require('./requests/pageRequests');

const logger = require('./logger/logger')

const fetchOrders = async (url = '') => {
	const pageToRequest = url || BASE_URL + '/en/orders';
	logger.debug('fetchOrders', { message: pageToRequest });

	await requestPage(pageToRequest).then((body) => {
		logger.debug('fetchOrders body', { message: body });
		cache.setSync(pageToRequest, body);
		// add a small delay to ensure body is complete before processing
		setTimeout(() => {
			const browserSessions = BrowserWindow.getAllWindows();
			browserSessions.forEach((win) => {
				win.webContents.send('fetch-orders-reply', body);
			});
		}, 20);
	});
};

module.exports = fetchOrders;
