import type {Ref, RefWithDataTable, Tags} from './common.interface.js';
import type {ItemStats} from '../../../src/lib/data.interface.js';
import type {DataTable} from '../util/datatable.js';

export type ItemStaticDataTable = DataTable<ItemStaticRow>;

export interface ItemStaticRow {
    Name: string;
    Actionable?: Ref;
    Consumable?: Ref;
    Decayable?: Ref;
    Durable?: RefWithDataTable;
    Floatable?: Ref;
    Focusable?: Ref;
    Highlightable?: Ref;
    Attachments?: Ref;
    Interactable?: Ref;
    Itemable?: Ref;
    Meshable?: Ref;
    Transmutable?: Ref;
    Usable?: Ref;
    Audio?: Ref;
    CraftingExperience?: number;
    AdditionalStats?: ItemStats;
    Manual_Tags?: Tags;
    Generated_Tags?: Tags;
    Processing?: Ref;
}
