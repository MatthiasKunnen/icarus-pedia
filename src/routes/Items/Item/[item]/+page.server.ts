import {getData, getRecipe} from '$lib/data';
import type {ItemStats, Stat} from '$lib/data.interface';
import {formatStat} from '$lib/util/stat.util';

export const load = async ({params}) => {
    const data = await getData();
    const itemName = params.item;
    const item = data.items[itemName];

    if (item === undefined) {
        throw new Error('404');
    }

    const crafter = data.crafters[itemName];

    const itemStats = mapStats(item.stats, data.stats);

    const itemModifier = item.modifier === undefined
        ? undefined
        : {
            stats: mapStats(item.modifier.stats, data.stats),
            lifetime: item.modifier.lifetime,
        };

    return {
        crafts: crafter?.recipes.map(r => getRecipe(r, data)) ?? [],
        description: item.description,
        displayName: item.displayName,
        flavorText: item.flavorText,
        icon: item.icon,
        ingredientIn: item.ingredientIn.map(r => {
            const recipe = getRecipe(r, data);
            const i = recipe.inputs.findIndex(input => input.item.name === itemName);
            if (i >= 0) {
                // Move item to front
                recipe.inputs.unshift(recipe.inputs.splice(i, 1)[0]!);
            }

            return recipe;
        }),
        modifier: itemModifier,
        recipes: item.recipes.map(r => getRecipe(r, data)),
        stackSize: item.stackSize,
        stats: itemStats,
        weight: item.weight,
    };
};

function mapStats(itemStats: ItemStats | undefined, statsMap: Record<string, Stat>): Array<string> {
    if (itemStats === undefined) {
        return [];
    }

    return Object.entries(itemStats).map(([name, value]) => {
        return formatStat(name, value, statsMap);
    });
}
