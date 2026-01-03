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
    Outputs: Array<ElementCount>;
}

export interface ElementCount {
    Element: RefWithDataTable;
    Count: number;
}
