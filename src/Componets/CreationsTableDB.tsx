
import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {OrdersTableProps} from '../Types/interfaces';

const CreationsTableDB : React.FC<OrdersTableProps>= ({ rows }) => {
	const columns = [
		{ field: 'creation_name', headerName: 'Creation Name', width: 200 },
		{ field: 'creation_date', headerName: 'Creation Date', width: 200 },
		{ field: 'creation_link', headerName: 'Creation Link', width: 200 },
		{ field: 'creation_creator', headerName: 'Creation Creator', width: 200 },
		{ field: 'creation_order_id', headerName: 'Order ID', width: 200 }
	];

	return (
		<div style={{ height: 400, width: '100%' }}>
			<DataGrid rows={rows} columns={columns} />
		</div>
	);
};

export default CreationsTableDB;
