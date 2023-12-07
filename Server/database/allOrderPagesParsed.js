const { closeDB, getDB } = require('./getDB');

const allOrderPagesParsed = (orders) => {
	const db = getDB();

	for (const order of orders) {
		db.get('SELECT * FROM orders WHERE number = ?', [parseInt(order.number)], (err, row) => {
			if (err) {
				return console.error(err.message);
			}
			if (!row) {
				db.run('INSERT INTO orders(number, date, price, link) VALUES(?, ?, ?, ?)', [parseInt(order.number), order.date, order.price, order.link], function (err) {
					if (err) {
						return console.error(err.message);
					}
					const orderId = this.lastID;

					for (const creation of order.creations) {
						db.run('INSERT INTO creations(name, thumbnail, link, creator, order_id, order_number) VALUES(?, ?, ?, ?, ?, ?)', [creation.title, creation.thumbnail, creation.link, creation.creator, orderId, order.number], function (err) {
							if (err) {
								return console.error(err.message);
							}
						});
					}
				});
			} else {
				console.log('Order already exists:', order.number);
			}
		});
	}

	closeDB(db);
};

module.exports = allOrderPagesParsed;
