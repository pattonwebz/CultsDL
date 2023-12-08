import React, { useEffect, useState } from 'react';
import { useUserData } from '../Contexts/UserDataContext';
import { TextField, Button, Grid, Snackbar, Typography } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

function Alert (props: AlertProps): React.ReactElement {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ipcRenderer = window.electron.ipcRenderer;

const SessionTokenInput: React.FC = () => {
	const { getSessionToken, saveSessionToken } = useUserData();
	const [sessionToken, setSessionToken] = useState(getSessionToken());
	const [open, setOpen] = useState(false);
	const [message, setMessage] = useState('');
	const [alertSeverity, setAlertSeverity] = useState('success');

	const handleSave = (): void => {
		setSessionToken(sessionToken);
		setOpen(true);
	};

	const handleTestTokenClick = async (): Promise<void> => {
		await ipcRenderer.invoke('test-session-token', sessionToken);
	}

	useEffect(() => {
		ipcRenderer.on('test-session-token-reply', (event, valid) => {
			console.log('test-session-token-reply', valid);
			if (valid === true) {
				setMessage('Session token is valid!');
				setAlertSeverity('success');
			} else {
				setMessage('Session token is invalid!');
				setAlertSeverity('error');
			}
			setOpen(true);
		});
	}, []);

	const handleClose = (event?: React.SyntheticEvent, reason?: string): void => {
		if (reason === 'clickaway') {
			return;
		}
		setTimeout(() => {
			setMessage('');
			setAlertSeverity('success')
		}, 1000);
		setOpen(false);
	};

	useEffect(() => {
		saveSessionToken(sessionToken);
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
				<Button variant="contained" onClick={handleSave}>Save</Button>

				<Button variant="contained" color="secondary" onClick={handleTestTokenClick}
					disabled={sessionToken.length < 20}
				>
					Test Token
				</Button>
			</Grid>
			<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
				<Alert onClose={handleClose} severity={alertSeverity}>
          					{message === '' ? 'Session token saved successfully!' : message}
				</Alert>
			</Snackbar>
		</Grid>
	);
};

export default SessionTokenInput;
