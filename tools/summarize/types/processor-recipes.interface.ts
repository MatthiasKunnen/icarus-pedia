import type {Ref, RefWithDataTable} from './common.interface.js';

export interface ProcessorRecipes {
    RowStruct: string;
    Rows: Array<ProcessorRecipesRow>;
}

export interface ProcessorRecipesRow {
    Name: string;
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
