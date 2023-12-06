// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
	ipcRenderer: {
		send: (channel, ...args) => { ipcRenderer.send(channel, ...args); },
		on: (channel, ...func) => ipcRenderer.on(channel, ...func),
		once: (channel, ...func) => ipcRenderer.once(channel, ...func),
		invoke: (channel, data) => ipcRenderer.invoke(channel, data)
	},
	receive: (channel, func) => {
		ipcRenderer.on(channel, (event, ...args) => func(...args));
	}
});
