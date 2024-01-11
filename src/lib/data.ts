import fs from 'node:fs';
import path from 'node:path';

import type {FullItemCount, FullRecipe} from '$lib/recipe.interface';
import type {GameData, ItemCount} from './data.interface';

const summarizedDataPath = path.join(
    process.cwd(),
    'tools',
    'summarize',
    'summarized-data.json',
);

export async function getData(): Promise<GameData> {
    const dataString = await fs.promises.readFile(summarizedDataPath, {encoding: 'utf-8'});
    return JSON.parse(dataString);
}

export function itemCountToFull(ic: ItemCount, data: GameData): FullItemCount {
    const item = data.items[ic.item];
    if (item === undefined) {
        throw new Error(`Could not find item '${ic.item}'`);
    }

    return {
        count: ic.count,
        item: {
            description: item.description,
            displayName: item.displayName,
            flavorText: item.flavorText,
            icon: item.icon,
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
        craftedAt: recipe.craftedAt,
        inputs: recipe.inputs.map(ic => itemCountToFull(ic, data)),
        name: recipeName,
        outputs: recipe.outputs.map(ic => itemCountToFull(ic, data)),
        requirement: recipe.requirement,
    };
}
