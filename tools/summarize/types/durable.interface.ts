import type {RefWithDataTable} from './common.interface.js';
import type {DataTable} from '../util/datatable.js';

export type DurableDataTable = DataTable<DurableRow>;

export interface DurableRow {
    Name: string;
    Destroyed_At_Zero?: boolean;
    Max_Durability?: number;
    ItemsForRepair?: Array<ItemForRepair>;
}

export interface ItemForRepair {
    Item: RefWithDataTable;
    Amount: number;
}
