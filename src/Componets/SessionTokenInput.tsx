import React, { useCallback, useEffect, useState } from 'react';
import { useUserData } from '../Contexts/UserDataContext';
import { TextField, Button, Grid, Snackbar, Typography } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { debounce } from 'lodash';
import { useAlerts } from '../Contexts/AlertsContext';

function Alert (props: AlertProps): React.ReactElement {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ipcRenderer = window.electron.ipcRenderer;

const SessionTokenInput: React.FC = () => {
	const { getSessionToken, saveSessionToken } = useUserData();
	const [sessionToken, setSessionToken] = useState(getSessionToken());
	const { setAlertMessage, setAlertSeverity, setAlertOpen } = useAlerts();

	const tokenSaveSuccessAlert = (): void => {
		setAlertMessage('Session token saved successfully!');
		setAlertSeverity('success');
		setAlertOpen(true);
	};
	const handleSave = (): void => {
		tokenSaveSuccessAlert();
	};

	const handleTestTokenClick = async (): Promise<void> => {
		await ipcRenderer.invoke('test-session-token', sessionToken);
	};

	useEffect(() => {
		ipcRenderer.on('test-session-token-reply', (event, valid) => {
			console.log('test-session-token-reply', valid);
			if (valid === true) {
				tokenSaveSuccessAlert();
			} else {
				setAlertMessage('Session token is invalid!');
				setAlertSeverity('error');
				setAlertOpen(true);
			}
		});
	}, []);

	const handleClose = (event?: React.SyntheticEvent, reason?: string): void => {
		if (reason === 'clickaway') {
			return;
		}
		setAlertOpen(false);
	};

	const debouncedSave = useCallback(
		debounce((nextValue: string) => {
			saveSessionToken(nextValue);
			tokenSaveSuccessAlert();
		}, 1000),
		[] // will be created only once initially
	);

	useEffect(() => {
		// don't use debouncedSave if the session token is the same as the one in the context or it is empty
		// for an empty token you'd need to use the save button
		if (sessionToken === getSessionToken() || sessionToken === '') {
			return;
		}
		debouncedSave(sessionToken);
	}, [sessionToken]);

	return (
		<Grid container direction="column" alignItems="flex-start" spacing={2}>
			<Grid item>
				<Typography variant="body1">You need to get this token from a logged in session on cults. See the readme for how to get this.</Typography>
			</Grid>
			<Grid item>
				<TextField
					variant="outlined"
					type="text"
					value={sessionToken}
					onChange={(e) => setSessionToken(e.target.value)}
					placeholder="Enter session token"
					label="Session Token"
				/>
			</Grid>
			<Grid item>
				<Button color="primary" variant="contained" onClick={handleSave}>Save</Button>

				<Button variant="contained" color="secondary" onClick={handleTestTokenClick}
					disabled={sessionToken.length < 20}
				>
					Test Token
				</Button>
			</Grid>
		</Grid>
	);
};

export default SessionTokenInput;
