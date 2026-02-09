import type {DataTable} from '../util/datatable.js';

export type ToolDamageDataTable = DataTable<ToolDamageRow>;

export interface ToolDamageRow {
    Name: string;
    Melee_Damage?: number;
    DamageVariationPercentage?: number;
    Felling_Damage?: number;
    Felling_Efficiency?: number;
    Mining_Radius?: number;
    Mining_Efficiency?: number;
    Skinning_Efficiency?: number;
    Reaping_Efficiency?: number;
    Shattering_Damage?: number;
    Shattering_Efficiency?: number;
}
