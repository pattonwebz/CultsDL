// src/Main.tsx
import React from 'react';
import { Typography } from '@material-ui/core';

const MainPage: React.FC = () => {
	return (
		<>
			<Typography variant="h4" component="h1">
                CultsDL
			</Typography>
			<Typography variant="body1">
                This is a tool to download your Cults3D orders. Cults3D doesn't have a good way to do this so that's why I created this application.
			</Typography>
			<Typography variant="body1">
                This application basically acts on your behalf to automate the downloading tasks.
			</Typography>
			<Typography>
                It also has some logic to organise the files in the way that I like. You can use it to organise the files in the way that you like.
			</Typography>
		</>
	);
};

export default MainPage;
