import type {Ref} from './common.interface.js';
import type {DataTable} from '../util/datatable.js';

export type StatsDataTable = DataTable<StatsRow>;

export interface StatsRow {
    Name: string;
    Title: string | undefined;
    icon: string | undefined;
    PositiveTitleFormat: string | undefined;
    NegativeTitleFormat: string | undefined;
    PositiveDescription: string | undefined;
    NegativeDescription: string | undefined;
    StatCategory: Ref;
}
