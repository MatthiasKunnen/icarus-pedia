import {getData, getRecipe} from '$lib/data';

export const load = async ({params}) => {
    const data = await getData();
    const itemName = params.item;
    const item = data.items[itemName];
    console.log(itemName, item);

    if (item === undefined) {
        throw new Error('404');
    }

    return {
        item: item,
        ingredientIn: item.ingredientIn.map(r => getRecipe(r, data)),
        recipes: item.recipes.map(r => getRecipe(r, data)),
        title: item.displayName,
    };
};
