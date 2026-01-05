import type {FullItemCount, FullRecipe} from '$lib/recipe.interface';
import type {GameData, ItemCount} from './data.interface';
import summarizedData from '../../tools/summarize/summarized-data.json';

/**
 * Returns the summarized data.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function getData(): Promise<GameData> {
    return summarizedData as any;
}

export function itemCountToFull(ic: ItemCount, data: GameData): FullItemCount {
    const item = data.items[ic.item];
    if (item === undefined) {
        throw new Error(`Could not find item '${ic.item}'`);
    }

    return {
        count: ic.count,
        isResource: false,
        item: {
            displayName: item.displayName,
            icon: item.icon,
            name: ic.item,
        },
    };
}
export function resourceCountToFull(ic: ItemCount, data: GameData): FullItemCount {
    const resource = data.resources[ic.item];
    if (resource === undefined) {
        throw new Error(`Could not find resource '${ic.item}'`);
    }

    return {
        count: ic.count,
        isResource: true,
        item: {
            displayName: resource.displayName,
            icon: resource.recipeIcon,
            name: ic.item,
        },
    };
}

export function getRecipe(recipeName: string, data: GameData): FullRecipe {
    const recipe = data.recipes[recipeName];

    if (recipe === undefined) {
        throw new Error(`Could not find recipe '${recipeName}'`);
    }

    return {
        craftedAt: recipe.craftedAt.map(craftedAtId => ({
            displayName: data.crafters[craftedAtId]?.displayName ?? craftedAtId,
            id: craftedAtId,
        })),
        inputs: [
            ...recipe.inputResources?.map(ic => resourceCountToFull(ic, data)) ?? [],
            ...recipe.inputs.map(ic => itemCountToFull(ic, data)),
            ],
        name: recipeName,
        outputs: [
            ...recipe.outputResources?.map(ic => resourceCountToFull(ic, data)) ?? [],
            ...recipe.outputs.map(ic => itemCountToFull(ic, data)),
        ],
        requirement: recipe.requirement,
    };
}
