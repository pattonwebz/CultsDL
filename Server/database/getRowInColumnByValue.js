const { getDB, closeDB } = require('./getDB');

const allowedTables = ['orders', 'creations', 'files'];

/*
 * getOrderByColumn
 * @param {string} table - the table to query
 * @param {string} column - the column to query
 * @param {string|number|blob} value - the value to query
 * @param {number} limit - the limit of the query - default 500
 */
const getRowsByColumnWhereValue = async (table = 'orders', column = 'number', value = 0, limit = 500) => {
	console.log('getRowsByColumnWhereValue: ', table, column, value);
	console.log(allowedTables.includes(table));
	if (!allowedTables.includes(table) || !column || value === 0) {
		console.log('returning null');
		return null;
	}
	console.log('getRowsByColumnWhereValue: ', table, column, value);
	const db = getDB();
	const queryReply = new Promise((resolve, reject) => {
		db.get(`SELECT * FROM ${table} WHERE ${column} = ?`, [value], (err, row) => {
			if (err) {
				console.log('Error getting order by column: ', err);
				reject(err);
			} else {
				console.log('Got order by column: ', row);
				resolve(row);
			}
		});
	});
	closeDB(db);
	return queryReply;
};

module.exports = { getRowsByColumnWhereValue };
