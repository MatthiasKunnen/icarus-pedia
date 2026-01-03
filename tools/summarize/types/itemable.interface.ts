export interface Itemable {
    RowStruct: string;
    Rows: Array<ItemableRow>;
}

export interface ItemableRow {
    Name: string;
    DisplayName: string;
    Icon?: string;
    Description: string;
    FlavorText?: string;
    Weight: number;
    MaxStack: number;
}
