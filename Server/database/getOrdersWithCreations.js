const { getDB } = require('./getDB');

const getOrdersWithCreations = async () => {
	const db = getDB();

	// Fetch all orders
	let orders = await new Promise((resolve, reject) => {
		db.all('SELECT * FROM orders', [], (err, rows) => {
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
