import type {Ref} from './common.interface.js';
import type {DataTable} from '../util/datatable.js';

export type ConsumableDataTable = DataTable<ConsumableRow>;

export interface ConsumableRow {
    Name: string;
    Stats: Record<string, number> | undefined;
    Modifier: ConsumableModifier | undefined;
}

export interface ConsumableModifier {
    Modifier: Ref | undefined;
    ModifierLifetime: number | undefined;
    DescriptionText: string | undefined;
}
