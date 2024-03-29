// Server/fetchPages.js
const { net, BrowserWindow } = require('electron');
const cache = require('./cache');
const { getSessionToken } = require('./userDataStore');

const logger = require('./logger/logger');

const getDownloadPages = (url = '', orderNumber, creations) => {
	const pageToRequest = url;

	if (pageToRequest === '') {
		return;
	}

	// Try to read from the cache
	const data = cache.getSync(pageToRequest);
	if (data) {
		logger.debug('Loaded data from cache');
		BrowserWindow.getFocusedWindow().webContents.send('fetch-download-page-reply', data, orderNumber, creations);
		return;
	}

	const request = net.request({
		method: 'GET',
		url: pageToRequest,
		headers: {
			Cookie: '_session_id=' + getSessionToken()
		}
	});

	let body = '';
	request.on('response', (response) => {
		response.on('data', (chunk) => {
			body += chunk;
		});
		response.on('end', () => {
			// Save data to the cache
			cache.setSync(pageToRequest, body, 60 * 60 * 24 * 7);
			BrowserWindow.getFocusedWindow().webContents.send('fetch-download-page-reply', body, orderNumber);
		});
	});
	request.end();
};

module.exports = getDownloadPages;
