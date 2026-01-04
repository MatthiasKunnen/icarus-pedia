import type {Ref} from './common.interface.js';
import type {DataTable} from '../util/datatable.js';

export type TalentsDataTable = DataTable<TalentsRow>;

export interface TalentsRow {
    Name: string;
    ExtraData: Ref | undefined;
    TalentTree: Ref | undefined;
    RequiredTalents: Array<Ref> | undefined;
    bDefaultUnlocked: boolean;
}
