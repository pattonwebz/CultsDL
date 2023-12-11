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
	return new Promise(async (resolve, reject) => {
		console.log(url);
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
			// wait 0.5 seconds before moving on
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log('Loaded data from cache');
			resolve(cachedBody);
			return;
		}

		// since we are making a request to an outside server and they may
		// block us if we make too many requests, we will add a random delay

		const min = Math.ceil(300);
		const max = Math.floor(2000);
		const waitTime = Math.floor(Math.random() * (max - min + 1)) + min;
		await new Promise((resolve) => setTimeout(resolve, waitTime));

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
