import React, { createContext, useState, useContext, useEffect } from 'react';

const ipcRenderer = window.electron.ipcRenderer;

const UserDataContext = createContext(null);

const UserDataProvider = ({ children }) => {
	const [sessionToken, setSessionToken] = useState('');
	const [downloadDirectory, setDownloadDirectory] = useState('');

	useEffect(() => {
		// Request the session token from the main process
		ipcRenderer.send('requestUserData');

		ipcRenderer.on('userData-reply', (event, data) => {
			console.log('userData-reply', data);
			if (data.token === null || data.token === undefined || data.token === '') {
				return;
			}
			setSessionToken(data.token);
			if (data.downloadDirectory === null || data.downloadDirectory === undefined || data.downloadDirectory === '') {
				return;
			}
			setDownloadDirectory(data.downloadDirectory);
		});
	}, []);

	const getSessionToken = (): string => {
		return sessionToken;
	};

	// Function to set the session token
	const saveSessionToken = (token): void => {
		setSessionToken(token);
		ipcRenderer.send('saveSessionToken', token);
	};

	const getDownloadDirectory = (): string => {
		return downloadDirectory;
	};

	const saveDownloadDirectory = (directory): void => {
		setDownloadDirectory(directory);
		ipcRenderer.send('saveDownloadDirectory', directory);
	};

	return (
		<UserDataContext.Provider value={{ getSessionToken, saveSessionToken, getDownloadDirectory, saveDownloadDirectory }}>
			{children}
		</UserDataContext.Provider>
	);
};

const useUserData = () => {
	const context = useContext(UserDataContext);
	if (context === null) {
		throw new Error('useUserData must be used within a UserDataProvider');
	}
	return context;
};

export { UserDataProvider, useUserData };
