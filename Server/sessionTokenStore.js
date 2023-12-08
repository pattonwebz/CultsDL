// sessionTokenStore.js
const fs = require('fs');
const path = require('path');

const { CONSTANTS } = require('./constants');
const { DATA_DIR } = CONSTANTS;

const tokenFilePath = path.join(DATA_DIR, 'sessionToken.json');
const getSessionToken = () => {
	if (fs.existsSync(tokenFilePath)) {
		let userdata = fs.readFileSync(tokenFilePath, 'utf8');
		if (userdata) {
			//
			userdata = JSON.parse(userdata);
			return userdata.token || '';
		}
	}
	//
	return '';
};

const saveSessionToken = (token) => {
	const dir = path.dirname(tokenFilePath);
	const base = path.dirname(dir);

	// Check if the directory exists, if not create it
	if (!fs.existsSync(base)) {
		fs.mkdirSync(base, { recursive: true });
	}

	// Check if the directory exists, if not create it
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Check if the file exists, if not create it
	if (!fs.existsSync(tokenFilePath)) {
		fs.writeFileSync(tokenFilePath, '', 'utf8');
	}

	const data = {
		token
	};
	fs.writeFileSync(tokenFilePath, JSON.stringify(data, null, 2));
};

module.exports = { getSessionToken, saveSessionToken };
