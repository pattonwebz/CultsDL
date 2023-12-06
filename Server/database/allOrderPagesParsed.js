const { closeDB, getDB } = require('./getDB');

const allOrderPagesParsed = (orders) => {
	const db = getDB();

	for (const order of orders) {
		db.get('SELECT * FROM orders WHERE order_number = ?', [parseInt(order.number)], (err, row) => {
			if (err) {
				return console.error(err.message);
			}
			if (!row) {
				db.run('INSERT INTO orders(order_number, order_date, order_total, order_link) VALUES(?, ?, ?, ?)', [parseInt(order.number), order.date, order.price, order.link], function (err) {
					if (err) {
						return console.error(err.message);
					}
					const orderId = this.lastID;
					console.log(`A row has been inserted with rowid ${this.lastID}`);
					for (const creation of order.creations) {
						db.run('INSERT INTO creations(creation_name, creation_thumbnail, creation_link, creation_creator, creation_order_id) VALUES(?, ?, ?, ?, ?)', [creation.title, creation.thumbnail, creation.link, creation.creator, orderId], function (err) {
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
