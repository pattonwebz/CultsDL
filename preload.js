// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: {
		send: (channel, ...args) => { ipcRenderer.send(channel, ...args); },
		on: (channel, ...func) => ipcRenderer.on(channel, ...func),
		once: (channel, ...func) => ipcRenderer.once(channel, ...func)
	},
	receive: (channel, func) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	}
});
