// src/Main.tsx
import React, { useEffect } from 'react';
import { Divider, Typography, Box, Button, ButtonGroup, Checkbox } from '@material-ui/core';
import SessionTokenInput from '../Componets/SessionTokenInput';
import ClearCacheButton from '../Componets/ClearCacheButton';
import { useUserData } from '../Contexts/UserDataContext';
import { useAlerts } from '../Contexts/AlertsContext';

const OptionsPage: React.FC = () => {
	const fileInputRef = React.useRef(null);

	const { getDownloadDirectory, saveDownloadDirectory } = useUserData();
	const [value, setValue] = React.useState('');
	const [directoryPath, setDirectoryPath] = React.useState(getDownloadDirectory);

	const { setAlertDuration, setAlertMessage, setAlertSeverity, setAlertOpen } = useAlerts();

	const { getDebug, saveDebug } = useUserData();
	const [checked, setChecked] = React.useState(getDebug);

	const initialDebugState = getDebug();

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setChecked(event.target.checked);
	};

	useEffect(() => {
		if (checked) {
			console.log('Debug mode enabled');
		}
		saveDebug(checked);

		if (initialDebugState !== checked) {
			setAlertMessage('Debug mode changed, please restart the app for changes to take effect!');
			setAlertSeverity('warning');
			setAlertOpen(true);
			setAlertDuration(60000);
		}
	}, [checked]);

	const handleChange = (fileInputChange: React.ChangeEvent<HTMLInputElement>): void => {
		// Check if fileInputChange and its properties exist
		if (fileInputChange && fileInputChange.target && fileInputChange.target.files && fileInputChange.target.files.length > 0) {
			const file = fileInputChange.target.files[0];

			// Check if the file and its path property exist
			if (file && file.path) {
				const filepath = file.path;
				const directoryPath = filepath.substring(0, filepath.lastIndexOf('/'));

				setDirectoryPath(directoryPath);
			} else {
				console.error('The selected file does not have a path property');
			}
		} else {
			console.error('No file was selected');
		}
		setValue('');
	};

	const handleOpeningDirectoryPickerInput = (): void => {
		fileInputRef.current.click();
		setAlertMessage('Directory saved successfully!');
		setAlertSeverity('success');
		setAlertOpen(true);
	};

	const handleRemovingDirectory = (): void => {
		setDirectoryPath('');
		setAlertMessage('Directory cleared, will use app folder in home directory!');
		setAlertSeverity('info');
		setAlertOpen(true);
	};

	useEffect(() => {
		saveDownloadDirectory(directoryPath);
	}, [directoryPath]);

	return (
		<>
			<Typography variant="h4">
                Token
			</Typography>
			<Typography variant="body2">
                You need to get this token from a logged in session on cults. See the readme for how to get this.
			</Typography>
			<SessionTokenInput/>

			<Box my={2}>
				<Divider/>
			</Box>
			<Typography>
				The directory to save the files to: <code>{directoryPath}</code>
			</Typography>

			<ButtonGroup variant="contained">
				<Button color="primary" onClick={handleOpeningDirectoryPickerInput}>
					Choose downloads directory
				</Button>
				<Button color="secondary" onClick={handleRemovingDirectory}>
					Clear directory and use default in home path
				</Button>
			</ButtonGroup>

			<input ref={fileInputRef} style={{ display: 'none' }} type="file" value={value} onChange={handleChange} webkitdirectory="true"/>

			<Box my={2}>
				<Divider/>
			</Box>

			<Typography variant="h4">
                Cache
			</Typography>
			<ClearCacheButton/>
			<Box my={2}>
				<Divider/>
			</Box>
			<Typography variant="h4">
				Debug Mode
			</Typography>
			<Typography>When using debug mode more data is logged to the command terminal and console.</Typography>
			<Checkbox checked={checked} onChange={handleCheckboxChange} /> Enable Debug
		</>
	);
};

export default OptionsPage;
