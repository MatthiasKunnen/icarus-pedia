import type {Snippet} from 'svelte';

export interface TableColumn<Row = any> {
    align?: 'center' | 'right';
    headerDisplay: string;
    render: Snippet<[Row, columnId: string]>;
    renderOptions?: Snippet<[columnId: string]>;
    sort?: 'asc' | 'desc';
    /**
     * @default true
     */
    sortEnabled?: boolean;
}

export interface TableRow {
    id: string;
    [key: string]: unknown;
}
