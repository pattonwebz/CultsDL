// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const { getSessionToken, getUserData } = require('./Server/userDataStore');

const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');

const { setupIpcHandlers } = require('./Server/ipcHandlers');

const { session } = require('electron');
const { createDataDirectories, maybeCreateDb } = require('./Server/initialSetup');

const { CONSTANTS } = require('./Server/constants');
const { DOWNLOAD_DIR } = CONSTANTS;

let cookieSet = false;
const downloadQueue = [];
let isDownloading = false;

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

	ipcMain.handle('download-url', (_, url) => {
		win.webContents.downloadURL(url);
	});

	ipcMain.handle('download-progress', (_, data) => {
		win.webContents.send('download-progress', data);
	});

	win.webContents.on('did-finish-load', () => {
		// const sessionToken = getUserData('sessionToken');
		// win.webContents.send('sessionToken', sessionToken);
		// const downloadDir = getUserData('downloadDirectory');
		// win.webContents.send('downloadDirectory', downloadDir);

		trySetCookie();

		ipcMain.on('download-file', (event, data) => {
			console.log('download-file', data);
			downloadQueue.push(data);
			if (!isDownloading) {
				startNextDownload();
			}
		});
	});

	function startNextDownload () {
		if (downloadQueue.length > 0) {
			const downloadData = downloadQueue.shift();
			isDownloading = true;
			win.webContents.downloadURL(downloadData.link);
		} else {
			win.webContents.send('download-progress', {
				totalInQueue: downloadQueue.length,
				progress: 0,
				fileName: ''
			});
		}
	}

	session.defaultSession.on('will-download', (event, downloadItem, webContents) => {
		if (!cookieSet) {
			trySetCookie();
		}
		console.log('will-download', downloadItem.getFilename());
		// Set the save path, making Electron not to prompt a save dialog.
		const userSavedDownloadDirectory = getUserData('downloadDirectory');
		const downloadsDir = userSavedDownloadDirectory !== '' ? userSavedDownloadDirectory : DOWNLOAD_DIR;

		console.log('downloadsDir', downloadsDir);

		if (!existsSync(downloadsDir)) {
			console.log('creating downloads dir');
			mkdirSync(downloadsDir);
		}

		console.log('downloadsDir', downloadsDir);
		const filePath = downloadsDir + '/' + downloadItem.getFilename();

		downloadItem.setSavePath(filePath);

		downloadItem.on('updated', (event, state) => {
			if (state === 'interrupted') {
				console.log('Download is interrupted but can be resumed');
			} else if (state === 'progressing') {
				if (downloadItem.isPaused()) {
					console.log('Download is paused');
				} else {
					const progress = downloadItem.getReceivedBytes() / downloadItem.getTotalBytes();
					const fileName = downloadItem.getFilename();

					webContents.send('download-progress', {
						totalInQueue: downloadQueue.length,
						progress: progress * 100,
						fileName
					});
					console.log(`Received bytes: ${downloadItem.getReceivedBytes()}`);
				}
			}
		});

		downloadItem.once('done', (event, state) => {
			if (state === 'completed') {
				console.log('Download successfully');
			} else {
				console.log(`Download failed: ${state}`);
			}
			isDownloading = false;
			startNextDownload();
		});
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
