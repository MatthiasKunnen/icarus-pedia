import type {Snippet} from 'svelte';

export type TableValue = string | number | undefined;

export interface TableColumn<Row = any> {
    align?: 'center' | 'right';
    headerDisplay: string;
    id: string;
    render: Snippet<[Row, columnId: string]>;
    /**
     * Columns with reorder set to true will be ordered so that the columns with most values
     * are placed first. If set to false, this column will not be reordered.
     */
    reorder?: boolean;
    sort?: 'asc' | 'desc';
}

export interface TableRow {
    id: TableValue;
    [key: string]: TableValue
}
