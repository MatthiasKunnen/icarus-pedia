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
    Inputs: Array<ProcessorRecipeInput>;
    Outputs: Array<ProcessorRecipeOutput>;
}

export interface ProcessorRecipeInput {
    Element: RefWithDataTable;
    Count: number;
}

export interface ProcessorRecipeOutput {
    Element: RefWithDataTable;
    Count: number;
}
