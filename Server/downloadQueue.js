const { session } = require('electron');
const { getUserData } = require('./userDataStore');
const { CONSTANTS } = require('./constants');
const { DOWNLOAD_DIR } = CONSTANTS;

const { existsSync, mkdirSync } = require('fs');
const ipcRenderer = require('electron').ipcRenderer;

const win = ipcMain.invoke('getWin');
const downloadQueue = [];
let isDownloading = false;

function downloadFile (url) {
	downloadQueue.push(url);
	if (!isDownloading) {
		startNextDownload();
	}
}

function startNextDownload () {
	if (downloadQueue.length > 0) {
		const url = downloadQueue.shift();
		isDownloading = true;
		win.webContents.downloadURL(url);
	} else {
		win.webContents.send('download-progress', {
			totalInQueue: downloadQueue.length,
			progress: 0,
			fileName: ''
		});
	}
}

session.defaultSession.on('will-download', (event, downloadItem, webContents) => {
	ipcRenderer.send('trySetCookie');
	console.log('will-download', downloadItem.getFilename());
	// Set the save path, making Electron not to prompt a save dialog.
	const userSavedDownloadDirectory = getUserData('downloadDirectory');
	const downloadsDir = userSavedDownloadDirectory !== '' ? userSavedDownloadDirectory : DOWNLOAD_DIR;
	console.log(downloadsDir);
	console.log(CONSTANTS);
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

module.exports = { downloadFile };
