export interface ModifierStatesFile {
    RowStruct: string;
    Rows: Array<ModifierStateRow>;
}

export interface ModifierStateRow {
    Name: string;
    ModifierIcon: string | undefined;
    ModifierName: string | undefined;
    ModifierDescription: string | undefined;
    GrantedStats: Record<string, number> | undefined;
}
