import {getData} from '$lib/data';
import type {Stat} from '$lib/data.interface';

export const load = async () => {
    const data = await getData();
    const food = Object.entries(data.items)
        .filter(([, v]) => {
            switch (v.type) {
                case 'Food':
                case 'Tonic':
                case 'Paste':
                case 'Pill':
                    return true;
                default:
                    return false;
            }
        });

    const stats = new Map<string, Stat>();
    for (const [statId, stat] of Object.entries(data.stats)) {
        food.find(([,item]) => {
            if (item.stats?.[statId] !== undefined) {
                return true
            }
            if (item.modifier?.stats?.[statId] !== undefined) {
                return true
            }

            return false
        })
        stats.set(statId, stat);
    }

    return {
        items: food,
        stats,
    };
};
