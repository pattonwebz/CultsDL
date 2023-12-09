import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
	router: {
		backgroundColor: '#1f1f28' // Replace with your desired color
	},
	activeButton: {
		'& button': {
			color: '#ffffff'
		}
	}
});

const HeaderMenu: React.FC = () => {
	const classes = useStyles();
	const location = useLocation();

	return (
		<div className={classes.router}>
			<NavLink to="/main">
				<Button className="navButton" color="primary" disabled={location.pathname === '/main' || location.pathname === '/'}>
					Main
				</Button>
			</NavLink>
			<NavLink to="/orders">
				<Button className="navButton" color="primary" disabled={location.pathname === '/orders'}>
					Orders
				</Button>
			</NavLink>
			<NavLink to="/options">
				<Button className="navButton" color="primary" disabled={location.pathname === '/options'}>
					Options
				</Button>
			</NavLink>
		</div>
	);
};

export default HeaderMenu;
