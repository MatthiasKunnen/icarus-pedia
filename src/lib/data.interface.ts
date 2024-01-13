export interface Crafter {
    displayName: string;
    icon: string;
    recipes: Array<string>;
}

export interface Item {
    crafter: string | undefined;
    displayName: string;
    icon: string;
    description: string | undefined;
    flavorText: string | undefined;
    isFood: boolean;
    recipes: Array<string>;
    ingredientIn: Array<string>;
}

export interface ItemCount {
    item: string;
    count: number;
}

export interface Recipe {
    requirement: string | undefined;
    craftedAt: Array<string>;
    inputs: Array<ItemCount>;
    outputs: Array<ItemCount>;
}

export interface GameData {
    crafters: Record<string, Crafter>;
    items: Record<string, Item>;
    recipes: Record<string, Recipe>;
}
