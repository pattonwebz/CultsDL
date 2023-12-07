const { net, BrowserWindow } = require('electron');
const { getSessionToken } = require('./userDataStore');

const cache = require('./cache');

const getCreationPage = (url = '', id) => {
	const pageToRequest = url;

	if (!pageToRequest || !id) {
		console.error('No page to request');
		return;
	}

	if (!pageToRequest.includes('https://cults3d.com')) {
		console.error('Invalid page to request, maybe this is private??');
		return;
	}

	// Try to read from the cache
	const htmlFromCache = cache.getSync(pageToRequest);
	if (htmlFromCache) {
		console.log('Loaded data from cache');
		const data = {
			html: htmlFromCache,
			id
		};
		BrowserWindow.getFocusedWindow().webContents.send('fetch-creation-page-reply', data);
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
			cache.setSync(pageToRequest, body);
			const data = {
				html: htmlFromCache,
				id
			};
			BrowserWindow.getFocusedWindow().webContents.send('fetch-creation-page-reply', data);
		});
	});

	request.end();
};

module.exports = getCreationPage;
