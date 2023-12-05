// src/Main.tsx
import React, {useEffect} from 'react';
import { Divider, Typography, Box, Button } from '@material-ui/core';
import SessionTokenInput from '../Componets/SessionTokenInput';
import ClearCacheButton from '../Componets/ClearCacheButton';
import { useUserData } from '../Contexts/UserDataContext';

const OptionsPage: React.FC = () => {

	const {downloadDirectory, saveDownloadDirectory} = useUserData();
	const [value, setValue] = React.useState('');
	const [directoryPath, setDirectoryPath] = React.useState(downloadDirectory);

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

	const handleRemovingDirectory = (): void => {
		setDirectoryPath('');
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
				The directory to save the files to: <code>{downloadDirectory}</code>
			</Typography>
			<Button variant="contained" onClick={handleRemovingDirectory}>
				Clear directory and use default in home path
			</Button>
			<input type="file" value={value} onChange={handleChange} webkitdirectory="true"/>

			<Box my={2}>
				<Divider/>
			</Box>

			<Typography variant="h4">
                Cache
			</Typography>
			<ClearCacheButton/>
		</>
	);
};

export default OptionsPage;
