import { Box, Button, ButtonGroup, Typography } from '@material-ui/core';
import { MenuItem, Modal, Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect } from 'react';
import {useAlerts} from '../Contexts/AlertsContext';

const nextRowsArrayGroups = [];
const order = null;

const ipcRenderer = window.electron.ipcRenderer;

export const CreationConnectionModal = ({ rows, nextRows, setNextRows, nextRowsCreations, setNextRowsCreations, ordersRows }) => {
	const [open, setOpen] = React.useState(false);
	const [selectedRows, setSelectedRows] = React.useState([]);
	const [selectBoxPickedValue, setSelectBoxPickedValue] = React.useState(0);

	const {setAlertMessage, setAlertSeverity, setAlertOpen} = useAlerts();

	useEffect(() => {
		console.log('selectedRows', selectedRows);
	}, [selectedRows]);

	const handleOpen = () => {
		setOpen(true);
		advanceGroupings();
	};
	const handleClose = () => setOpen(false);

	const pickerColumns = [
		{ field: 'order_id', headerName: 'Order ID', width: 40 },
		{ field: 'generated_slug', headerName: 'Slug', width: 250 },
		{ field: 'name', headerName: 'File Name', width: 200 },
		{ field: 'cults_creation_number', headerName: 'Cults Creation Number', width: 200 },
		{ field: 'id', headerName: 'File ID', width: 40 }
	];

	const advanceGroupings = () => {
		console.log('nextRowsArrayGroups ag', nextRowsArrayGroups);
		console.log('nextRowsArrayGroups.length', nextRowsArrayGroups.length);
		if (nextRowsArrayGroups.length > 0) {
			console.log('nextRowsArrayGroups', nextRowsArrayGroups);
			setNextRows(nextRowsArrayGroups.shift());
		} else {
			console.log('nextRowsArrayGroups ng', nextRowsArrayGroups);
			handleNextGrouping();
		}
	};

	const handleNextGrouping = () => {
		let nextRowsArray = [];
		const groupedRows = rows.reduce((groups, row) => {
			// Only group rows where the creation field is '##UNKNOWN CREATION##'
			if (row.creation === '##UNKNOWN CREATION##') {
				// Find the group for this order_id and generated_slug
				let group = groups.find(g => g.order_id === row.order_id && g.generated_slug === row.generated_slug);

				// If this group doesn't exist yet, create it
				if (!group) {
					group = {
						order_id: row.order_id,
						generated_slug: row.generated_slug,
						rows: []
					};
					groups.push(group);
				}

				// Add this row to the group
				group.rows.push(row);
			}

			return groups;
		}, []);

		groupedRows.forEach(group => {
			nextRowsArray = [];
			group.rows.forEach(row => {
				const newRow = {
					id: row.id,
					order_id: row.order_id,
					generated_slug: row.generated_slug,
					name: row.name,
					cults_creation_number: row.cults_creation_number
				};
				nextRowsArray.push(newRow);
			});
			nextRowsArrayGroups.push(nextRowsArray);
		});
		setNextRows(nextRowsArrayGroups.shift());
	};

	const hanldeConnection = () => {
		console.log('hanldeConnection');
		// get the currently selected file ids from the rows
		const selectedFileIds = selectedRows;
		const selectedCreationId = selectBoxPickedValue;
		console.log('selectedFileIds', selectedFileIds);

		ipcRenderer.send('add-creation-to-file-in-database', { selectedFileIds, selectedCreationId });
	};

	useEffect(() => {
		ipcRenderer.on('add-creation-to-file-in-database-reply', (event, data) => {
			console.log('add-creation-to-file-in-database-reply', data);
			if (data === true) {
				setAlertMessage('Creation connected to file successfully!');
				setAlertSeverity('success');
				setAlertOpen(true)
				advanceGroupings();
			} else {
				setAlertMessage('Creation connection failed!');
				setAlertSeverity('error');
				setAlertOpen(true);
			}
		});
	}, []);

	useEffect(() => {
		// get the order for the first row in nextRows
		if (ordersRows && nextRows && nextRows.length > 0) {
			setNextRowsCreations(ordersRows.find(order => order.id === nextRows[0].order_id));
			console.log('nextows', nextRows[0]);
		}
		setSelectedRows(nextRows.map((row) => row.id));
	}, [nextRows]);

	useEffect(() => {
		console.log('nextRowsCreations', nextRowsCreations);
		if (nextRowsCreations && nextRowsCreations?.creations.length) {
			setSelectBoxPickedValue(nextRowsCreations.creations[0].id);
		}
	}, [nextRowsCreations]);

	return (
		<>
			<Button variant="contained" color="primary"
				onClick={handleOpen}>Start Manual File to Creation Connection</Button>

			<Modal
				open={open}
				onClose={handleClose}
			>
				<Box sx={{
					margin: 'auto',
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					width: 550,
					height: 450, // Set the height here
					padding: 2,
					backgroundColor: 'white',
					overflow: 'auto' // Add scrolling when the content exceeds the height
				}}>
					<ButtonGroup sx={{ mt: 2, mb: 2 }}>
						<Button variant="contained" color="primary" sx={{ mr: 2 }}
							onClick={advanceGroupings}>Next Group {nextRowsArrayGroups.length && `(${nextRowsArrayGroups.length + 1})`}</Button>
						<Button variant="contained" color="primary" onClick={hanldeConnection} >Connect to
							Selected Creation</Button>
					</ButtonGroup>
					{nextRowsCreations &&
						<><Select sx={{ width: '100%' }} onChange={(e) => {
							setSelectBoxPickedValue(e.target.value);
						}}
								  value={selectBoxPickedValue}>
							{nextRowsCreations?.creations.map(creation => (
								<MenuItem
									value={creation.id}>{creation.name}</MenuItem>
							))}
						</Select>
						{nextRowsCreations?.creations.length === 1 &&
								<Typography>Only one creation found, it's likely
									connected.</Typography>
						}</>
					}

					<DataGrid
						rows={nextRows}
						columns={pickerColumns}
						checkboxSelection={true}
						rowClassName={(params) =>
							params.row.order_id % 2 === 0 ? 'datagrid-row-even' : 'datagrid-row-odd'
						}
						onRowSelectionModelChange={(rows) =>
							setSelectedRows(rows)
						}
						selectionModel={selectedRows}
					/>
				</Box>
			</Modal>
		</>
	);
};
