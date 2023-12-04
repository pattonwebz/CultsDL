// src/Main.tsx
import React from 'react';
import { Divider, Typography, Box, Input } from '@material-ui/core';
import SessionTokenInput from '../Componets/SessionTokenInput';
import ClearCacheButton from '../Componets/ClearCacheButton';
import { MuiFileInput } from 'mui-file-input';

const OptionsPage: React.FC = () => {
	const [value, setValue] = React.useState('');

	const handleChange = (fileInputChange) => {
		const fipath = fileInputChange.target.files[0].path;

		setValue(fipath);
	};

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
