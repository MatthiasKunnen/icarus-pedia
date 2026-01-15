import {getData} from '$lib/data';

export const load = async () => {
    const data = await getData();

    return {
        items: Object.entries(data.items)
            .map(([itemId, item]) => [
                itemId,
                {
                    displayName: item.displayName,
                    icon: item.icon,
                    isCraftingRelated: item.isCraftingRelated,
                },
            ] as const)
            .sort(([, a], [, b]) => {
                return a.displayName.localeCompare(b.displayName);
            }),
    };
};
