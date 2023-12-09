import React from 'react';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from './Themes/MuiTheme';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import AppRouter from './Componets/AppRouter';
import { UserDataProvider } from './Contexts/UserDataContext';
import { AlertsProvider } from './Contexts/AlertsContext';

declare global {
	interface Window {
		electron: {
			ipcRenderer:
			{
                invoke(arg0: string, creationData: Record<string, string | number | string[]>): unknown;
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
				<UserDataProvider>
					<AlertsProvider>
						<AppRouter />
					</AlertsProvider>
				</UserDataProvider>
			</ThemeProvider>
		</>
	);
};

export default App;
