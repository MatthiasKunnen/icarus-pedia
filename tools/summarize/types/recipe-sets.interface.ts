import type {DataTable} from '../util/datatable.js';

export type RecipeSetsDataTable = DataTable<RecipeSetRow>;

export interface RecipeSetRow {
    Name: string;
    RecipeSetName: string;
    RecipeSetIcon?: string;
    ExperienceMultiplier: number;
    bAllowRefundOfRecipesOnDestroy: boolean;
}
