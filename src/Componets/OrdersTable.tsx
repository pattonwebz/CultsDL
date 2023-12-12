import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { OrdersTableProps } from '../Types/interfaces';
import CreationColumnItem from './Table/CreationColumnItem';

interface Creation {
	name: string;
	thumbnail: string;
	link: string;
	creator: string;
}

const columns = [
	{ field: 'number', headerName: 'Order Number', width: 100 },
	{
		field: 'creations',
		headerName: 'Creations',
		width: 400,
		renderCell: (params: { value: Creation[]; }) => (
			<div style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
				{params.value.map((creation: Creation, index: number) => (
					<CreationColumnItem key={index} creation={creation} index={index} />
				))}
			</div>
		)
	},
	{ field: 'date', headerName: 'Order Date', width: 100 },
	{ field: 'itemCount', headerName: 'Total Items', width: 80 },
	{ field: 'link', headerName: 'Order Link', width: 150 }
];

interface OrdersTablePropsWithChange extends OrdersTableProps {
	onSelectionChange: (selectedRows: any[]) => void
}
const OrdersTable: React.FC<OrdersTablePropsWithChange> = ({ rows, onSelectionChange }) => {
	const [selectedRows, setSelectedRows] = React.useState([]);

	useEffect(() => {
		onSelectionChange(selectedRows);
	}, [selectedRows]);

	return (
		<div style={{ height: 520, width: '100%' }}>
			<DataGrid
				rows={rows}
				columns={columns}
				pageSize={6}
				rowsPerPageOptions={[6]}
				checkboxSelection
				getRowHeight={() => 'auto'}
				onRowSelectionModelChange={(newRowSelectionModel) => {
					setSelectedRows(newRowSelectionModel);
				}}
				rowSelectionModel={selectedRows}
			/>
		</div>
	);
};

export default OrdersTable;
