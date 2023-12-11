import { Box, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { LinearProgress } from '@mui/material';

export const DownloadProgress = () => {
	const [showProgress, setShowProgress] = useState(false);

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
		setShowProgress(progress.fileName !== '');
	}, [progress]);

	return (
		<>
			<Box className={showProgress ? 'slideIn' : 'slideOut'}>
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
		</>
	);
};

export default DownloadProgress;
