const CreationStatus = {
	NO_DATA_FETCHED: 'NO_DATA_FETCHED',
	FILE_DATA_FETCHED: 'FILE_DATA_FETCHED',
	CREATION_DATA_FETCHED: 'COMPLETE'
};

const checkIfTableExists = (db, tableName) => {
	return new Promise((resolve, reject) => {
		db.get('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=?', [tableName], (err, row) => {
			if (err) {
				console.error(err.message);
				reject(err);
			}
			if (row) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
};

const maybeCreateDatabase = async (db) => {
	if (!await checkIfTableExists(db, 'orders')) {
		createDatabase(db);
	}
};

const createDatabase = (db) => {
	db.serialize(() => {
		// Create 'orders' table
		db.run(`CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY,
			number INTEGER NOT NULL,
			date TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT '',
			price TEXT NOT NULL DEFAULT '',
			link TEXT NOT NULL DEFAULT '',
			downloaded_all_creations INTEGER NOT NULL DEFAULT 0
		  )`, (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log("'orders' table created.");
		});

		// Create 'creations' table
		db.run(`CREATE TABLE IF NOT EXISTS creations (
			id INTEGER PRIMARY KEY,
			name TEXT NOT NULL DEFAULT '',
			link TEXT NOT NULL DEFAULT '',
			thumbnail TEXT NOT NULL DEFAULT '',
			downloaded_all_files INTEGER NOT NULL DEFAULT 0,
			creator TEXT NOT NULL DEFAULT '',
			description TEXT NOT NULL DEFAULT '',
			tags BLOB NOT NULL DEFAULT '[]',
			status TEXT NOT NULL DEFAULT '${CreationStatus.NO_DATA_FETCHED}' CHECK(status IN ('${CreationStatus.NO_DATA_FETCHED}', '${CreationStatus.FILE_DATA_FETCHED}', '${CreationStatus.CREATION_DATA_FETCHED}')),
			unlisted INTEGER NOT NULL DEFAULT 0,
		    order_id INTEGER NOT NULL,
    		order_number INTEGER NOT NULL,
			FOREIGN KEY(order_id) REFERENCES orders(id)
		)`, (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log("'creations' table created.");
		});

		// Create 'files' table
		db.run(`CREATE TABLE IF NOT EXISTS files (
			id INTEGER PRIMARY KEY,
			name TEXT NOT NULL DEFAULT '',
			url TEXT NOT NULL DEFAULT '',
			downloaded INTEGER NOT NULL DEFAULT 0,
			creation_id INTEGER NOT NULL,
			order_id INTEGER NOT NULL,
			FOREIGN KEY(creation_id) REFERENCES creations(id),
    		FOREIGN KEY(order_id) REFERENCES orders(id)
		)`, (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log("'files' table created.");
		});

		db.run(`CREATE TRIGGER check_creation_status
			BEFORE INSERT ON creations
			BEGIN
			  SELECT CASE
				WHEN NEW.status NOT IN ('${CreationStatus.NO_DATA_FETCHED}', '${CreationStatus.DATA_FETCHED_NOT_DOWNLOADED}', '${CreationStatus.DOWNLOADED}') THEN
				RAISE (ABORT, 'Invalid status')
			  END;
			END;
		`, (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log("Trigger 'check_creation_status' created.");
		});
	});

	db.close((err) => {
		if (err) {
			console.error(err.message);
		}
	});
};

module.exports = {
	maybeCreateDatabase
};
