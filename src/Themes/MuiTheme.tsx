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
			main: '#red'
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

export default theme;