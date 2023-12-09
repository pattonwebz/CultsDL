import React, { useCallback, useEffect, useState } from 'react';
import { useUserData } from '../Contexts/UserDataContext';
import { TextField, Button, Grid, Snackbar, Typography } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { debounce } from 'lodash';
import { useAlerts } from '../Contexts/AlertsContext';

function Alert (props: AlertProps): React.ReactElement {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const SessionTokenInput: React.FC = () => {
	const { getSessionToken, saveSessionToken } = useUserData();
	const [sessionToken, setSessionToken] = useState(getSessionToken());
	const [open, setOpen] = useState(false);
	const { setAlertMessage, setAlertOpen } = useAlerts();

	const handleSave = (): void => {
		saveSessionToken(sessionToken);
		setOpen(true);
	};

	const handleClose = (event?: React.SyntheticEvent, reason?: string): void => {
		if (reason === 'clickaway') {
			return;
		}
		setOpen(false);
	};

	const debouncedSave = useCallback(
		debounce((nextValue: string) => {
			saveSessionToken(nextValue);
			setAlertMessage('Session token saved successfully!');
			setAlertOpen(true);
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
		<>
			<Typography variant="body1">You need to get this token from a logged in session on cults. See the readme for how to get this.</Typography>
			<Grid container alignItems="stretch" spacing={2}>
				<Grid item>
					<TextField
						variant="outlined"
						type="text"
						value={sessionToken}
						onChange={(e) => setSessionToken(e.target.value)}
						placeholder="Enter session token"
						label="Session Token"
						size="medium"
					/>
				</Grid>
				<Grid item>
					<Button color="primary" variant="contained" size="large" onClick={handleSave}>Save</Button>
				</Grid>
			</Grid>
		</>
	);
};

export default SessionTokenInput;
