// src/Components/FirstRunMessage.tsx
import React, { useEffect, useState } from 'react';
import { Typography, Button, Box, ButtonGroup } from '@material-ui/core';
import SessionTokenInput from '../Componets/SessionTokenInput';
import { Dialog } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../Contexts/UserDataContext';
import { useAlerts } from '../Contexts/AlertsContext';

const ipcRenderer = window.electron.ipcRenderer;

const FirstRunInstallPage: React.FC = () => {
	const [openModal, setOpenModal] = useState(false);
	const [showFinishButton, setShowFinishButton] = useState(false);

	const [directoriesCreated, setDirectoriesCreated] = useState(false);

	const { installed, setInstalled } = useUserData();

	const navigate = useNavigate();

	const { setAlertSeverity, setAlertMessage, setAlertOpen } = useAlerts();

	const handleFinished = () => {
		localStorage.setItem('installComplete', 'true');
		setInstalled(true);
		navigate('/main');
	};

	const handleInstallClick = () => {
		const directoriesMade = ipcRenderer.invoke('install');
		if (directoriesMade) {
			setDirectoriesCreated(true);
			setOpenModal(true);
		}
	};

	const handleSetTokenClick = () => {
		setOpenModal(true);
	};

	const handleModalClose = () => {
		setOpenModal(false);
	};

	useEffect(() => {
		ipcRenderer.on('test-session-token-reply', (event, valid) => {
			console.log('test-session-token-reply', valid);
			if (valid === true) {
				setShowFinishButton(true);
				setAlertMessage('Session token validated!');
				setAlertOpen(true);
			} else {
				setShowFinishButton(false);
				setAlertMessage('Session token is invalid!');
				setAlertSeverity('error');
				setAlertOpen(true);
			}
		});
	}, []);

	return (
		<>
			<Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
				<Typography variant="h2" component="h1" gutterBottom>
					First Run Install
				</Typography>
				<Typography variant="h5" component="h2" gutterBottom>
					This is your first time running the application
				</Typography>
				<Typography variant="body1" gutterBottom>
					This tool needs to setup some directories and files to store it's data before it can be used.
				</Typography>
				<Typography variant="body1" gutterBottom>
					After that you need to provide a session token from a logged in session on cults.
				</Typography>
				<ButtonGroup orientation="vertical" aria-label="vertical outlined primary button group">
					{showFinishButton || installed
						? (
							<Button variant="contained" color="primary" size="large" onClick={handleFinished}>
								Finish
							</Button>
						)
						: (
							<>
								<Button variant="contained" color="primary" size="large" onClick={handleInstallClick}>
								Create Data Directories
								</Button>
								{directoriesCreated && <Button variant="contained" color="primary" size="large" onClick={handleSetTokenClick}>
								Set Session Token
								</Button>}
							</>
						)
					}
				</ButtonGroup >
			</Box>
	  <Dialog
		  open={openModal}
		  onClose={handleModalClose}
		  aria-labelledby="simple-modal-title"
		  aria-describedby="simple-modal-description"
	  >
		  <Box sx={{ width: 400, bgcolor: 'background.paper', p: 2 }}>
			  <SessionTokenInput/>
		  </Box>
	  </Dialog>
		</>
	);
};

export default FirstRunInstallPage;
