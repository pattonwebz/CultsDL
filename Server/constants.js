const { homedir } = require('os');
const { join } = require('path');

const CONSTANTS = {
	API_URL: 'https://api.example.com',
	MAX_RETRY: 3,
	TIMEOUT: 5000,
	// Add more constants as needed
	BASE_URL: 'https://cults3d.com',
	BASE_DIR: join(homedir(), '.cultsDL'),
	DATA_DIR: join(homedir(), '.cultsDL', 'data'),
	CACHE_DIR: join(homedir(), '.cultsDL', 'data', '.cache'),
	DOWNLOAD_DIR: join(homedir(), '.cultsDL', 'data', 'downloads')
};

module.exports = { CONSTANTS };
