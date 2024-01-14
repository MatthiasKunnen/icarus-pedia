import {getData} from '$lib/data';

export const load = async () => {
    const data = await getData();

    return {
        crafters: Object.entries(data.crafters)
            .sort(([, a], [, b]) => {
                return a.displayName.localeCompare(b.displayName);
            }),
    };
};
