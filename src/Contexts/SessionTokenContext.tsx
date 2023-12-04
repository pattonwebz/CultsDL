// SessionTokenContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ipcRenderer = window.electron.ipcRenderer;

const SessionTokenContext = createContext(null);

const SessionTokenProvider = ({ children }) => {
	const [sessionToken, setSessionToken] = useState('');

	useEffect(() => {
		// Request the session token from the main process
		ipcRenderer.send('requestSessionToken');

		ipcRenderer.on('sessionToken', (event, token) => {
			if (token === null || token === undefined || token === '') {
				return;
			}
			setSessionToken(token);
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

	return (
		<SessionTokenContext.Provider value={{ getSessionToken, saveSessionToken }}>
			{children}
		</SessionTokenContext.Provider>
	);
};

const useSessionToken = () => {
	const context = useContext(SessionTokenContext);
	if (context === null) {
		throw new Error('useSessionToken must be used within a SessionTokenProvider');
	}
	return context;
};

export { SessionTokenProvider, useSessionToken };
