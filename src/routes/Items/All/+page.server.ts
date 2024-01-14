import {getData} from '$lib/data';

export const load = async () => {
    const data = await getData();

    return {
        items: Object.entries(data.items)
            .sort(([, a], [, b]) => {
                return a.displayName.localeCompare(b.displayName);
            }),
    };
};
