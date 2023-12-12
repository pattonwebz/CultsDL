const { net } = require('electron');
const { getSessionToken } = require('./userDataStore');


const cache = require('./cache');
const logger = require('./logger/logger');

const getCreationPage = async (url = '', id) => {
	const pageToRequest = url;

	if (!pageToRequest || !id) {
		logger.error('No page to request');
		return;
	}

	if (!pageToRequest.includes('https://cults3d.com')) {
		logger.warn('Invalid page to request, maybe this is private??', { message:pageToRequest });
		return;
	}

	// Try to read from the cache
	const htmlFromCache = cache.getSync(pageToRequest);
	if (htmlFromCache) {
		logger.debug('Loaded data from cache', { message: pageToRequest });
		return {
			html: htmlFromCache,
			id
		};
	}

	const request = net.request({
		method: 'GET',
		url: pageToRequest,
		headers: {
			Cookie: '_session_id=' + getSessionToken()
		}
	});

	let body = '';
	let dataToReturn = {};
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
			dataToReturn = data;
		});
	});
	request.on('finish', () => {
		return dataToReturn;
	});

	request.end();
	return dataToReturn;
};

module.exports = getCreationPage;
