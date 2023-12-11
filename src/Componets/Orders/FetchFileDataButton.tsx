// src/Components/FetchFilesDataButton.tsx
import React, { useEffect } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import { fetchDownloadPage } from '../../Processors/DownloadPages';
import { FetchButtonProps } from '../../Types/interfaces';
import { useAlerts } from '../../Contexts/AlertsContext';

const ipcRenderer = window.electron.ipcRenderer;

export const FetchFilesDataButton: React.FC<FetchButtonProps> = ({ selectedOrderRowsData, isFetching, setIsFetching, isRowsSelected }) => {
	const [isWorking, setIsWorking] = React.useState(isFetching);
	const [totalDownloadQueue, setTotalDownloadQueue] = React.useState(0);

	const { setAlertMessage, setAlertSeverity, setAlertOpen } = useAlerts();
	async function handleFetchDownloadPages (): Promise<void> {
		setIsFetching(true);
		setIsWorking(true);
		console.log('about to fetch download pages');
		await fetchDownloadPage(selectedOrderRowsData).then(() => {
		}).then(() => {
			console.log('finished Fetching download pages');
			setAlertMessage('Finished fetching pages with links, about to start requesting file names and sizes');
			setAlertSeverity('info');
			setAlertOpen(true);
			setTimeout(() => {
				ipcRenderer.send('start-download-queue');
			}, 10000);
		});
	}

	useEffect(() => {
		ipcRenderer.on('download-queue-reply', (_, totalDownloadQueue) => {
			setTotalDownloadQueue(totalDownloadQueue);
		});
		ipcRenderer.on('download-queue-emptied', () => {
			setTotalDownloadQueue(0);
			setIsWorking(false);
			setIsFetching(false);
			setAlertMessage('Files data all processed, you are ready to start downloading.');
			setAlertOpen(true);
		});
	}, []);

	return (
		<Button
			variant="contained"
			color="secondary"
			onClick={handleFetchDownloadPages}
			disabled={isFetching || isWorking || !isRowsSelected}>
			Fetch Files Data {isWorking && '... '}
			{totalDownloadQueue > 0 && ` (${totalDownloadQueue})`}
			{isWorking && <CircularProgress sx={{ marginLeft: 0.25 }} size={22}/>}
		</Button>
	);
};
