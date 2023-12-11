let ordersFetchQueue = [];
let downloadPageFetchQueue = [];
let creationPageFetchQueue = [];

let fileDownloadQueue = [];

const events = new EventEmitter();

const getEventController = () => {
	return events;
};
const setOrdersFetchQueue = (queue) => {
	ordersFetchQueue = queue;
	getEventController().emit('ordersFetchQueueUpdated', ordersFetchQueue);
};

const getOrdersFetchQueue = () => {
	return ordersFetchQueue;
};

const setDownloadPageFetchQueue = (queue) => {
	downloadPageFetchQueue = queue;
	getEventController().emit('downloadPageFetchQueueUpdated', downloadPageFetchQueue);
};

const getDownloadPageFetchQueue = () => {
	return downloadPageFetchQueue;
};

const setCreationPageFetchQueue = (queue) => {
	creationPageFetchQueue = queue;
	getEventController().emit('creationPageFetchQueueUpdated', creationPageFetchQueue);
};

const getCreationPageFetchQueue = () => {
	return creationPageFetchQueue;
};

const setFileDownloadQueue = (queue) => {
	fileDownloadQueue = queue;
	getEventController().emit('fileDownloadQueueUpdated', fileDownloadQueue);
};

const getFileDownloadQueue = () => {
	return fileDownloadQueue;
};

module.exports = {
	getEventController,
	setOrdersFetchQueue,
	getOrdersFetchQueue,
	setDownloadPageFetchQueue,
	getDownloadPageFetchQueue,
	setCreationPageFetchQueue,
	getCreationPageFetchQueue,
	setFileDownloadQueue,
	getFileDownloadQueue
};
