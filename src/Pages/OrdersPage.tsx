// src/Pages/OrdersPage.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Button, Divider, Box } from '@material-ui/core';
import OrdersTable from '../Componets/OrdersTable';
import { BASE_URL } from '../Constants';
import { CircularProgress, LinearProgress, Stack } from '@mui/material';
import { processOrdersReply } from '../Processors/OrderProcessor';
import {fetchDownloadPage} from "../Processors/DownloadPages";

const ipcRenderer = window.electron.ipcRenderer;

const OrdersPage: React.FC = () => {
	const handleFetchOrders = (): void => {
		setIsFetchingOrders(true);
		ipcRenderer.send('fetch-orders');
	};

	const [isFetchingOrders, setIsFetchingOrders] = useState(false);

	const [orders, setOrders] = React.useState([]);
	const [nextPage, setNextPage] = React.useState('');
	const [selectedOrderRows, setSelectedOrderRows] = React.useState([]);

	let ordersLocal = [];

	useEffect(() => {
		console.log('changed in parent');
	}, [selectedOrderRows]);

	const [progress, setProgress] = useState({
		totalInQueue: 0,
		progress: 0,
		fileName: ''
	});

	useEffect(() => {
		window.electron.receive('download-progress', (data) => {
			// Update the progress state with the new progress value
			setProgress(data);
		});
	}, []);

	useEffect(() => {
		ipcRenderer.send('get-orders-from-file');
		ipcRenderer.on('get-orders-from-file-reply', (event, orders) => {
			setOrders(orders);
		});
		ipcRenderer.on('fetch-orders-reply', (event, html) => {
			const newOrders = processOrdersReply(html, setNextPage);
			ordersLocal = ordersLocal.concat(newOrders);
			setOrders(ordersLocal);
		});
	}, []);

	useEffect(() => {
		if (orders.length === 0) {
			return;
		}
		ipcRenderer.send('ordersParsed', orders);

		if (nextPage !== '') {
			ipcRenderer.send('fetch-orders', nextPage);
		} else {
			console.log('done parsing orders');
			setIsFetchingOrders(false);
			ipcRenderer.send('all-order-pages-parsed', orders);
		}
	}, [orders]);

	const rows = orders.map((order) => {
		return {
			id: order.number,
			number: order.number,
			date: order.date,
			itemCount: order.creations.length,
			items: order.creations,
			price: order.price,
			link: order.link
		};
	});

	function handleFetchDownloadPages (): void {
		const selectedOrderRowsData = rows.filter((row) => {
			return selectedOrderRows.includes(row.id);
		});
		console.log(selectedOrderRowsData);
		fetchDownloadPage(selectedOrderRowsData);
		// let data = [];
		// selectedOrderRowsData.forEach((row) => {
		//     data.downloadPage = row.link;
		//     data.number = row.number;
		//     row.items.forEach((item) => {
		//         data.item = item.link;
		//     });
		// });
		// MARKER
		// ipcRenderer.send('fetch-download-page', selectedOrderRowsData[0].link);
		// ipcRenderer.on('fetch-download-page-reply', (event, html) => {
		// 	console.log('fetch-download-page-reply');
		// 	console.log(html);
		// 	const parser = new DOMParser();
		// 	const doc = parser.parseFromString(html, 'text/html');
		//
		// 	const downloadButtonsContainer = doc.querySelector('#content > .grid > .grid-cell:not(.grid-cell--fit)');
		// 	// console.log(downloadButtonsContainer);
		// 	if (!downloadButtonsContainer) {
		// 		console.log('no download buttons container found');
		// 		return;
		// 	}
		// 	const downloadButtons = downloadButtonsContainer.querySelectorAll('a.btn');
		// 	if (downloadButtons.length < 1) {
		// 		console.log('no download buttons found');
		// 		return;
		// 	}
		//
		// 	downloadButtons.forEach((button) => {
		// 		console.log(button.href);
		// 		ipcRenderer.send('download-file', button.href.replace('file://', BASE_URL));
		// 	});
		// });
		// MARKER END
	}

	return (
		<div>
			<Typography variant="h4">
                Welcome to the Orders Page!
			</Typography>
			<Stack direction="row" spacing={2} sx={{ mb: 2 }}>
				<Button variant="contained" color="primary" onClick={handleFetchOrders}
					disabled={isFetchingOrders}>
					{!isFetchingOrders
						? (
							<>Fetch Orders</>
						)
						: (
							<>Fetching Orders... <CircularProgress size={24} /></>
						)}

				</Button>
				<Button variant="contained" color="secondary" onClick={handleFetchDownloadPages}
					disabled={selectedOrderRows.length < 1}>
                    Fetch Download Pages for selected orders
				</Button>
			</Stack>

			{(progress.fileName !== '') && (
				<Typography variant="body2">
					{(progress.totalInQueue !== 0) && (
						<>
                      Downloads in Queue: {progress.totalInQueue}
							<br />
						</>
					)}
                Current Download: {progress.fileName}
				</Typography>
			)}

			<LinearProgress variant="determinate" value={progress.progress}/>
			<OrdersTable rows={rows} onSelectionChange={setSelectedOrderRows}/>
		</div>
	);
};

export default OrdersPage;
