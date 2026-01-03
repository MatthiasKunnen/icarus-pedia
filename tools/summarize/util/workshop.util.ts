import type {WorkshopCost, WorkshopItem} from '../../../src/lib/data.interface.js';
import type {GameWorkshopCost, WorkshopItemRow} from '../types/workshop-items.interface.js';

export function workshopItemToSummary(workshopItem: WorkshopItemRow): WorkshopItem {
    return {
        craftCost: workshopItemCostSummarize(workshopItem.ReplicationCost),
        researchCost: workshopItemCostSummarize(workshopItem.ResearchCost),
    };
}

function workshopItemCostSummarize(cost: Array<GameWorkshopCost>): WorkshopCost {
    const result: WorkshopCost = {};
    for (const workshopCost of cost) {
        switch (workshopCost.Meta.RowName) {
            case 'Biomass':
            case 'Credits':
            case 'Exotic_Red':
            case 'Exotic1':
                result[workshopCost.Meta.RowName] = workshopCost.Amount;
                break;
            default:
                throw new Error(
                    `Workshop credit currency ${workshopCost.Meta.RowName} is not known`,
                );
        }
    }
    return result;
}
