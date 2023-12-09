import React, { createContext, useState, useContext, PropsWithChildren } from 'react';

type AlertsContextType = {
  alertMessage: string;
  setAlertMessage: React.Dispatch<React.SetStateAction<string>>;
  alertSeverity: string;
  setAlertSeverity: React.Dispatch<React.SetStateAction<string>>;
  alertOpen: boolean;
  setAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
  alertDuration: number;
  setAlertDuration: React.Dispatch<React.SetStateAction<number>>;
};

const AlertsContext = createContext<AlertsContextType | null>(null);

const AlertsProvider: React.FC<PropsWithChildren<any>> = ({ children }) => {
	const [alertMessage, setAlertMessage] = useState('An alert');
	const [alertSeverity, setAlertSeverity] = useState('success');
	const [alertOpen, setAlertOpen] = useState(false);
	const [alertDuration, setAlertDuration] = useState(6000);

	return (
		<AlertsContext.Provider value={{ alertMessage, setAlertMessage, alertSeverity, setAlertSeverity, alertOpen, setAlertOpen, alertDuration, setAlertDuration }}>
			{children}
		</AlertsContext.Provider>
	);
};

const useAlerts = () => {
	const context = useContext(AlertsContext);
	if (context === null) {
		throw new Error('useUserData must be used within a UserDataProvider');
	}
	return context;
};

export { AlertsProvider, useAlerts };
