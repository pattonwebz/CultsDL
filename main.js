// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const { getSessionToken } = require('./Server/userDataStore');

const { join } = require('path');
const { setupIpcHandlers } = require('./Server/ipcHandlers');

const { session } = require('electron');
const { createDataDirectories, maybeCreateDb } = require('./Server/initialSetup');

let cookieSet = false;

let win;

const getWin = () => {
	return win;
};

function createWindow () {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true,
			preload: join(__dirname, 'preload.js'),
			contextIsolation: true // contextIsolation must be enabled
		},
		autoHideMenuBar: true
	});

	win.loadFile('index.html')
		.then(() => {
			console.log('index.html loaded');
		});

	ipcMain.on('trySetCookie', () => {
		trySetCookie();
	});

	ipcMain.handle('getWin', () => {
		return getWin();
	});
}
function trySetCookie () {
	const sessionToken = getSessionToken();
	if (!sessionToken) {
		console.log('no token to set in cookie');
		return;
	}

	if (cookieSet) {
		console.log('cookie already set');
		return;
	}

	const cookie = { url: 'https://cults3d.com', name: '_session_id', value: getSessionToken() };

	// I don't know how to handle cookie expiry, so I just remove it and set it again
	session.defaultSession.cookies.remove(cookie.url, cookie.name)
		.then(() => {
			console.log('Cookie removed successfully');
			session.defaultSession.cookies.set(cookie)
				.then(() => {
					cookieSet = true;
					console.log('Cookie set successfully');
				}, (error) => {
					console.error('Failed to set cookie:', error);
				});
		}, (error) => {
			console.error('Failed to remove cookie:', error);
		});
}

app.whenReady().then(() => {
	trySetCookie();
	createWindow();
	createDataDirectories();
	maybeCreateDb();
	setupIpcHandlers();
});

module.exports = {
	getWin,
	createWindow
};
