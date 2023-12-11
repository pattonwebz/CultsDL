import React, { useEffect, useState } from 'react';
import { Typography, Button, Box } from '@material-ui/core';
import OrdersTable from '../Componets/OrdersTable';
import { CircularProgress, LinearProgress, Stack } from '@mui/material';
import { processOrdersReply } from '../Processors/OrderProcessor';
import { Order } from '../Types/interfaces';
import { creationPageProcessor } from '../Processors/CreationPageProcessor';
import { FetchCreationPagesButton } from '../Componets/Orders/FetchCreationPagesButton';
import { FetchFilesDataButton } from '../Componets/Orders/FetchFileDataButton';
import DownloadProgress from '../Componets/DownloadProgress';

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
		ipcRenderer.on('fetch-orders-reply', (_, html) => {
			console.log('fetch-orders-reply');
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

	const [ordersWithCreations, setOrdersWithCreations] = useState([]);

	useEffect(() => {
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
		<Box display="flex" flexDirection="column" height="90vh">
			<Typography variant="h3" gutterBottom>
                Orders Management
			</Typography>
			<Typography variant="body1" gutterBottom>
				Downloading from cults is a painful experience. This page is
				here to make it less painful by caching all the pages you would
				need to visit. If you have more than just a few orders and items
				then it will take a very long time to process it all.
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

			{/* <Box className={showProgress ? 'slideIn' : 'slideOut'}> */}
			{/*	{(progress.fileName !== '') && ( */}
			{/*		<Typography variant="body2"> */}
			{/*			{(progress.totalInQueue !== 0) && ( */}
			{/*				<> */}
			{/*          Downloads in Queue: {progress.totalInQueue + 1} */}
			{/*					<br /> */}
			{/*				</> */}
			{/*			)} */}
			{/*    Current Download: {progress.fileName} */}
			{/*		</Typography> */}
			{/*	)} */}
			{/* </Box> */}

			{/* <LinearProgress variant="determinate" value={progress.progress}/> */}
			<DownloadProgress/>
			<OrdersTable rows={ordersWithCreations} onSelectionChange={setSelectedOrderRows}/>
		</Box>
	);
};

export default OrdersPage;
