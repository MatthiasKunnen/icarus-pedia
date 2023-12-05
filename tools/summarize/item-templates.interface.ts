import type {Ref} from './common.interface.js';

export interface ItemTemplates {
    RowStruct: string;
    Rows: Array<ItemTemplateRow>;
}

export interface ItemTemplateRow {
    Name: string;
    ItemStaticData?: Ref;
}
