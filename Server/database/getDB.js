const sqlite3 = require('sqlite3').verbose();

const { CONSTANTS } = require('../constants');
const { DATABASE_DIR } = CONSTANTS;

const getDB = () => {
	return new sqlite3.Database(DATABASE_DIR + '/cults.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
		if (err) {
			console.error(err.message);
		}
	});
};

const closeDB = (db) => {
	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
	});
};

module.exports = {
	getDB,
	closeDB
};
