export interface FullRecipe {
    craftedAt: Array<FullRecipeCraftedAt>;
    inputs: Array<FullItemCount>;
    name: string;
    outputs: Array<FullItemCount>;
    requirement: string | undefined;
}

export interface FullRecipeCraftedAt {
    id: string;
    displayName: string;
}

export interface FullItemCount {
    count: number;
    isResource: boolean;
    item: RecipeItem;
}

export interface RecipeItem {
    displayName: string;
    icon: string;
    name: string;
}
