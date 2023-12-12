import { Box, Button, ButtonGroup, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { CreationConnectionModal } from '../Componets/CreationConnectionModal';
import DownloadProgress from '../Componets/DownloadProgress';
import CreationColumnItem from '../Componets/Table/CreationColumnItem';

const ipcRenderer = window.electron.ipcRenderer;

const CreationsPage = () => {
	const [filesRows, setFilesRows] = React.useState([]);
	const [ordersRows, setOrdersRows] = React.useState([]);
	const [rows, setRows] = React.useState([]);

	const [nextRows, setNextRows] = React.useState([]);
	const [nextRowsCreations, setNextRowsCreations] = React.useState(0);

	const [hasUnknownCreations, setHasUnknownCreations] = useState(false);

	const columns = [
		{
			field: 'creation',
			headerName: 'Creation',
			renderCell: (params: { value: string; }) => {
				if (params.value === '##UNKNOWN CREATION##') {
					return params.value;
				}
				// get the creation from the order
				const creation = ordersRows.find(order => order.id === params.row.order_id)?.creations.find(creation => creation.id === params.row.creation_id);
				if (!creation) {
					return params.value;
				}
				return (
					<div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
						<CreationColumnItem key={creation.id} creation={creation} index={creation.id} />
					</div>
				);
			},
			width: 300
		},
		{
			field: 'name',
			headerName:
		'File Name',
			width:
		200
		},
		{
			field: 'size',
			headerName:
		'File Size',
			width:
		200
		},
		{
			field: 'link',
			headerName:
		'File Link',
			width: 200
		},
		{ field: 'creation_id', headerName: 'Creation ID', width: 200 },
		{ field: 'order_id', headerName: 'Order ID', width: 200 },
		{ field: 'generated_slug', headerName: 'Slug', width: 200 },
		{ field: 'cults_creation_number', headerName: 'Cults Creation Number', width: 200 }
	];

	const handleDownloadClick = () => {
		// get selected rows
		const selectedRows = rows.filter((row) => {
			return rowsSelected.includes(row.id);
		});
		console.log('selectedRows', selectedRows);
		selectedRows.forEach((row) => {
			console.log('row', row);
			console.log('row.order_id', row.order_id);
			console.log('ordersRows', ordersRows);
			const orderRow = ordersRows?.find(order => order.id === row.order_id);
			const creationRow = orderRow?.creations.filter(creation => creation.id === row.creation_id);
			console.log('orderRow', orderRow);
			console.log('creationRows', creationRow);

			console.log('creator_name', creationRow.creator);
			console.log('creation_name', creationRow.name);

			console.log('ordersRows', ordersRows[row.order_id]);
			const downloadInfo = {
				creator_name: creationRow[0].creator,
				creation_name: creationRow[0].name,
				link: row.link
			};
			console.log('downloadInfo', downloadInfo);
			ipcRenderer.send('download-file', downloadInfo);
		});
		ipcRenderer.send('enable-full-download');

		ipcRenderer.send('start-download-queue');
	};

	useEffect(() => {
		ipcRenderer.invoke('get-all-files').then((files) => {
			console.log('files', files);
			setFilesRows(files);
		});
		ipcRenderer.on('get-orders-with-creations-reply', (_, orders) => {
			setOrdersRows(orders);
		});
	}, []);

	useEffect(() => {
		const uniqueOrderIds = filesRows
			.map(file => file.order_id) // Get the order_id from each file
			.filter(orderId => orderId !== null) // Remove any null values
			.reduce((unique, orderId) => {
				// If the orderId is not already in the unique array, add it
				if (!unique.includes(orderId)) {
					unique.push(orderId);
				}
				return unique;
			}, []); // Start with an empty array
		ipcRenderer.send('get-orders-with-creations', uniqueOrderIds);
	}, [filesRows]);

	const formatFileSize = (bytes) => {
		const units = ['bytes', 'KB', 'MB', 'GB'];
		let unitIndex = 0;

		while (bytes >= 1024 && unitIndex < units.length - 1) {
			bytes /= 1024;
			unitIndex++;
		}

		// Round to two decimal places
		bytes = Math.round(bytes * 100) / 100;

		return `${bytes} ${units[unitIndex]}`;
	};

	useEffect(() => {
		console.log('ready to make rows');
		console.log(ordersRows);
		const rowsForTable = [];
		filesRows.forEach((file) => {
			const order = ordersRows.find((order) => order.id === file.order_id);
			const creation = order?.creations.find((creation) => creation.id === file.creation_id);
			const row = {
				id: file.id,
				creation: creation?.name || '##UNKNOWN CREATION##',
				name: file.name,
				size: formatFileSize(file.file_size),
				_size: file.file_size,
				link: file.url,
				creation_id: file.creation_id,
				order_id: file.order_id,
				generated_slug: file.slugified_creation_name,
				cults_creation_number: file?.cults_creation_number || '##UNKNOWN CULTS CREATION NUMBER##'
			};
			rowsForTable.push(row);
		});
		console.log('rowsForTable', rowsForTable);
		setRows(rowsForTable);
	}, [ordersRows]);

	useEffect(() => {
		if (rows.length === 0) {
			return;
		}
		// if the rows have unknown creations in them
		// set the state to true
		const unknownCreations = rows.filter(row => row.creation === '##UNKNOWN CREATION##');
		if (unknownCreations.length > 0 && !hasUnknownCreations) {
			setHasUnknownCreations(true);
		}
	}, [rows]);

	const [rowsSelected, setRowsSelected] = React.useState([]);
	const handleSelectChange = (selection) => {
		if (rowsSelected !== selection) {
			setRowsSelected(selection);
		}
	};

	return (
		<>
			<Box display="flex" flexDirection="column" height="90vh">
				<Typography variant="h3" gutterBottom>
					Files Management
				</Typography>
				<Typography variant="body1" gutterBottom>
					There's not a 100% reliable way to connect the files from
					creations that are removed
					from cults. I've done by best to connect them when
					retrieving but I can't figure them
					all out. Sometimes it just takes a human eye.
				</Typography>
				<Typography variant="body1" gutterBottom>
					You can connect the unknown files to their creations here by
					selecting them and then
					picking the creation from the order that it belongs to.
				</Typography>
				<Button variant="contained" color="primary" size="large" onClick={handleDownloadClick}>
					Download Selected Files
				</Button>
				{hasUnknownCreations && (
					<CreationConnectionModal
						rows={rows}
						nextRows={nextRows}
						setNextRows={setNextRows}
						nextRowsCreations={nextRowsCreations}
						setNextRowsCreations={setNextRowsCreations}
						ordersRows={ordersRows}
					/>
				)}
				<DownloadProgress/>
				<DataGrid
					rows={rows}
					columns={columns}
					checkboxSelection={true}
					rowSelectionModel={rowsSelected}
					onRowSelectionModelChange={handleSelectChange}/>
			</Box>
		</>
	);
};

export default CreationsPage;
