const { net, BrowserWindow } = require('electron');
const { getSessionToken } = require('./sessionTokenStore');
const { CONSTANTS } = require('./constants');
const { BASE_URL } = CONSTANTS;

const cache = require('./cache');

const getOrders = (url = '') => {
  const pageToRequest = url || BASE_URL + '/en/orders'

  // Try to read from the cache
  let data = cache.getSync(pageToRequest);
  if (data) {
    console.log('Loaded data from cache');
    // console.log(data);
    BrowserWindow.getFocusedWindow().webContents.send('fetch-orders-reply', data);
    return;
  }

  const request = net.request({
    method: 'GET',
    url: pageToRequest,
    headers: {
      'Cookie': '_session_id=' + getSessionToken()
    }
  });

  let body = '';
  request.on('response', (response) => {
    response.on('data', (chunk) => {
      body += chunk;
    });
    response.on('end', () => {
      // Save data to the cache
      cache.setSync(pageToRequest, body);
      BrowserWindow.getFocusedWindow().webContents.send('fetch-orders-reply', body);
    });
  });

  request.end();
}

module.exports = getOrders;