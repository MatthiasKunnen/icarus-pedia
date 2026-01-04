import {getData, getRecipe} from '$lib/data';

export const load = async ({params}) => {
    const data = await getData();
    const resourceId = params.resource;
    const resource = data.resources[resourceId];

    if (resource === undefined) {
        throw new Error('404');
    }

    return {
        displayName: resource.displayName,
        icon: resource.resourceIcon,
        ingredientIn: resource.ingredientIn.map(r => {
            const recipe = getRecipe(r, data);
            const i = recipe.inputs.findIndex(input => input.item.name === resourceId);
            if (i > 0) {
                // Move item to front
                recipe.inputs.unshift(recipe.inputs.splice(i, 1)[0]!);
            }

            return getRecipe(r, data);
        }),
        recipes: resource.recipes.map(r => getRecipe(r, data)),
    };
};
