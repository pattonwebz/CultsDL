import React from 'react';

import { Snackbar } from '@material-ui/core';
import { Alert } from '@mui/material';
import { useAlerts } from '../Contexts/AlertsContext';

const SnackbarAlerts = () => {
	const { alertOpen, setAlertOpen, alertDuration, alertMessage, setAlertMessage, alertSeverity, setAlertSeverity } = useAlerts();

	const handleClose = (event?: React.SyntheticEvent, reason?: string): void => {
		if (reason === 'clickaway') {
			return;
		}
		setAlertOpen(false);
		setTimeout(() => {
			setAlertMessage('');
			setAlertSeverity('success');
		}, 200);
	};

	return (
		<Snackbar open={alertOpen} autoHideDuration={alertDuration} onClose={handleClose}>
			<Alert onClose={handleClose} severity={alertSeverity}>
				{alertMessage}
			</Alert>
		</Snackbar>
	);
};

export default SnackbarAlerts;
