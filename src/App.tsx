import React from 'react';
import { SessionTokenProvider } from './Contexts/SessionTokenContext';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './Themes/MuiTheme';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import AppRouter from './Componets/AppRouter';

declare global {
	interface Window {
		electron: {
			ipcRenderer:
			{
				on: (event: string, callback: (event: any, ...args: any[]) => void) => void
				send: (event: string, ...args: any[]) => void
			}
			receive: (channel: string, func: (event: any, ...args: any[]) => void) => void
		}
	}
}

const App: React.FC = () => {
	return (
		<>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<SessionTokenProvider>
					<AppRouter />
				</SessionTokenProvider>
			</ThemeProvider>
		</>
	);
};

export default App;
