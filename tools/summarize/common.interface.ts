export interface Ref {
    RowName: string;
}

export interface RefWithDataTable {
    RowName: string;
    DataTableName: string;
}

export interface Tags {
    GameplayTags: Array<Tag>;
}

export interface Tag {
    TagName: string;
}
