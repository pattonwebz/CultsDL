import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
	typography: {
		fontSize: 16,
		h1: {
			fontSize: '2rem' // Adjust as needed
		},
		h2: {
			fontSize: '1.75rem' // Adjust as needed
		},
		h3: {
			fontSize: '1.5rem' // Adjust as needed
		},
		h4: {
			fontSize: '1.25rem' // Adjust as needed
		},
		h5: {
			fontSize: '1rem' // Adjust as needed
		},
		h6: {
			fontSize: '0.875rem' // Adjust as needed
		}
	},
	palette: {
		primary: {
			main: '#ae77f8'
		},
		secondary: {
			main: '#4a4a4a'
		},
		error: {
			main: '#dc143c' // red hex code here
		}
	},
	overrides: {
		MuiTypography: {
			root: {
				margin: '10px 0' // Add margin as needed
			}
		}
	}
});

const reds = {
	PureRed: '#FF0000',
	DarkRed: '#8B0000',
	FirebrickRed: '#B22222',
	IndianRed: '#CD5C5C',
	TomatoRed: '#FF6347',
	CrimsonRed: '#DC143C',
	CoralRed: '#FF7F50'
};

export default theme;
