import { Box, Button, ButtonGroup, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import DownloadProgress from '../Componets/DownloadProgress';
import CreationColumnItem from '../Componets/Table/CreationColumnItem';

const ipcRenderer = window.electron.ipcRenderer;

const CreationsPage = () => {
	const [rows, setRows] = React.useState([]);

	const columns = [
		{
			field: 'creation',
			headerName: 'Creation',
			renderCell: (params: { value }) => {
				console.log('params.value', params.value);
				return (
					<div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
						<CreationColumnItem key={params.value.id} creation={params.value} index={params.value.id} />
					</div>
				);
			},
			width: 280
		},
		{ field: 'creator', headerName: 'Creator', width: 150 },
		{
			field: 'files',
			headerName: 'File List',
			renderCell: (params: { value }) => {
				return (
					<div style={{overflowX: 'auto', whiteSpace: 'nowrap'}}>
						{params.value}
					</div>
				);
			},
			width: 200
		},
		{
			field: 'actions',
			headerName: 'Actions',
			renderCell: (params: { value }) => {
				return (
					<ButtonGroup>
						<Button onClick={() => handleDownload(params.value)}>Download</Button>
						<Button>Open</Button>
					</ButtonGroup>
				);
			},
			width: 250
		},
		{ field: 'images', headerName: 'Images', width: 200, hide: true },
		{ field: 'description', headerName: 'Description', width: 350, hide: true },
		{ field: 'tags', headerName: 'Tags', width: 350, hide: true },
	];

	const handleDownload = (creationId) => {
		console.log('download');
		// get the creation ID from the clicked button and find all the file
		if (!rows) {}
		const creation = rows.find(row => row.id === creationId).creation;
		const files = creation.files;
		const images = JSON.parse(creation.images);

		const descriptionInfo = {
			creator_name: creation.creator,
			creation_name: creation.name,
			description: creation.description,
			tags: JSON.parse(creation.tags),
			type: 'description'
		};
		ipcRenderer.send('save-description', descriptionInfo);

		console.log(files);
		ipcRenderer.send('enable-full-download');

		console.log('images', images);

		images.forEach(image => {
			const downloadInfo = {
				creator_name: creation.creator,
				creation_name: creation.name,
				link: image,
				type: 'image',
			};
			console.log('downloadInfo', downloadInfo);
			ipcRenderer.send('download-file', downloadInfo);
		});

		files.forEach(file => {
			const downloadInfo = {
				creator_name: creation.creator,
				creation_name: creation.name,
				link: file.url,
			};
			console.log('downloadInfo', downloadInfo);
			ipcRenderer.send('download-file', downloadInfo);
		});

		ipcRenderer.send('start-download-queue');
	};

	useEffect(async () => {
		const creations = await ipcRenderer.invoke('get-creations-with-files');

		console.log('creations', creations);
		const rowsForTable = [];
		creations.forEach(creation => {
			const row = {
				id: creation.id,
				creation,
				files: creation.files.map(file => file.name).join(', '),
				creator: creation.creator,
				actions: creation.id,
				description: creation.description,
				tags: creation.tags,
				images: creation.images,
			};
			rowsForTable.push(row);
		});
		setRows(rowsForTable);
	}, []);

	const [rowsSelected, setRowsSelected] = React.useState([]);

	const handleSelectChange = (selection: any) => {
		setRowsSelected(selection.selectionModel);
	};

	return (
		<>
			<Box display="flex" flexDirection="column" height="90vh">
				<Typography variant="h3" gutterBottom>
					Creations Management
				</Typography>
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
