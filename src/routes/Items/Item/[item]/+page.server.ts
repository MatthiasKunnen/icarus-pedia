import {getData, getRecipe} from '$lib/data';

export const load = async ({params}) => {
    const data = await getData();
    const itemName = params.item;
    const item = data.items[itemName];

    if (item === undefined) {
        throw new Error('404');
    }

    const crafter = item.crafter === undefined ? undefined : data.crafters[item.crafter];

    return {
        crafts: crafter?.recipes.map(r => getRecipe(r, data)) ?? [],
        item: item,
        ingredientIn: item.ingredientIn.map(r => getRecipe(r, data)),
        recipes: item.recipes.map(r => getRecipe(r, data)),
        title: item.displayName,
    };
};
