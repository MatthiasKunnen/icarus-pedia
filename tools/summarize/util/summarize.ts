import {CsvWriter} from './csv-writer.js';
import {extractTranslation} from './localization.util.js';
import type {LogWriter} from './logwriter.js';
import {sortObjectKeys} from './object.util.js';
import {extractStats, getModifier} from './stats.util.js';
import {staticItemTagMatches} from './tag.util.js';
import {workshopItemToSummary} from './workshop.util.js';
import type {
    Crafter,
    GameData,
    ItemCount,
    ItemStats,
    Item as OutputItem,
    Recipe as OutputRecipe,
    Stat,
    WorkshopItem,
} from '../../../src/lib/data.interface.js';
import type {RefWithDataTable} from '../types/common.interface.js';
import type {ConsumableFile, ConsumableRow} from '../types/consumable.interface.js';
import type {ItemsStatic} from '../types/item-static.interface.js';
import type {ItemTemplates} from '../types/item-templates.interface.js';
import type {Itemable} from '../types/itemable.interface.js';
import type {ModifierStateRow, ModifierStatesFile} from '../types/modifier-states.interface.js';
import type {ElementCount, ProcessorRecipes} from '../types/processor-recipes.interface.js';
import type {RecipeSets} from '../types/recipe-sets.interface.js';
import type {StatsFile} from '../types/stats.interface.js';
import type {WorkshopItemsFile} from '../types/workshop-items.interface.js';

export interface SummarizeInput {
    log: LogWriter;
    itemsStatic: ItemsStatic;
    itemTemplates: ItemTemplates;
    consumables: ConsumableFile;
    modifiers: ModifierStatesFile;
    statsFile: StatsFile;
    itemables: Itemable;
    processorRecipes: ProcessorRecipes;
    recipeSets: RecipeSets;
    workshopItems: WorkshopItemsFile;
}

export function summarizeData(
    {
        itemTemplates,
        itemsStatic,
        log,
        itemables,
        processorRecipes,
        recipeSets,
        statsFile,
        modifiers,
        consumables,
        workshopItems,
    }: SummarizeInput,
): GameData {
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
     * Some items are named with different case in the recipes.
     * This maps exists to retrieve the correct case.
     * The key is from D_ItemsStatic.json, lowercase. The value is the original case.
     */
    const itemStaticCaseCorrectionMap = new Map<string, string>();

    /**
     * Maps item templates to their static name.
     */
    const itemTemplateMap = new Map<string, string>();
    /**
     * Maps static items to their template.
     */
    const itemStaticToTemplateMap = new Map<string, string>();

    for (const itemTemplate of itemTemplates.Rows) {
        if (itemTemplate.ItemStaticData === undefined) {
            continue;
        }

        itemStaticToTemplateMap.set(itemTemplate.ItemStaticData.RowName, itemTemplate.Name);
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
                throw new Error(`Unknown datatable name ${ref.DataTableName}`);
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
        const [positiveFormat, posErr] = extractTranslation(statRow.PositiveDescription);
        if (posErr !== null) {
            throw new Error(`Failed to process positive description of ${statRow.Name}: ${
                posErr.message}`);
        }

        const [negativeFormat, negErr] = extractTranslation(statRow.NegativeDescription);
        if (negErr !== null) {
            throw new Error(`Failed to process negative description of ${statRow.Name}: ${
                negErr.message}`);
        }

        if (positiveFormat === undefined && negativeFormat !== undefined) {
            log.print(`Stat '${statRow.Name}' has only negative description.`);
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

    const foodTsv = new CsvWriter();

    const itemExcluded: Record<string, string> = {};
    const mappedItems: Record<string, OutputItem> = {};
    for (const item of itemsStatic.Rows) {
        itemStaticCaseCorrectionMap.set(item.Name.toLowerCase(), item.Name);
        if (item.Itemable === undefined) {
            itemExcluded[item.Name] = 'Not itemable';
            continue;
        }
        const templateName = itemStaticToTemplateMap.get(item.Name);

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

        const [displayName, err] = extractTranslation(itemable.DisplayName);
        if (err !== null) {
            throw err;
        }

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
                log.print(`AdditionalStats: item=${item.Name}, Err=${error}`);
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
                log.print(`stats: item=${item.Name}, consumable=${consumable.Name}. Err=${error}`);
            }
        }

        const [modifier, modifierError] = getModifier(
            consumable,
            modifierStatesMap,
            stats,
        );
        if (modifierError !== null) {
            log.print(`item=${item.Name}: ${modifierError}`);
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

        const [description, descriptionErr] = extractTranslation(itemable.Description);
        if (descriptionErr !== null) {
            throw descriptionErr;
        }
        const [flavorText, flavorTextErr] = extractTranslation(itemable.FlavorText);
        if (flavorTextErr !== null) {
            throw flavorTextErr;
        }

        let workshopItem: WorkshopItem | undefined;
        if (templateName !== undefined) {
            const workshopItemRow = workshopItems.Rows.find(i => {
                return i.Item.RowName === templateName;
            });
            if (workshopItemRow !== undefined) {
                workshopItem = workshopItemToSummary(workshopItemRow);
            }
        }

        const isFood = item.Consumable !== undefined
            && staticItemTagMatches(item, tagname => {
                switch (tagname) {
                    case 'FieldGuide.Food':
                    case 'Item.Consumable.Food':
                    case 'Item.Deployable.Food':
                    case 'Item.Medicine.Paste':
                    case 'Item.Medicine.Pill':
                    case 'Item.Medicine.Tonic.Enhancement':
                    case 'Item.Medicine.Tonic.Status':
                        return true;
                }

                return tagname.startsWith('Item.Consumable.Food.');
            });

        if (isFood) {
            const tsvRow: Record<string, number | string | undefined> = {
                name: displayName,
                duration: modifier?.lifetime,
            };

            Object.entries(itemStats).forEach(([key, value]) => {
                tsvRow[key] = value.toString();
            });
            if (modifier?.stats !== undefined) {
                Object.entries(modifier.stats).forEach(([key, value]) => {
                    tsvRow[key] = value.toString();
                });
            }

            foodTsv.add(tsvRow);
        }

        mappedItems[item.Name] = {
            crafter: item.Processing?.RowName,
            displayName: displayName,
            icon: processIcon(itemable.Icon),
            description: description,
            flavorText: flavorText,
            isFood: isFood,
            recipes: [],
            ingredientIn: [],
            workshopItem: workshopItem,
            stats: Object.keys(itemStats).length > 0 ? itemStats : undefined,
            modifier: modifier ?? undefined,
            usable: undefined,
        };
    }

    // Report reason for item exclusion
    log.print(`Excluded items:`);
    for (const [itemName, exclusionReason] of Object.entries(itemExcluded)) {
        log.print(`- ${itemName}: ${exclusionReason}`);
    }

    const crafters: Record<string, Crafter> = {};
    for (const recipeSet of recipeSets.Rows) {
        const icon = recipeSet.RecipeSetIcon;
        const [displayName, err] = extractTranslation(recipeSet.RecipeSetName);
        if (err !== null) {
            throw err;
        }

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

    // Key=Recipe name, Value=Reason
    const excludedRecipes: Record<string, string> = {};
    const mappedRecipes: Record<string, OutputRecipe> = {};
    for (const recipe of processorRecipes.Rows) {
        const elementCountsToItemCount = (elementCounts: Array<ElementCount>): Array<ItemCount> => {
            const itemCounts: Array<ItemCount> = [];

            for (const elementCount of elementCounts) {
                const itemName = getItemStaticName(elementCount.Element);
                if (itemName === undefined) {
                    log.print(`Could not find static name for element with RowName=${
                        elementCount.Element.RowName}, DataTableName=${
                        elementCount.Element.DataTableName} while processing recipe ${
                        recipe.Name}`);
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
            excludedRecipes[recipe.Name] = 'Not all outputs found.';
            continue;
        }

        let skip = false;
        for (const recipeInput of inputs) {
            const mappedItem = mappedItems[recipeInput.item];
            if (mappedItem === undefined) {
                const reason = itemExcluded[recipeInput.item];
                excludedRecipes[recipe.Name] = `input ${
                    recipeInput.item} is not mapped.${
                    reason === undefined ? '' : ` Reason: ${reason}.`}`;
                skip = true;
                break;
            }
            mappedItem.ingredientIn.push(recipe.Name);
        }
        for (const recipeOutput of outputs) {
            const mappedItem = mappedItems[recipeOutput.item];
            if (mappedItem === undefined) {
                const reason = itemExcluded[recipeOutput.item];
                excludedRecipes[recipe.Name] = `output ${
                    recipeOutput.item} is not mapped.${
                    reason === undefined ? '' : ` Reason: ${reason}.`}`;
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
                throw new Error(`Unknown RecipeSet datatable ${recipeSet.DataTableName
                    } for recipe ${recipe.Name}`);
            }

            if (blacklistedRecipeSets.includes(recipeSet.RowName)) {
                continue;
            }

            const crafter = crafters[recipeSet.RowName];

            if (crafter === undefined) {
                log.print(`Unknown RecipeSet ${recipeSet.RowName} for recipe ${recipe.Name}`);
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

    // Weed out items that are not craftable/used in recipes
    const usabilityChecked = new Set<string>();
    function markUsableRecursive(itemName: string, item: OutputItem): void {
        if (usabilityChecked.has(itemName)) {
            return;
        }
        usabilityChecked.add(itemName);
        if (item.recipes.length > 0 || item.ingredientIn.length > 0) {
            item.usable = true;
        }

        for (const recipeName of item.recipes) {
            const recipe = mappedRecipes[recipeName];
            if (recipe === undefined) {
                log.print(`Recipe of item ${itemName} with recipe name ${
                    recipeName} not found in usability check`);
                continue;
            }
            for (const input of recipe.inputs) {
                const mappedItem = mappedItems[input.item];
                if (mappedItem === undefined) {
                    log.print(`Recipe input of item ${input.item}, recipe ${
                        recipeName}, item ${input.item} not found in usability check`);
                    continue;
                }

                markUsableRecursive(input.item, mappedItem);
            }
        }
    }
    for (const [name, item] of Object.entries(mappedItems)) {
        // First mark everything
        markUsableRecursive(name, item);
    }
    let usable = 0;
    const unusable: Array<string> = [];
    for (const [itemName, item] of Object.entries(mappedItems)) {
        if (item.usable === true) {
            usable++;
            // Undefined equals usable, this is done to decrease the size of the resulting output
            item.usable = undefined;
        } else {
            item.usable = false;
            unusable.push(itemName);
        }
    }
    log.print(`Of the non-excluded items, ${usable} are usable in crafting, the following ${
        unusable.length} are not:`);
    for (const itemName of unusable) {
        log.print(`- ${itemName}`);
    }

    console.log('TSV:\n', foodTsv.get());

    const gameData: GameData = {
        crafters: sortObjectKeys(crafters),
        items: sortObjectKeys(mappedItems),
        recipes: sortObjectKeys(mappedRecipes),
        stats: sortObjectKeys(Object.fromEntries(stats)),
    };

    return gameData;
}
