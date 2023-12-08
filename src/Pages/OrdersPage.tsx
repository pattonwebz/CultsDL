import React, { useEffect, useState } from 'react';
import { Typography, Button, Box } from '@material-ui/core';
import OrdersTable from '../Componets/OrdersTable';
import { CircularProgress, LinearProgress, Stack } from '@mui/material';
import { processOrdersReply } from '../Processors/OrderProcessor';
import { Order } from '../Types/interfaces';
import CreationsTableDB from '../Componets/CreationsTableDB';
import OrdersTableDB from '../Componets/OrdersTableDB';
import { creationPageProcessor } from '../Processors/CreationPageProcessor';
import { FetchCreationPagesButton } from '../Componets/Orders/FetchCreationPagesButton';
import { FetchFilesDataButton } from '../Componets/Orders/FetchFileDataButton';

const ipcRenderer = window.electron.ipcRenderer;

const OrdersPage: React.FC = () => {
	const handleFetchOrders = (): void => {
		setIsFetchingOrders(true);
		ipcRenderer.send('fetch-orders');
	};

	const [isFetchingOrders, setIsFetchingOrders] = useState(false);
	const [isFetchingAnything, setIsFetchingAnything] = useState(false);

	const [orders, setOrders] = React.useState<Order[]>([]);
	const [nextPage, setNextPage] = React.useState('');
	const [selectedOrderRows, setSelectedOrderRows] = React.useState([]);
	const [selectedOrderRowsData, setSelectedOrderRowsData] = React.useState<Order[]>([]);

	let ordersLocal: Order[] = [];

	const [progress, setProgress] = useState({
		totalInQueue: 0,
		progress: 0,
		fileName: ''
	});

	useEffect(() => {
		const orderRowsData: Order[] = ordersWithCreations.filter((row: Record<string, any>) => {
			if (row.id === undefined) {
				return null;
			}
			return selectedOrderRows.includes(row.id);
		});
		setSelectedOrderRowsData(orderRowsData);
	}, [selectedOrderRows]);

	useEffect(() => {
		window.electron.receive('download-progress', (data) => {
			// Update the progress state with the new progress value
			setProgress(data);
		});
	}, []);

	useEffect(() => {
		ipcRenderer.on('fetch-orders-reply', (_, html) => {
			const newOrders = processOrdersReply(html, setNextPage);
			ordersLocal = ordersLocal.concat(newOrders);
			setOrders(ordersLocal);
		});

		ipcRenderer.on('fetch-creation-page-reply', async (_, creationInfo) => {
			const { html, id } = creationInfo;

			const creationData = await creationPageProcessor(html, id);
			ipcRenderer.send('save-creation-data', creationData);
		});

		// ipcRenderer.on('fetch-creation-data', (_, data) => {
		// 	const [link, id] = data;
		// 	const creationData = creationPageProcessor(html, id);
		// 	saveCreationData(creationData);
		// });
	}, []);

	useEffect(() => {
		if (orders.length === 0) {
			return;
		}

		if (nextPage !== '') {
			ipcRenderer.send('fetch-orders', nextPage);
		} else {
			setIsFetchingOrders(false);
			ipcRenderer.send('all-order-pages-parsed', orders);
		}
	}, [orders]);

	const [dbOrders, setDbOrders] = useState([]);
	const [dbCreations, setDbCreations] = useState([]);
	const [ordersWithCreations, setOrdersWithCreations] = useState([]);

	useEffect(() => {
		ipcRenderer.send('get-orders-from-db');
		ipcRenderer.on('get-orders-from-db-reply', (_, orders) => {
			setDbOrders(orders);
		});

		ipcRenderer.send('get-creations-from-db');
		ipcRenderer.on('get-creations-from-db-reply', (_, creations) => {
			setDbCreations(creations);
		});

		ipcRenderer.send('get-orders-with-creations');
		ipcRenderer.on('get-orders-with-creations-reply', (_, ordersAndCreations) => {
			const processedOrders = ordersAndCreations.map((orderAndCreation) => {
				return {
					id: orderAndCreation.id,
					number: orderAndCreation.number,
					date: orderAndCreation.date,
					itemCount: orderAndCreation.creations.length,
					creations: orderAndCreation.creations,
					price: orderAndCreation.price,
					link: orderAndCreation.link
				};
			});

			setOrdersWithCreations(processedOrders);
		});
	}, []);

	return (
		<div>
			<Typography variant="h4">
                Orders
			</Typography>
			<Typography variant="body1">
				You can fetch your orders here and the creations that are in them. It's broken into 3 parts on purpose since 3 pages are required to be read for every creation, the order, the download page and the creation page itself. It's not reliable that you can get to the actual creation page from the download page since sometimes they are removed. It's also unclear if there will be one or many files attached of what format they will be in.
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
				<FetchFilesDataButton
					selectedOrderRowsData={selectedOrderRowsData}
					isFetching={isFetchingAnything}
					setIsFetching={setIsFetchingAnything}
					isRowsSelected={selectedOrderRows.length > 0}
				/>
				<FetchCreationPagesButton
					selectedOrderRowsData={selectedOrderRowsData}
					isFetching={isFetchingAnything}
					setIsFetching={setIsFetchingAnything}
					isRowsSelected={selectedOrderRows.length > 0}
				/>
			</Stack>

			<Box sx={{ minHeight: '48px' }}>
				{(progress.fileName !== '') && (
					<Typography variant="body2">
						{(progress.totalInQueue !== 0) && (
							<>
                      Downloads in Queue: {progress.totalInQueue + 1}
								<br />
							</>
						)}
                Current Download: {progress.fileName}
					</Typography>
				)}
			</Box>

			<LinearProgress variant="determinate" value={progress.progress}/>
			<OrdersTable rows={ordersWithCreations} onSelectionChange={setSelectedOrderRows}/>
		</div>
	);
};

export default OrdersPage;
