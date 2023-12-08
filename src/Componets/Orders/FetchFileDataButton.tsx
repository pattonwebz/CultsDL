// src/Components/FetchFilesDataButton.tsx
import React, { useEffect } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import { fetchDownloadPage } from '../../Processors/DownloadPages';
import { FetchButtonProps } from '../../Types/interfaces';

export const FetchFilesDataButton: React.FC<FetchButtonProps> = ({ selectedOrderRowsData, isFetching, setIsFetching, isRowsSelected }) => {
	const [isWorking, setIsWorking] = React.useState(isFetching);
	async function handleFetchDownloadPages (): Promise<void> {
		setIsFetching(true);
		console.log('about to fetch download pages');
		await fetchDownloadPage(selectedOrderRowsData).then(() => {
			console.log('finished Fetching download pages');
			setIsFetching(false);
		});
	}

	useEffect(() => {
		setIsWorking(isFetching);
	}, [isFetching]);

	return (
		<Button
			variant="contained"
			color="secondary"
			onClick={handleFetchDownloadPages}
			disabled={isFetching || isWorking || !isRowsSelected}>
			Fetch Files Data {isWorking && '... '}
			{isWorking && <CircularProgress size={22}/>}
		</Button>
	);
};
