import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@material-ui/core';
import MainPage from '../Pages/MainPage';
import OrdersPage from '../Pages/OrdersPage';
import FilesPage from '../Pages/FilesPage';
import OptionsPage from '../Pages/OptionsPage';
import { useUserData } from '../Contexts/UserDataContext';
import FirstRunInstallPage from '../Pages/FirstRunInstallPage';
import SnackbarAlerts from './SnackbarAlerts';
import HeaderMenu from './HeaderMenu';

const AppRouter: React.FC = () => {
	const { installed } = useUserData();
	console.log('AppRouter installed', installed);

	useEffect(() => {
		console.log('AppRouter install changed', installed);
	}, [installed]);

	if (!installed) {
		return (
			<Router>
				<Container maxWidth="lg">
					<Routes>
						<Route path="*" element={<MainPage />} />
						<Route path="/install" element={<FirstRunInstallPage />} />
					</Routes>
					<SnackbarAlerts />
				</Container>
			</Router>
		);
	}

	return (
		<Router>
			<HeaderMenu />
			<Container maxWidth="lg">
				<Routes>
					<Route path="/main" element={<MainPage />} />
					<Route path="/orders" element={<OrdersPage />} />
					<Route path="/files" element={<FilesPage />} />
					<Route path="/options" element={<OptionsPage />} />
					<Route path="*" element={<MainPage />} />
				</Routes>
				<SnackbarAlerts />
			</Container>
		</Router>
	);
};

export default AppRouter;
