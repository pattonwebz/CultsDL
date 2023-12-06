const CreationStatus = {
	NO_DATA_FETCHED: 'NO_DATA_FETCHED',
	FILE_DATA_FETCHED: 'FILE_DATA_FETCHED',
	CREATION_DATA_FETCHED: 'COMPLETE'
};

const checkIfTableExists = (db, tableName) => {
	db.get('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=?', [tableName], (err, row) => {
		if (err) {
			console.error(err.message);
			throw err;
		}
		if (row) {
			console.log(`Table ${tableName} exists.`);
			return true;
		}
		console.log(`Table ${tableName} does not exist.`);
		return false;
	});
};

const maybeCreateDatabase = (db) => {
	if (!checkIfTableExists(db, 'orders')) {
		createDatabase(db);
	}
};

const createDatabase = (db) => {
	db.serialize(() => {
		// Create 'orders' table
		db.run(`CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY,
			order_number INTEGER NOT NULL,
			order_date TEXT NOT NULL,
			order_status TEXT NOT NULL DEFAULT '',
			order_total TEXT NOT NULL DEFAULT '',
			order_link TEXT NOT NULL DEFAULT '',
			order_downloaded INTEGER NOT NULL DEFAULT 0
		  )`, (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log("'orders' table created.");
		});

		// Create 'creations' table
		db.run(`CREATE TABLE IF NOT EXISTS creations (
			id INTEGER PRIMARY KEY,
			creation_name TEXT NOT NULL DEFAULT '',
			creation_link TEXT NOT NULL DEFAULT '',
			creation_thumbnail TEXT NOT NULL DEFAULT '',
			creation_downloaded INTEGER NOT NULL DEFAULT 0,
			creation_creator TEXT NOT NULL DEFAULT '',
			creation_description TEXT NOT NULL DEFAULT '',
			creation_tags BLOB NOT NULL DEFAULT '[]',
			creation_status TEXT NOT NULL DEFAULT '${CreationStatus.NO_DATA_FETCHED}' CHECK(creation_status IN ('${CreationStatus.NO_DATA_FETCHED}', '${CreationStatus.FILE_DATA_FETCHED}', '${CreationStatus.CREATION_DATA_FETCHED}')),
			creation_unlisted INTEGER NOT NULL DEFAULT 0,
		    creation_order_id INTEGER NOT NULL,
			FOREIGN KEY(creation_order_id) REFERENCES orders(id)
		)`, (err) => {
			if (err) {
				console.error(err.message);
			}
			console.log("'creations' table created.");
		});

		// Create 'files' table
		db.run(`CREATE TABLE IF NOT EXISTS files (
			id INTEGER PRIMARY KEY,
			file_name TEXT NOT NULL DEFAULT '',
			file_url TEXT NOT NULL DEFAULT '',
			file_downloaded INTEGER NOT NULL DEFAULT 0,
			file_creation_id INTEGER NOT NULL,
			FOREIGN KEY(file_creation_id) REFERENCES creations(id)
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
				WHEN NEW.creation_status NOT IN ('${CreationStatus.NO_DATA_FETCHED}', '${CreationStatus.DATA_FETCHED_NOT_DOWNLOADED}', '${CreationStatus.DOWNLOADED}') THEN
				RAISE (ABORT, 'Invalid creation_status')
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
		console.log('Close the database connection.');
	});
};

module.exports = {
	maybeCreateDatabase
};
