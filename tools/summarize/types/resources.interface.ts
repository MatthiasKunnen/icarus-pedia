/**
 * Maps to _Resources/D_IcarusResources.json_.
 */
export interface ResourcesFile {
    RowStruct: string;
    Rows: Array<ResourcesFileRow>;
}

export interface ResourcesFileRow {
    Name: string;
    /**
     * Translation containing string.
     */
    DisplayName: string;
    /**
     * Translation containing string.
     */
    Units: string;
    Resource_Icon: string;
    /**
     * Icon displayed in recipes.
     */
    Recipe_Icon: string;
}
