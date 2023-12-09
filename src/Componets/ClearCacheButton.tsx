import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup, Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';

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

	const handleClearOrders = (): void => {
		setCacheClearing(true);
		ipcRenderer.send('clear-orders-cache');
	};

	const handleClearDownloadPages = (): void => {
		setCacheClearing(true);
		ipcRenderer.send('clear-download-pages-cache');
	};

	const handleClearCreations = (): void => {
		setCacheClearing(true);
		ipcRenderer.send('clear-creations-pages-cache');
	};

	const handleClearFirstOrderPageCache = (): void => {
		setCacheClearing(true);
		ipcRenderer.send('clear-first-order-page-cache');
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
		<>
			<Button variant="contained" color="secondary" onClick={handleClearFirstOrderPageCache}>
				Clear just first order
			</Button>
			<ButtonGroup variant="contained" color="primary" disabled={cacheClearing}>
				<Button onClick={handleClearCache}>Clear Cache</Button>
				<Button onClick={handleClearOrders}>Clear Orders</Button>
				<Button onClick={handleClearDownloadPages}>Clear Download Pages</Button>
				<Button onClick={handleClearCreations}>Clear Creations</Button>
			</ButtonGroup>
			<Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
				<Alert onClose={handleClose} severity="success">
					Cache cleared successfully!
				</Alert>
			</Snackbar>
		</>
	);
};

export default ClearCacheButton;
