// Server/fetchPages.js
const { net, BrowserWindow } = require('electron');
const { getSessionToken } = require('./userDataStore');

const testToken = async () => {
	const pageToRequest = 'https://cults3d.com/';
	const request = net.request({
		method: 'GET',
		url: pageToRequest,
		headers: {
			Cookie: '_session_id=' + getSessionToken()
		}
	});

	let tokenValid = false;

	let body = '';
	request.on('response', (response) => {
		response.on('data', (chunk) => {
			body += chunk;
		});
		response.on('end', () => {
			const foundLoginLink = body.includes('/users/sign-in');
			tokenValid = !foundLoginLink;
			BrowserWindow.getFocusedWindow().webContents.send('test-session-token-reply', tokenValid);
		});
	});
	request.end();
};

module.exports = testToken;
