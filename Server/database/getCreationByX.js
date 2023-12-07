const { getRowsByColumnWhereValue } = require('./getRowInColumnByValue');

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

module.exports = { getCreationsByX, getCreationsById, getCreationById, getCreationsByOrderId, getCreationsByOrderNumber };
