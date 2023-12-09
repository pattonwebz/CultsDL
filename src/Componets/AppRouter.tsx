import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@material-ui/core';
import MainPage from '../Pages/MainPage';
import OrdersPage from '../Pages/OrdersPage';
import OptionsPage from '../Pages/OptionsPage';
import SnackbarAlerts from './SnackbarAlerts';
import HeaderMenu from './HeaderMenu';

const AppRouter: React.FC = () => {
	return (
		<Router>
			<HeaderMenu />
			<Container maxWidth="lg">
				<Routes>
					<Route path="/main" element={<MainPage />} />
					<Route path="/orders" element={<OrdersPage />} />
					<Route path="/options" element={<OptionsPage />} />
					<Route path="*" element={<MainPage />} />
				</Routes>
				<SnackbarAlerts />
			</Container>
		</Router>
	);
};

export default AppRouter;
