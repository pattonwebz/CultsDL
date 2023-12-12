// src/Main.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Box } from '@material-ui/core';
import { useUserData } from '../Contexts/UserDataContext';
import HowToUseThisSoftwareAccordion from '../Componets/Info/HowToUseThisSoftwareAccordion';

const MainPage: React.FC = () => {
	const { installed } = useUserData();

	const navigate = useNavigate();

	const handleGetStartedClick = () => {
		navigate('/install');
	};

	return (
		<>
			<Box height="90vh">
				<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
					<Typography variant="h2" component="h1" gutterBottom>
						Welcome to CultsDL
					</Typography>
					<Typography variant="h5" component="h2" gutterBottom>
						Your one-stop solution for managing your Cults3D orders
					</Typography>
				</Box>
				<Typography variant="body1" gutterBottom>
					CultsDL is a tool designed to automate the downloading tasks of your Cults3D orders.
					Cults3D doesn't provide a convenient way to do this, hence the creation of this application.
				</Typography>

				<Typography variant="body1" gutterBottom>
					This is an opinionated software without many customization options thus far. If you prefer it to
					work another way let me know and I will try to solve that for you.
				</Typography>

				<Typography variant="body1" gutterBottom>
					When processing orders, creations and files there are some artificial delays added to be
					respectful of Cults3D's servers and to avoid being rate limited or blocked. I am tweaking
					these values as I test to find the right balance between speed and reliability. I have setup the
					caching with a moderate lifetime (1 week) to avoid unnecessary requests to Cults3D's servers. I am
					considering making the cache even longer since the data doesn't change often.
				</Typography>

				<Typography>
					When downloading creations, the files are saved in a folder structure like this:
					[Creator Name]/[Creation Name].
				</Typography>
				<Typography variant="body1" gutterBottom>
					If you have fetched the extra creation data images are also saved where possible in the `Images`
					folder along with a	'description.txt' file that holds the description and tags from the listing.
				</Typography>
				<HowToUseThisSoftwareAccordion />
				<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
					{!installed
						? (
							<Button variant="contained" color="primary" size="large" onClick={handleGetStartedClick}>
							Get Started
							</Button>
						)
						: (
							<>
								<Typography variant="body1" gutterBottom>
								You're all set up! Go to the Orders page to get started.
								</Typography>
								<Button variant="contained" color="primary" size="large" onClick={() => navigate('/orders')}>
								Go to Orders
								</Button>
							</>
						)}
				</Box>
			</Box>
		</>
	);
};

export default MainPage;
