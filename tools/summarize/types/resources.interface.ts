import type {DataTable} from '../util/datatable.js';

/**
 * Maps to _Resources/D_IcarusResources.json_.
 */
export type ResourceDataTable = DataTable<ResourceRow>;

export interface ResourceRow {
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
