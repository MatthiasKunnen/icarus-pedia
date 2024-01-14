import type {Ref} from './common.interface.js';

export interface StatsFile {
    RowStruct: string;
    Rows: Array<StatsRow>;
}

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
