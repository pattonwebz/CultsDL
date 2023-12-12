const { getDB, closeDB } = require('./getDB');

const logger = require('../logger/logger');

const getCultsCreationNumber = (link) => {
	const url = new URL(link);

	// Split the pathname into components
	const pathComponents = url.pathname.split('/');

	// Find the first component that is a number
	const firstNumber = pathComponents.find(component => /^\d+$/.test(component));

	return firstNumber;
};

const getCultsBlueprintNumber = (link) => {
	const url = new URL(link);
	const params = new URLSearchParams(url.search);

	const blueprint = params.get('blueprint');

	return blueprint;
};

async function addFileToDatabase (file) {
	const dataToInsert = {
		name: file.fileData.fileName,
		url: file.link,
		creation_id: file.creationId || null,
		order_id: file.orderId,
		file_size: file.fileData.size,
		slug: file.creationName

	};

	dataToInsert.cults_creation_number = getCultsCreationNumber(file.link);
	dataToInsert.cults_blueprint_number = getCultsBlueprintNumber(file.link);

	logger.debug('addFileToDatabase', { message: file });
	logger.debug('addFileToDatabase', { message: dataToInsert });

	const db = getDB();

	// Check if an item with the same order_id, size, and name exists
	db.get(
		'SELECT * FROM files WHERE name = ? AND order_id = ? AND file_size = ?',
		[dataToInsert.name, dataToInsert.order_id, dataToInsert.file_size],
		(err, row) => {
			if (err) {
				return console.error(err.message);
			}
			// If the row exists, an item with the same order_id, size, and name already exists
			if (row) {
				console.log('An item with the same order_id, size, and name already exists.');
				return;
			}

			// If the row does not exist, insert the new item
			db.run(
				'INSERT INTO files (name, url, creation_id, order_id, file_size, slugified_creation_name, cults_creation_number, cults_blueprint_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
				[dataToInsert.name, dataToInsert.url, dataToInsert.creation_id, dataToInsert.order_id, dataToInsert.file_size, dataToInsert.slug, dataToInsert.cults_creation_number, dataToInsert.cults_blueprint_number],
				function (err) {
					if (err) {
						return console.error(err.message);
					}
					console.log(`A row has been inserted with rowid ${this.lastID}`);
				}
			);
		}
	);
	closeDB(db);
}

const getAllFileRows = async () => {
	const db = getDB();
	const files = await new Promise((resolve, reject) => {
		db.all('SELECT * FROM files', [], (err, rows) => {
			if (err) {
				reject(err);
				throw err;
			}
			resolve(rows);
		});
	});
	return files;
};

const addCreationIdToFileByFileId = async (fileIds, creationId) => {
	// convert fileId to strings seporated by commas
	const stringOfFileIds = '(' + fileIds.join(',') + ')';
	console.log(stringOfFileIds);

	const db = getDB();
	const sql = `UPDATE files SET creation_id = ? WHERE id IN (${fileIds.join(',')})`;
	const params = [creationId];
	db.run(sql, params, (err) => {
		if (err) {
			throw err;
		}
	});
	closeDB(db);
};

module.exports = {
	addFileToDatabase,
	getAllFileRows,
	addCreationIdToFileByFileId
};
