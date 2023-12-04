const fs = require('fs');
const {CONSTANTS} = require("./constants");
const {DATA_DIR} = CONSTANTS;

const getOrdersFromFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(DATA_DIR + '/orders.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const orders = JSON.parse(data);
        resolve(orders);
      }
    });
  });
};

module.exports = getOrdersFromFile;