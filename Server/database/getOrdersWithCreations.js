const { getDB } = require('./getDB');

const getOrdersWithCreations = async (ids = []) => {
	const db = getDB();

	// Fetch all orders
	let orders = await new Promise((resolve, reject) => {
		let sql = 'SELECT * FROM orders';
		if (ids.length > 0) {
			sql += ' WHERE id IN (' + ids.join(',') + ')';
		}

		db.all(sql, [], (err, rows) => {
			if (err) {
				reject(err);
			}
			resolve(rows);
		});
	});

	// Fetch all creations
	const creations = await new Promise((resolve, reject) => {
		db.all('SELECT * FROM creations', [], (err, rows) => {
			if (err) {
				reject(err);
			}
			resolve(rows);
		});
	});

	// Add creations to their respective orders
	orders = orders.map(order => {
		order.creations = creations.filter(creation => creation.order_id === order.id);
		return order;
	});

	return orders;
};

module.exports = getOrdersWithCreations;
