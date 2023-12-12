const sqlite3 = require('sqlite3').verbose();

const { CONSTANTS } = require('../constants');
const { DATABASE_DIR } = CONSTANTS;

const logger = require('../logger/logger');

const getDB = () => {
	return new sqlite3.Database(DATABASE_DIR + '/cults.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
		if (err) {
			logger.error(err.message);
			throw err;
		}
	});
};

const closeDB = (db) => {
	db.close((err) => {
		if (err) {
			logger.error(err.message);
			throw err;
		}
	});
};

module.exports = {
	getDB,
	closeDB
};
