export interface FullRecipe {
    craftedAt: Array<string>;
    inputs: Array<FullItemCount>;
    name: string;
    outputs: Array<FullItemCount>;
    requirement: string | undefined;
}

export interface FullItemCount {
    count: number;
    item: RecipeItem;
}

export interface RecipeItem {
    description: string | undefined;
    displayName: string;
    flavorText: string | undefined;
    icon: string;
    name: string;
}