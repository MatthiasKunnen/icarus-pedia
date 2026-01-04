import type {Ref, RefWithDataTable} from './common.interface.js';
import type {DataTable} from '../util/datatable.js';

export type WorkshopItemsDataTable = DataTable<WorkshopItemRow>;

export interface WorkshopItemRow {
    Name: string;
    /**
     * Ref to D_ItemTemplate.
     */
    Item: Ref;
    ResearchCost: Array<GameWorkshopCost>;
    ReplicationCost: Array<GameWorkshopCost>;
}

export interface GameWorkshopCost {
    /**
     * Ref to D_MetaCurrency.
     */
    Meta: RefWithDataTable;
    Amount: number;
}

