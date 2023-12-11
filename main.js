// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const { getSessionToken, getUserData } = require('./Server/userDataStore');
const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');
const { setupIpcHandlers } = require('./Server/ipcHandlers');
const { session } = require('electron');
const { CONSTANTS } = require('./Server/constants');
const { addFileToDatabase } = require('./Server/database/addFile');
const { getDB } = require('./Server/database/getDB');
const { DOWNLOAD_DIR } = CONSTANTS;

let cookieSet = false;
const downloadQueue = [];
let isDownloading = false;

let currentDownload = null;
let allowFullDownloads = false;
let win = null;

const getWin = () => {
	return win;
};

function createWindow () {
	win = new BrowserWindow({
		width: 1000,
		height: 800,
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
			event.reply('download-queue-reply', downloadQueue.length);
		});

		ipcMain.on('start-download-queue', () => {
			if (!isDownloading) {
				startNextDownload();
			}
		});
	});

	async function startNextDownload () {
		ipcMain.emit('download-queue-reply', downloadQueue.length);
		if (downloadQueue.length > 0) {
			const downloadData = downloadQueue.shift();

			function isFileDownloaded (db, url) {
				return new Promise((resolve, reject) => {
					db.get(
						'SELECT * FROM files WHERE url = ?',
						[url],
						function (err, row) {
							if (err) {
								reject(err);
							}
							// If the row exists, the file has already been downloaded
							resolve(!!row);
						}
					);
				});
			}

			if (!allowFullDownloads) {
				const isAlreadyInDB = async (link) => {
					// check the files table to see if this file has already been downloaded
					// the link shold be unique and have no entry in the files table  `url` column
					isFileDownloaded(getDB(), link).then(async (isDownloaded) => {
						if (isDownloaded) {
							console.log('File already downloaded', link);
							await startNextDownload();
						} else {
							isDownloading = true;
							console.log('startNextDownload', downloadData);

							ipcMain.emit('current-download', downloadData);
							currentDownload = downloadData;
							// add a small delay be kind to the server
							await new Promise((resolve) => {
								setTimeout(() => {
									resolve();
								}, 200);
							});
							console.log('downloadData', downloadData);
							await win.webContents.downloadURL(downloadData.link);
						}
					});
				};
				await isAlreadyInDB(downloadData.link);
			} else {
				const downloadData = downloadQueue.shift();
				currentDownload = downloadData;
				await win.webContents.downloadURL(downloadData.link);
			}
		} else {
			win.webContents.send('download-progress', {
				totalInQueue: downloadQueue.length,
				progress: 0,
				fileName: ''
			});
			ipcMain.emit('download-queue-emptied', downloadQueue.length);
		}
	}

	session.defaultSession.on('will-download', async (event, downloadItem, webContents) => {
		if (!cookieSet) {
			trySetCookie();
		}
		// console.log('will-download', downloadItem.getFilename());
		// Set the save path, making Electron notdownloadData to prompt a save dialog.
		const userSavedDownloadDirectory = getUserData('downloadDirectory');
		const downloadsDir = userSavedDownloadDirectory !== '' ? userSavedDownloadDirectory : DOWNLOAD_DIR;

		if (!existsSync(downloadsDir)) {
			mkdirSync(downloadsDir);
		}

		const downloadData = {
			fileName: downloadItem.getFilename(),
			size: downloadItem.getTotalBytes()
		};

		let maybeCreatorAndCreation = '';
		if (allowFullDownloads) {
			if (!existsSync(downloadsDir + '/' + currentDownload.creator_name)) {
				mkdirSync(downloadsDir + '/' + currentDownload.creator_name);
			}
			if (!existsSync(downloadsDir + '/' + currentDownload.creator_name + '/' + currentDownload.creation_name)) {
				mkdirSync(downloadsDir + '/' + currentDownload.creator_name + '/' + currentDownload.creation_name);
			}
			maybeCreatorAndCreation = currentDownload.creator_name + '/' + currentDownload.creation_name + '/';
		}

		const filePath = downloadsDir + '/' + maybeCreatorAndCreation + downloadItem.getFilename();
		console.log('filePath', filePath);

		// check if the filepath already exists

		downloadItem.setSavePath(filePath);

		downloadData.path = downloadItem.getSavePath();

		currentDownload.fileData = downloadData;
		ipcMain.emit('download-started', downloadData);
		console.log('\n\n\n');
		// console.log('currentDownload', currentDownload);
		if (!allowFullDownloads) {
			addFileToDatabase(currentDownload);
		}

		console.log('downloadItem', downloadData);

		if (!allowFullDownloads || existsSync(filePath)) {
			event.preventDefault();
		}

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
		return;
	}

	const cookie = { url: 'https://cults3d.com', name: '_session_id', value: getSessionToken() };

	// I don't know how to handle cookie expiry, so I just remove it and set it again
	session.defaultSession.cookies.remove(cookie.url, cookie.name)
		.then(() => {
			session.defaultSession.cookies.set(cookie)
				.then(() => {
					cookieSet = true;
				}, (error) => {
					console.error('Failed to set cookie:', error);
				});
		}, (error) => {
			console.error('Failed to remove cookie:', error);
		});

	ipcMain.on('enable-full-download', () => {
		allowFullDownloads = true;
	});
}

app.whenReady().then(() => {
	trySetCookie();
	createWindow();
	setupIpcHandlers();
});
