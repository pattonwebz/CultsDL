import React, { useEffect } from 'react';
import { Button, Snackbar } from '@material-ui/core';
import { FetchButtonProps, Order } from '../../Types/interfaces';
import { creationPageProcessor } from '../../Processors/CreationPageProcessor';
import { CircularProgress } from '@mui/material';

const ipcRenderer = window.electron.ipcRenderer;

export const FetchCreationPagesButton: React.FC<FetchButtonProps> = ({ selectedOrderRowsData, isFetching, setIsFetching, isRowsSelected }) => {
	const [isWorking, setIsWorking] = React.useState(isFetching);
	const [openSnackbar, setOpenSnackbar] = React.useState(false);
	const [creationsToFetchExtraData, setCreationsToFetchExtraData] = React.useState<Order[]>([]);
	const [snackBarMessage, setSnackBarMessage] = React.useState('');
	function handleFetchCreationPages (): void {
		setIsFetching(true);
		setIsWorking(true);

		setCreationsToFetchExtraData(selectedOrderRowsData);
	}

	const sendCreationPageToProcessor = async (html: string, id: number) => {
		const creationData = await creationPageProcessor(html, id);
		return await ipcRenderer.invoke('save-creation-data', creationData);
	};

	useEffect(() => {
		if (!creationsToFetchExtraData) {
			return;
		}
		if (creationsToFetchExtraData.length === 0) {
			return;
		}
		setIsFetching(true);
		const delayedFetches = async () => {
			let counter = 0;
			for (const order of creationsToFetchExtraData) {
				if (!order.creations) {
					continue;
				}
				// add a small delay to not overload the server
				for (const creation of order.creations) {
					counter = counter === 3 ? 0 : counter;

					const id = creation.id;
					const link = creation.link;
					// add a small delay to not overload the server
					await new Promise(resolve => setTimeout(resolve, counter >= 3 ? 1000 : 330));

					if (id === undefined || link === undefined) {
						console.log('undefined id or link');
						continue;
					}

					interface FetchCreationPageData {
						html: string;
						// include other properties if needed
					}

					const data = await ipcRenderer.invoke('fetch-creation-page', { link, id }) as FetchCreationPageData;

					if (!data || data.html === null) {
						console.log('null html');
						continue;
					}
					await sendCreationPageToProcessor(data.html, id);
					counter++;
				}
			}
		};
		delayedFetches().then(() => {
			setIsFetching(false);
			setIsWorking(false);
			setOpenSnackbar(true); // Open the Snackbar when fetching is completed
		});
	}, [creationsToFetchExtraData]);

	useEffect(() => {
		if (isWorking) {
			setSnackBarMessage('Fetching creations extra data. This can take a while.');
		}
	}, [isWorking]);

	useEffect(() => {
		if (!openSnackbar) {
			setSnackBarMessage('');
		}
	}, [openSnackbar]);

	return (
		<>
			<Button
				variant="contained"
				color="secondary"
				onClick={handleFetchCreationPages}
				disabled={isWorking || !isRowsSelected}
			>
			Fetch Creations Extra Data {isWorking && '... '}
				{isWorking && <CircularProgress sx={{ marginLeft: 0.25 }} size={22}/>}
			</Button>
			<Snackbar
				open={openSnackbar || snackBarMessage !== ''}
				autoHideDuration={6000}
				onClose={() => setOpenSnackbar(false)}
				message={ snackBarMessage !== '' ? snackBarMessage : (<>Fetching completed</>) }
			/>
		</>
	);
};
