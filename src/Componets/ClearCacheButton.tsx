import React, { useState, useEffect } from 'react';
import { Button, ButtonGroup, Snackbar } from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import {useAlerts} from '../Contexts/AlertsContext';

const ipcRenderer = window.electron.ipcRenderer;

function Alert (props: AlertProps): ReactJSXElement {
	return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const ClearCacheButton: React.FC = () => {
	const [cacheClearing, setCacheClearing] = useState(false);

	const { setAlertOpen, setAlertMessage } = useAlerts();

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
		ipcRenderer.send('clear-cache', 'first-order-page');
	};

	useEffect(() => {
		ipcRenderer.on('cache-cleared', (event, data) => {

			if (data.cleared === true) {
				setCacheClearing(false);
				setAlertMessage('Cache cleared for: ' + data.type);
				setAlertOpen(true);
			}
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
		</>
	);
};

export default ClearCacheButton;
