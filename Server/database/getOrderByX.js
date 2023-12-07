const { getRowsByColumnWhereValue } = require('./getRowInColumnByValue');

const getOrdersByX = async (column = 'number', value = 0, limit = 500) => {
	if (!column || !value) {
		return null;
	}
	return getRowsByColumnWhereValue('orders', column, value, limit);
};

const getOrdersById = async (id, limit = 500) => {
	if (!id || id === 0) {
		return null;
	}
	return getOrdersByX('id', id, limit);
};

const getOrderById = async (id) => {
	return getOrdersByX('id', id, 1);
};

const getOrderByOrderNumber = async (orderNumber) => {
	return getOrdersByX('number', orderNumber, 1);
};

module.exports = { getOrdersByX, getOrdersById, getOrderById };
