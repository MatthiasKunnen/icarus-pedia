export interface Crafter {
    displayName: string;
    icon: string;
    recipes: Array<string>;
}

export interface Item {
    crafter: string | undefined;
    displayName: string;
    /**
     * Whether the item can be crafted or is used in a recipe.
     * Undefined and true means usable.
     */
    usable: boolean | undefined;
    icon: string;
    description: string | undefined;
    flavorText: string | undefined;
    type: ItemType | undefined;
    recipes: Array<string>;
    ingredientIn: Array<string>;

    /**
     * E.g.
     * - knife skin yield
     * - immediate food effect
     */
    stats: ItemStats | undefined;

    /**
     * E.g.
     * - limited duration food effects
     * - bandage effect
     */
    modifier: ItemModifier | undefined;
    workshopItem: WorkshopItem | undefined;
}

export type ItemType =
    | 'Food'
    | 'Paste'
    | 'Pill'
    | 'Tonic';

export interface WorkshopItem {
    researchCost: WorkshopCost;
    craftCost: WorkshopCost;
}

export type WorkshopCost = Partial<Record<WorkshopCurrency, number>>;

export type WorkshopCurrency = 'Biomass' | 'Credits' | 'Exotic_Red' | 'Exotic1';

export interface ItemModifier {
    stats: ItemStats | undefined;
    lifetime: number | undefined;
}

export type ItemStats = Record<string, number>;

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

export interface Stat {
    positiveFormat: string;
    negativeFormat: string | undefined;
}

export interface GameData {
    crafters: Record<string, Crafter>;
    items: Record<string, Item>;
    recipes: Record<string, Recipe>;
    stats: Record<string, Stat>;
}
