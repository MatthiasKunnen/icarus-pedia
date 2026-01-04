import type {DataTable} from '../util/datatable.js';

export type RecipeSetsDataTable = DataTable<RecipeSetRow, {
    RecipeSetIcon: string;
    ExperienceMultiplier: number;
    bAllowRefundOfRecipesOnDestroy: boolean;
}>;

export interface RecipeSetRow {
    Name: string;
    RecipeSetName: string;
    RecipeSetIcon?: string;
    ExperienceMultiplier: number;
    bAllowRefundOfRecipesOnDestroy: boolean;
}
