import type {Ref, RefWithDataTable} from './common.interface.js';

export interface WorkshopItemsFile {
    RowStruct: string;
    Rows: Array<WorkshopItemRow>;
}

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

