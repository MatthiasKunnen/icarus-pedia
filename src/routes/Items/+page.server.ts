import {getData} from '$lib/data';

export const load = async () => {
    const data = await getData();

    return {
        items: Object.entries(data.items)
            .filter(([_, item]) => item.recipes.length > 0)
            .sort(([, a], [, b]) => {
                return a.displayName.localeCompare(b.displayName);
            }),
    };
};
