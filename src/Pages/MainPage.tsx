// src/Main.tsx
import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@material-ui/core';
import {useUserData} from "../Contexts/UserDataContext";

const MainPage: React.FC = () => {

	const {installed} = useUserData();

	const navigate = useNavigate();

	const handleGetStartedClick = () => {
		navigate('/install');
	};

	return (
		<>
			<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="90vh">
				<Typography variant="h2" component="h1" gutterBottom>
					 Welcome to CultsDL
				</Typography>
				<Typography variant="h5" component="h2" gutterBottom>
					Your one-stop solution for managing your Cults3D orders
				</Typography>
				<Typography variant="body1" gutterBottom>
					CultsDL is a tool designed to automate the downloading tasks of your Cults3D orders.
					Cults3D doesn't provide a convenient way to do this, hence the creation of this application.
				</Typography>
				<Typography variant="body1" gutterBottom>
					In addition to downloading, CultsDL also organizes your files in a way that suits your preference.
				</Typography>
				{!installed && (
					<Button variant="contained" color="primary" size="large" onClick={handleGetStartedClick}>
						Get Started
					</Button>
				)}
			</Box>

		</>
	);
};

export default MainPage;
