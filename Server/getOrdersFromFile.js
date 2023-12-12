const fs = require('fs');
const { CONSTANTS } = require('./constants');
const { DATA_DIR } = CONSTANTS;

const logger = require('./logger/logger');

const getOrdersFromFile = async () => {
	return await new Promise((resolve, reject) => {
		fs.readFile(DATA_DIR + '/orders.json', 'utf8', (err, data) => {
			if (err != null) {
				logger.error('getOrdersFromFile', { message: err })
				reject(err);
			} else {
				const orders = JSON.parse(data);
				resolve(orders);
			}
		});
	});
};

module.exports = getOrdersFromFile;
