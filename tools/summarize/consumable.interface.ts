import type {Ref} from './common.interface.js';

export interface ConsumableFile {
    RowStruct: string;
    Rows: Array<ConsumableRow>;
}

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
