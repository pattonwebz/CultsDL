import React, {useEffect} from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Button, Container, makeStyles } from '@material-ui/core';
import MainPage from '../Pages/MainPage';
import OrdersPage from '../Pages/OrdersPage';
import OptionsPage from '../Pages/OptionsPage';
import {useUserData} from "../Contexts/UserDataContext";
import FirstRunInstallPage from "../Pages/FirstRunInstallPage";

const useStyles = makeStyles({
	router: {
		backgroundColor: '#1f1f28', // Replace with your desired color
	}
});

const AppRouter: React.FC = () => {
	const classes = useStyles();

	const {installed} = useUserData();
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
				</Container>
			</Router>
		);
	}

	return (
		<Router>
			<div className={classes.router}>
				<NavLink to="/main">
					<Button color="primary" disabled={window.location.pathname === '/main'}>
            Main
					</Button>
				</NavLink>
				<NavLink to="/orders">
					<Button color="primary" disabled={window.location.pathname === '/orders'}>
            Orders
					</Button>
				</NavLink>
				<NavLink to="/options">
					<Button color="primary" disabled={window.location.pathname === '/options'}>
            Options
					</Button>
				</NavLink>
			</div>
			<Container maxWidth="lg">
				<Routes>
					<Route path="/main" element={<MainPage />} />
					<Route path="/orders" element={<OrdersPage />} />
					<Route path="/options" element={<OptionsPage />} />
					<Route path="*" element={<MainPage />} />
				</Routes>
			</Container>
		</Router>
	);
};

export default AppRouter;
