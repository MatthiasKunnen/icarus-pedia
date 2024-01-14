import {getData, getRecipe} from '$lib/data';

export const load = async ({params}) => {
    const data = await getData();
    const crafterName = params.crafter;
    const crafter = data.crafters[crafterName];

    if (crafter === undefined) {
        throw new Error('404');
    }

    return {
        crafter: crafter,
        recipes: crafter.recipes.map(r => getRecipe(r, data)),
    };
};
