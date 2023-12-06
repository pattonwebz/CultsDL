// src/Components/OrdersTableDB.tsx
import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { OrdersTableProps } from '../Types/interfaces';

const OrdersTableDB: React.FC<OrdersTableProps> = ({ rows }) => {
	const columns = [
		{ field: 'order_number', headerName: 'Order Number', width: 200 },
		{ field: 'order_date', headerName: 'Order Date', width: 200 },
		{ field: 'order_total', headerName: 'Order Total', width: 200 },
		{ field: 'order_link', headerName: 'Order Link', width: 200 }
	];

	return (
		<div style={{ height: 400, width: '100%' }}>
			<DataGrid rows={rows} columns={columns} />
		</div>
	);
};

export default OrdersTableDB;
