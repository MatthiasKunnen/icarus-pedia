export interface RecipeSets {
    RowStruct: string;
    Defaults: {
        RecipeSetIcon: string;
        ExperienceMultiplier: number;
        bAllowRefundOfRecipesOnDestroy: boolean;
    };
    Rows: Array<RecipeSetRow>;
}

export interface RecipeSetRow {
    Name: string;
    RecipeSetName: string;
    RecipeSetIcon?: string;
    ExperienceMultiplier: number;
    bAllowRefundOfRecipesOnDestroy: boolean;
}
