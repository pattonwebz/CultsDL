const fs = require('fs');
const path = require('path');
const { CONSTANTS } = require('./constants');
const { DATA_DIR, CACHE_DIR, DOWNLOAD_DIR, DATABASE_DIR } = CONSTANTS;
const { getDB } = require('./database/getDB');
const { maybeCreateDatabase } = require('./database/create');

// Define the directories to create
const directories = [
	path.dirname(DATA_DIR),
	DATA_DIR,
	CACHE_DIR,
	DATABASE_DIR,
	DOWNLOAD_DIR
];

const createDataDirectories = (dir) => {
// Create the directories if they don't exist
	directories.forEach((dir) => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	});
};

const maybeCreateDb = () => {
	// closes itself
	maybeCreateDatabase(getDB());
};

module.exports = {
	createDataDirectories,
	maybeCreateDb
};
