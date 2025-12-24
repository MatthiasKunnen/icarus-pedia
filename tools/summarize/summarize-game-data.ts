import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'url';

import type {RefWithDataTable} from './common.interface.js';
import type {ConsumableFile, ConsumableRow} from './consumable.interface.js';
import type {ItemsStatic} from './item-static.interface.js';
import type {ItemTemplates} from './item-templates.interface.js';
import type {Itemable} from './itemable.interface.js';
import type {ModifierStateRow, ModifierStatesFile} from './modifier-states.interface.js';
import type {ElementCount, ProcessorRecipes} from './processor-recipes.interface.js';
import type {RecipeSets} from './recipe-sets.interface.js';
import type {StatsFile} from './stats.interface.js';
import {extractTranslation} from './util/localization.util.js';
import {sortObjectKeys} from './util/object.util.js';
import {extractStats, getModifier} from './util/stats.util.js';
import {staticItemTagMatches} from './util/tag.util.js';
import type {
    Crafter,
    GameData,
    ItemCount,
    ItemStats,
    Item as OutputItem,
    Recipe as OutputRecipe,
    Stat,
} from '../../src/lib/data.interface.js';

/*
 * Maps the data found in the game's several json files and massage them to something smaller we can
 * use.
 * Run: yarn run run:tool tools/summarize/summarize-game-data.ts
 */

const dirname = path.dirname(fileURLToPath(import.meta.url));
const gameDataPath = path.join(dirname, '..', '..', 'gamedata', 'data_pak');

async function readData(filepath: string): Promise<any> {
    return JSON.parse(await fs.promises.readFile(path.join(
        gameDataPath,
        ...filepath.split('/'),
    ), {encoding: 'utf-8'}));
}

const itemsStatic: ItemsStatic = await readData('Items/D_ItemsStatic.json');
const itemTemplates: ItemTemplates = await readData('Items/D_ItemTemplate.json');
const consumables: ConsumableFile = await readData('Traits/D_Consumable.json');
const modifiers: ModifierStatesFile = await readData('Modifiers/D_ModifierStates.json');
const statsFile: StatsFile = await readData('Stats/D_Stats.json');

/**
 * Contains name, description, and icon link of an item.
 */
const itemables: Itemable = await readData('Traits/D_Itemable.json');
const processorRecipes: ProcessorRecipes = await readData('Crafting/D_ProcessorRecipes.json');
const recipeSets: RecipeSets = await readData('Crafting/D_RecipeSets.json');

const iconPrefix = '/Game/Assets/2DArt/UI/';
function processIcon(icon: string): string {
    icon = icon.substring(iconPrefix.length);

    const iconBaseNameIndex = icon.lastIndexOf('/');
    if (iconBaseNameIndex < 0) {
        throw new Error('Icon is not a path, no /.');
    }

    const iconBaseSplit = icon.substring(iconBaseNameIndex + 1).split('.');

    if (iconBaseSplit.length < 2 || iconBaseSplit.length > 2) {
        throw new Error(`Basename of icon is not split by . as expected. ${icon}`);
    }

    if (iconBaseSplit[0] !== iconBaseSplit[1]) {
        throw new Error(`Basename of icon is not symmetrical. ${icon} (${
            iconBaseSplit[0]} !== ${iconBaseSplit[1]})`);
    }

    return `${icon.substring(0, iconBaseNameIndex)}/${iconBaseSplit[0]}`;
}

/**
 * Some items are named with different case in the recipes. This maps exists to retrieve the correct
 * case. The key is from D_ItemsStatic.json, lowercase. The value is the original case.
 */
const itemStaticCaseCorrectionMap = new Map<string, string>();

/**
 * Maps item templates to their static name.
 */
const itemTemplateMap = new Map<string, string>();

for (const itemTemplate of itemTemplates.Rows) {
    if (itemTemplate.ItemStaticData === undefined) {
        continue;
    }

    itemTemplateMap.set(itemTemplate.Name.toLowerCase(), itemTemplate.ItemStaticData.RowName);
}

const consumableMap = new Map<string, ConsumableRow>();
for (const consumable of consumables.Rows) {
    consumableMap.set(consumable.Name, consumable);
}

const modifierStatesMap = new Map<string, ModifierStateRow>();
for (const modifierState of modifiers.Rows) {
    modifierStatesMap.set(modifierState.Name, modifierState);
}

function getItemStaticName(ref: RefWithDataTable): string | undefined {
    let result: string | undefined;

    switch (ref.DataTableName) {
        case 'D_ItemTemplate':
            result = itemTemplateMap.get(ref.RowName.toLowerCase());
            break;
        case 'D_ItemsStatic':
            result = ref.RowName;
            break;
        default:
            console.log(`Unknown datatable name ${ref.DataTableName}`);
            return undefined;
    }

    if (result !== undefined) {
        return itemStaticCaseCorrectionMap.get(result.toLowerCase());
    }

    return result;
}

// Stats used by items in output.
const statsToInclude = new Set<string>();
const stats = new Map<string, Stat>();
for (const statRow of statsFile.Rows) {
    const positiveFormat = extractTranslation(statRow.PositiveDescription);
    const negativeFormat = extractTranslation(statRow.NegativeDescription);

    if (positiveFormat === undefined && negativeFormat !== undefined) {
        console.warn(`Stat '${statRow.Name}' has only negative description.`);
    }

    if (positiveFormat === undefined) {
        continue;
    }

    stats.set(statRow.Name, {
        positiveFormat: positiveFormat,
        negativeFormat: negativeFormat,
    });
}

const itemBlacklist: Array<string> = [
    'CollectionShipBeacon',
    'Cooking_Station', // Replaced with _V2
    'DEV_Bug_Tool',
    'DEV_Fireball',
    'DEV_Inspection_Tool',
    'DEV_Thor_Hammer',
    'Debug_Target',
    'Electric_Dehumidifier', // Replaced with _V2
    'Faction_MIssion_Analyzer',
    'Faction_Mission_Frozen_Mammoth_Sample',
    'Faction_Mission_Mammoth_Sample',
    'Faction_Satellite',
    'Faction_Satellite_Defend',
    'Farming_CropPlot', // Replaced with _T2_V2
    'Farming_CropPlot_T3', // Replaced with _v2
    'Farming_CropPlot_T4', // Replaced with _v2
    'Glassworking_Bench', // Replaced with _v2
    'Kit_Road',
    'Player_Gravestone_DBNO',
    'Player_Gravestone_MIA',
    'SplineTool_Fuel',
    'Water_Purifier_T1',
];

const itemExcluded: Record<string, string> = {};
const mappedItems: Record<string, OutputItem> = {};
for (const item of itemsStatic.Rows) {
    itemStaticCaseCorrectionMap.set(item.Name.toLowerCase(), item.Name);
    if (item.Itemable === undefined) {
        itemExcluded[item.Name] = 'Not itemable';
        continue;
    }

    /**
     * E.g. Name of item as used in D_ItemsStatic.json, e.g. Stick.
     */
    const itemableName = item.Itemable.RowName;

    if (itemBlacklist.includes(item.Name)) {
        itemExcluded[item.Name] = 'Blacklisted';
        continue;
    }

    /*
    let type: 'Attachment' | 'Consumable' | 'Knife' | undefined;
    if (item.Consumable !== undefined) {
        type = 'Consumable';
    } else if (item.Attachments !== undefined) {
        type = 'Attachment';
    } else if (item.Manual_Tags?.GameplayTags.some(t => {
        return t.TagName.startsWith('Item.Tool.Knife');
    }) === true) {
        type = 'Knife';
    }
    */

    const itemable = itemables.Rows.find(itemr => {
        return itemr.Name === itemableName;
    });

    if (itemable === undefined) {
        console.log(`${item.Name} not found in itemable`);
        itemExcluded[item.Name] = 'Not found in itemable';
        continue;
    }

    if (itemable.Icon === undefined) {
        itemExcluded[item.Name] = 'No icon';
        continue;
    } else if (!itemable.Icon.startsWith(iconPrefix)) {
        // Only used for a single dev items it seems, DEV_Transform_Tool
        continue;
    }

    const displayName = extractTranslation(itemable.DisplayName);

    if (displayName === undefined) {
        itemExcluded[item.Name] = 'No display name';
        continue;
    }

    let additionalStats: ItemStats | undefined;
    if (item.AdditionalStats !== undefined) {
        const [statsResult, error] = extractStats(item.AdditionalStats, stats);
        if (error === null) {
            additionalStats = statsResult;
        } else {
            console.error(`AdditionalStats: item=${item.Name}, Err=${error}`);
        }
    }

    const consumable = item.Consumable?.RowName === undefined
        ? undefined
        : consumableMap.get(item.Consumable.RowName);
    let consumeStats: ItemStats | undefined;
    if (consumable?.Stats !== undefined) {
        const [statsResult, error] = extractStats(consumable.Stats, stats);
        if (error === null) {
            consumeStats = statsResult;
        } else {
            console.error(`stats: item=${item.Name}, consumable=${consumable.Name}. Err=${error}`);
        }
    }

    const [modifier, modifierError] = getModifier(
        consumable,
        modifierStatesMap,
        stats,
    );
    if (modifierError !== null) {
        console.error(`item=${item.Name}: ${modifierError}`);
    }

    const itemStats: ItemStats = sortObjectKeys({
        ...consumeStats,
        ...additionalStats,
    });
    for (const stat of Object.keys(itemStats)) {
        statsToInclude.add(stat);
    }

    if (modifier?.stats !== undefined) {
        for (const stat of Object.keys(modifier.stats)) {
            statsToInclude.add(stat);
        }
    }

    mappedItems[item.Name] = {
        crafter: item.Processing?.RowName,
        displayName: displayName,
        icon: processIcon(itemable.Icon),
        description: extractTranslation(itemable.Description),
        flavorText: extractTranslation(itemable.FlavorText),
        isFood: staticItemTagMatches(item, tag => tag.startsWith('Item.Consumable.Food')),
        recipes: [],
        ingredientIn: [],
        stats: Object.keys(itemStats).length > 0 ? itemStats : undefined,
        modifier: modifier ?? undefined,
    };
}

// Report reason for item exclusion
console.log(`Excluded items:`);
for (const [itemName, exclusionReason] of Object.entries(itemExcluded)) {
    console.log(`- ${itemName}: ${exclusionReason}`);
}

const crafters: Record<string, Crafter> = {};
for (const recipeSet of recipeSets.Rows) {
    const icon = recipeSet.RecipeSetIcon;
    const displayName = extractTranslation(recipeSet.RecipeSetName);

    if (icon === undefined || icon === 'None' || displayName === undefined) {
        continue;
    }

    crafters[recipeSet.Name] = {
        icon: processIcon(icon),
        displayName: displayName,
        recipes: [],
    };
}

const blacklistedRecipeSets: Array<string> = [
    'Cleaning_Device',
    'RefundOnly',
    'T3_Smoker',
    'T4_Smoker',
];
const mappedRecipes: Record<string, OutputRecipe> = {};
for (const recipe of processorRecipes.Rows) {
    const elementCountsToItemCount = (elementCounts: Array<ElementCount>): Array<ItemCount> => {
        const itemCounts: Array<ItemCount> = [];

        for (const elementCount of elementCounts) {
            const itemName = getItemStaticName(elementCount.Element);
            if (itemName === undefined) {
                console.error(`Could not find static name for element`, elementCount.Element);
                continue;
            }

            itemCounts.push({
                item: itemName,
                count: elementCount.Count,
            });
        }

        return itemCounts.sort((a, b) => a.item.localeCompare(b.item));
    };

    const inputs = elementCountsToItemCount(recipe.Inputs);
    const outputs = elementCountsToItemCount(recipe.Outputs);

    if (inputs.length !== recipe.Inputs.length || outputs.length !== recipe.Outputs.length) {
        console.log(`Excluding recipe ${recipe.Name} because not all inputs and outputs could be `
            + `found.`);
        continue;
    }

    let skip = false;
    for (const recipeInput of inputs) {
        const mappedItem = mappedItems[recipeInput.item];
        if (mappedItem === undefined) {
            const reason = itemExcluded[recipeInput.item];
            console.log(`Excluding recipe ${recipe.Name} because input ${
                recipeInput.item} is not mapped.${
                reason === undefined ? '' : ` Reason: ${reason}.`}`);
            skip = true;
            break;
        }
        mappedItem.ingredientIn.push(recipe.Name);
    }
    for (const recipeOutput of outputs) {
        const mappedItem = mappedItems[recipeOutput.item];
        if (mappedItem === undefined) {
            const reason = itemExcluded[recipeOutput.item];
            console.log(`Excluding recipe ${recipe.Name} because output ${
                recipeOutput.item} is not mapped.${
                reason === undefined ? '' : ` Reason: ${reason}.`}`);
            skip = true;
            break;
        }
        mappedItem.recipes.push(recipe.Name);
    }
    if (skip) {
        continue;
    }

    for (const recipeSet of recipe.RecipeSets) {
        if (recipeSet.DataTableName !== 'D_RecipeSets') {
            console.error(`Unknown RecipeSet datatable ${recipeSet.DataTableName} for recipe ${
                recipe.Name}`);
        }

        if (blacklistedRecipeSets.includes(recipeSet.RowName)) {
            continue;
        }

        const crafter = crafters[recipeSet.RowName];

        if (crafter === undefined) {
            console.log(`Unknown RecipeSet ${recipeSet.RowName} for recipe ${recipe.Name}`);
            continue;
        }

        crafter.recipes.push(recipe.Name);
    }

    mappedRecipes[recipe.Name] = {
        requirement: recipe.Requirement?.RowName,
        craftedAt: recipe.RecipeSets.map(recipeSet => {
            switch (recipeSet.DataTableName) {
                case 'D_RecipeSets':
                    return recipeSet.RowName;
                default:
                    throw new Error(`Unknown RecipeSet data table name: ${
                        recipeSet.DataTableName}`);
            }
        }).filter(rs => !blacklistedRecipeSets.includes(rs)),
        inputs: inputs,
        outputs: outputs,
    };
}

for (const statName of stats.keys()) {
    // Do not include unused stats in result
    if (statsToInclude.has(statName)) {
        continue;
    }

    stats.delete(statName);
}

const gameData: GameData = {
    crafters: sortObjectKeys(crafters),
    items: sortObjectKeys(mappedItems),
    recipes: sortObjectKeys(mappedRecipes),
    stats: sortObjectKeys(Object.fromEntries(stats)),
};

fs.writeFileSync(
    path.join(dirname, 'summarized-data.json'),
    `${JSON.stringify(gameData, undefined, 4)}\n`,
    {
        encoding: 'utf-8',
    },
);
