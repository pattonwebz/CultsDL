const { net } = require('electron');
const { getSessionToken } = require('../userDataStore');
const cache = require('../cache');

function isValidUrl (url) {
	try {
		new URL(url);
		return true;
	} catch (_) {
		return false;
	}
}

function looseLoggedInCheck (html) {
	if (html && !(html.includes('/users/sign_in'))) {
		return true;
	}
	return false;
}

const requestPage = (url) => {
	return new Promise((resolve, reject) => {
		if (!url) {
			console.error('No page to request');
			reject('No page to request');
			return;
		}
		if (!isValidUrl(url)) {
			console.error('Invalid page to request, maybe this is private??');
			reject('Invalid page to request');
			return;
		}

		const cachedBody = cache.getSync(url);
		if (cachedBody) {
			console.log('Loaded data from cache');
			resolve(cachedBody);
			return;
		}

		const request = net.request({
			method: 'GET',
			url,
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
				if (!looseLoggedInCheck(body)) {
					console.error('Not logged in when fetching', url);
					reject('Not logged in when fetching');
					return;
				}
				// Save data to the cache
				cache.setSync(url, body);
				resolve(body); // Resolve the promise with body
			});
		});

		request.on('error', (error) => {
			console.error(`Error: ${error.message}`);
			reject(error.message);
		});

		request.end();
	});
};

module.exports = requestPage;
