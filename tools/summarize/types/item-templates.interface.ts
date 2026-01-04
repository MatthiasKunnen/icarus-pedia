import type {Ref} from './common.interface.js';
import type {DataTable} from '../util/datatable.js';

export type ItemTemplateDataTable = DataTable<ItemTemplateRow>;

export interface ItemTemplateRow {
    Name: string;
    ItemStaticData?: Ref;
}
