// src/Pages/OrdersPage.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@material-ui/core';
import OrdersTable from '../Componets/OrdersTable';
import { CircularProgress, LinearProgress, Stack } from '@mui/material';
import { processOrdersReply } from '../Processors/OrderProcessor';
import { fetchDownloadPage } from '../Processors/DownloadPages';
import { type Order } from '../Types/interfaces';

const ipcRenderer = window.electron.ipcRenderer;

const OrdersPage: React.FC = () => {
	const handleFetchOrders = (): void => {
		setIsFetchingOrders(true);
		ipcRenderer.send('fetch-orders');
	};

	const [isFetchingOrders, setIsFetchingOrders] = useState(false);
	const [isFetchingDownloadPages, setIsFetchingDownloadPages] = useState(false);

	const [orders, setOrders] = React.useState<Order[]>([]);
	const [nextPage, setNextPage] = React.useState('');
	const [selectedOrderRows, setSelectedOrderRows] = React.useState([]);

	let ordersLocal: Order[] = [];

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
		ipcRenderer.on('get-orders-from-file-reply', (_, orders) => {
			setOrders(orders);
		});
		ipcRenderer.on('fetch-orders-reply', (_, html) => {
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
			itemCount: order?.creations?.length ?? 0,
			items: order?.creations,
			price: order.price,
			link: order.link
		};
	});

	async function handleFetchDownloadPages (): Promise<void> {
		setIsFetchingOrders(true);
		const selectedOrderRowsData = rows.filter((row) => {
			return selectedOrderRows.includes(row.id);
		});
		await fetchDownloadPage(selectedOrderRowsData).then(() => {
			setIsFetchingDownloadPages(false);
		});
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
					disabled={selectedOrderRows.length < 1 || isFetchingDownloadPages}>
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
