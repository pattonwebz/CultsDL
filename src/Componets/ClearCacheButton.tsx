import React, { useState, useEffect } from 'react';
import { Button, Snackbar } from '@material-ui/core';
import MuiAlert, { type AlertProps } from '@material-ui/lab/Alert';
import { type ReactJSXElement } from '@emotion/react/types/jsx-namespace';

const ipcRenderer = window.electron.ipcRenderer;

function Alert (props: AlertProps): ReactJSXElement {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ClearCacheButton: React.FC = () => {
	const [cacheClearing, setCacheClearing] = useState(false);
	const [open, setOpen] = useState(false);

	const handleClearCache = (): void => {
		setCacheClearing(true);
		ipcRenderer.send('clear-cache');
	};

	const handleClose = (event?: React.SyntheticEvent, reason?: string): void => {
		if (reason === 'clickaway') {
			return;
		}
		setOpen(false);
	};

	useEffect(() => {
		ipcRenderer.on('cache-cleared', () => {
			setCacheClearing(false);
			setOpen(true);
		});
	}, []);

	return (
		<div>
			<Button variant="contained" color="primary" onClick={handleClearCache} disabled={cacheClearing}>
				{ cacheClearing ? 'Clearing cache...' : 'Clear Cache' }
			</Button>
			<Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
				<Alert onClose={handleClose} severity="success">
          Cache cleared successfully!
				</Alert>
			</Snackbar>
		</div>
	);
};

export default ClearCacheButton;
