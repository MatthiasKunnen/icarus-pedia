import type {Ref, Tags} from './common.interface.js';
import type {ItemStats} from '../../../src/lib/data.interface.js';

export interface ItemsStatic {
    RowStruct: string;
    Rows: Array<ItemStaticRow>;
}

export interface ItemStaticRow {
    Name: string;
    Actionable?: Ref;
    Consumable?: Ref;
    Decayable?: Ref;
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
