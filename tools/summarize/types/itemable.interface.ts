import type {DataTable} from '../util/datatable.js';

/**
 * Contains name, description, and icon link of an item.
 */
export type ItemableDataTable = DataTable<ItemableRow>;

export interface ItemableRow {
    Name: string;
    DisplayName: string;
    Icon?: string;
    Description: string;
    FlavorText?: string;
    /**
     * Weight in grams.
     */
    Weight: number;
    MaxStack: number;
    bAllowZeroWeight: boolean;
}
