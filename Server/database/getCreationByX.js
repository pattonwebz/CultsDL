const { getRowsByColumnWhereValue } = require('./getRowInColumnByValue');
const { getDB, closeDB } = require('./getDB');
const { info } = require('../logger/logger');

const getCreationsByX = async (column = 'order_number', value = 0, limit = 500) => {
	if (!column || !value) {
		return null;
	}
	return getRowsByColumnWhereValue('creations', column, value, limit);
};

const getCreationsById = async (id, limit = 500) => {
	if (!id || id === 0) {
		return null;
	}
	return getCreationsByX('id', id, limit);
};

const getCreationById = async (id) => {
	return getCreationsByX('id', id, 1);
};

const getCreationsByOrderId = async (orderId, limit = 500) => {
	return getCreationsByX('order_id', orderId, limit);
};

const getCreationsByOrderNumber = async (orderNumber) => {
	return getCreationsByX('order_number', orderNumber);
};

const getAllCreations = async () => {
	const db = getDB();
	const foundRows = await new Promise((resolve, reject) => {
		db.all('SELECT * FROM creations ', [], (err, rows) => {
			if (err) {
				reject(err);
			} else {
				resolve(rows);
			}
		});
	});

	closeDB(db);
	return foundRows;
};

module.exports = { getAllCreations, getCreationsByX, getCreationsById, getCreationById, getCreationsByOrderId, getCreationsByOrderNumber };
