import type {Ref, RefWithDataTable} from './common.interface.js';
import type {DataTable} from '../util/datatable.js';

export type ProcessorRecipesDataTable = DataTable<ProcessorRecipesRow>;

export interface ProcessorRecipesRow {
    Name: string;
    bForceDisableRecipe?: boolean;
    Requirement?: Ref;
    RecipeSets: Array<RefWithDataTable>;
    ResourceCostMultipliers: Array<{Value: string}>;
    Inputs: Array<ElementCount>;
    ResourceInputs?: Array<ProcessorRecipeResource>;
    Outputs: Array<ElementCount>;
    ResourceOutputs?: Array<ProcessorRecipeResource>;
}

export interface ElementCount {
    Element: RefWithDataTable;
    Count: number;
}

export interface ProcessorRecipeResource {
    Type: {
        /**
         * Maps to _Resources/D_IcarusResources.json_.
         */
        Value: string;
    };
    RequiredUnits: number;
}
