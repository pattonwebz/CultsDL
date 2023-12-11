const { net, BrowserWindow } = require('electron');
const { getSessionToken } = require('./userDataStore');
const { CONSTANTS } = require('./constants');
const { BASE_URL } = CONSTANTS;

const cache = require('./cache');
const requestPage = require('./requests/pageRequests');
const ipcRenderer = require('electron').ipcRenderer;

const fetchOrders = async (url = '') => {
	const pageToRequest = url || BASE_URL + '/en/orders';
	// console.log('fetchOrders', pageToRequest);

	await requestPage(pageToRequest).then((body) => {
		// console.log('fetchOrders body', body);
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
