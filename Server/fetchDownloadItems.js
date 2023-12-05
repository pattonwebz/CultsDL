// Server/fetchPages.js
const { net, BrowserWindow } = require('electron');
const cache = require('./cache');
const { getSessionToken } = require('./userDataStore');

const getDownloadPages = (url = '', orderNumber) => {
	const pageToRequest = url;

	if (pageToRequest === '') {
		return;
	}

	// Try to read from the cache
	const data = cache.getSync(pageToRequest);
	if (data) {
		console.log('Loaded data from cache');
		BrowserWindow.getFocusedWindow().webContents.send('fetch-download-page-reply', data, orderNumber);
		return;
	} else {
		console.log('No data in cache');
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
