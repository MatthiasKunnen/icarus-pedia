import type {DataTable} from '../util/datatable.js';

export type ModifierStateDataTable = DataTable<ModifierStateRow>;

export interface ModifierStateRow {
    Name: string;
    ModifierIcon: string | undefined;
    ModifierName: string | undefined;
    ModifierDescription: string | undefined;
    GrantedStats: Record<string, number> | undefined;
}
