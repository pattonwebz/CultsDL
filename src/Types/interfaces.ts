import React from 'react';

export interface Order {
    id?: number
    number: string
    date: string
    price: string
    link: string
    creations?: Creation[]
}

export interface Creation {
    id?: number
    title: string
    thumbnail: string
    link: string
    creator: string
}

export interface CrationWithData extends Creation {
    description: string
    tags: string[]
}

export interface OrdersTableProps {
	rows: any[];
}

export interface FetchButtonProps {
    selectedOrderRowsData: Order[];
    isFetching: boolean;
    setIsFetching: React.Dispatch<React.SetStateAction<boolean>>;
    isRowsSelected: boolean;
}
