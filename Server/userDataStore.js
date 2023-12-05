const fs = require('fs');
const path = require('path');

const { CONSTANTS } = require('./constants');
const { BASE_DIR, DATA_DIR } = CONSTANTS;

const userDataPath = path.join(DATA_DIR, 'userData.json');
let fetchedUserData = null;

const getUserData = (item) => {
	item = item || '';
	checkifUserDataFileExistsAndCreateIfNot();

	const userdata = fetchedUserData !== null ? fetchedUserData : fs.readFileSync(userDataPath, 'utf8');
	if (userdata !== '') {
		fetchedUserData = userdata;
		const data = JSON.parse(userdata);
		if (item !== '' && data[item] !== undefined) {
			console.log('Returning', item, data[item]);
			return data[item];
		}
		console.log('Returning', data);
		return data;
	}

	console.log('Returning default user data object');
	return getDefaultUserDataObject();
};

const saveUserData = (data) => {
	console.log('Saving user data recieved', data);
	const json = JSON.stringify(data, null, 2);
	fetchedUserData = json;
	console.log('Saving user data passing', json);
	fs.writeFileSync(userDataPath, json);
};

const saveDownloadDirectory = (downloadDirectory) => {
	const data = getUserData();
	data.downloadDirectory = downloadDirectory;
	saveUserData(data);
};

const saveSessionToken = (token) => {
	const data = getUserData();
	console.log('Saving session token bf', data);
	data.token = token;
	console.log('Saving session token af', data);
	saveUserData(data);
};

const getDownloadDirectory = () => {
	return getUserData('downloadDirectory');
};

const getSessionToken = () => {
	return getUserData('token');
};

function getDefaultUserDataObject () {
	return {
		token: '',
		downloadDirectory: ''
	};
}

function checkifUserDataFileExistsAndCreateIfNot () {
	// Check if the directory exists, if not create it
	if (!fs.existsSync(BASE_DIR)) {
		fs.mkdirSync(BASE_DIR, { recursive: true });
	}

	// Check if the directory exists, if not create it
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}

	// Check if the file exists, if not create it
	if (!fs.existsSync(userDataPath)) {
		createDefaultUserDataFile();
	}
}

function createDefaultUserDataFile () {
	const dir = path.dirname(userDataPath);
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
	if (!fs.existsSync(userDataPath)) {
		fs.writeFileSync(userDataPath, JSON.stringify(getDefaultUserDataObject(), null, 2), 'utf8');
	}
}

module.exports = { getUserData, saveUserData, getSessionToken, saveSessionToken, getDownloadDirectory, saveDownloadDirectory };
