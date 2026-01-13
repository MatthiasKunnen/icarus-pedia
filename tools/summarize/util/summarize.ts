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
    ItemType,
    Item as OutputItem,
    Recipe as OutputRecipe,
    Resource,
    Stat,
    WorkshopItem,
} from '../../../src/lib/data.interface.js';
import type {RefWithDataTable} from '../types/common.interface.js';
import type {ConsumableDataTable} from '../types/consumable.interface.js';
import type {DurableDataTable, DurableRow} from '../types/durable.interface.js';
import type {ItemStaticDataTable} from '../types/item-static.interface.js';
import type {ItemTemplateDataTable} from '../types/item-templates.interface.js';
import type {ItemableDataTable} from '../types/itemable.interface.js';
import type {ModifierStateDataTable} from '../types/modifier-states.interface.js';
import type {ProcessingDataTable} from '../types/processing.interface.js';
import type {
    ElementCount,
    ProcessorRecipeResource,
    ProcessorRecipesDataTable,
} from '../types/processor-recipes.interface.js';
import type {RecipeSetsDataTable} from '../types/recipe-sets.interface.js';
import type {ResourceDataTable} from '../types/resources.interface.js';
import type {StatsDataTable} from '../types/stats.interface.js';
import type {TalentsDataTable} from '../types/talents.interface.js';
import type {WorkshopItemsDataTable} from '../types/workshop-items.interface.js';

export interface SummarizeInput {
    log: LogWriter;
    itemsStatic: ItemStaticDataTable;
    itemTemplates: ItemTemplateDataTable;
    consumables: ConsumableDataTable;
    durable: DurableDataTable;
    modifiers: ModifierStateDataTable;
    statsFile: StatsDataTable;
    itemables: ItemableDataTable;
    processing: ProcessingDataTable;
    processorRecipes: ProcessorRecipesDataTable;
    resources: ResourceDataTable;
    recipeSets: RecipeSetsDataTable;
    talents: TalentsDataTable;
    workshopItems: WorkshopItemsDataTable;
}

export function summarizeData(
    {
        durable,
        itemTemplates,
        itemsStatic,
        log,
        itemables,
        processing,
        processorRecipes,
        recipeSets,
        statsFile,
        modifiers,
        consumables,
        resources,
        talents,
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
     * Key=ItemTemplate.ItemStatic.Name, Value=ItemTemplate.Name.
     */
    const itemTemplateMap = itemTemplates.mapKeyFrom(r => r.ItemStaticData?.RowName, 'many');

    /**
     * Key=ItemStatic.Processing.Name, Value=ItemStatic.Name.
     */
    const itemStaticProcessingToId = itemsStatic.mapKeyFrom(is => is.Processing?.RowName, 'many');

    /**
     * Maps an ItemTemplate ID to a WorkshopItem ID.
     */
    const workshopItemFromTemplateMap = workshopItems.mapKeyFrom(w => w.Item.RowName, '1');

    const mappedResources: Record<string, Resource> = {};
    for (const row of resources.Rows) {
        const [displayName, displayNameErr] = extractTranslation(row.DisplayName);
        if (displayNameErr !== null) {
            throw new Error(`Error translating resource display name of ${row.Name}`);
        } else if (displayName === undefined) {
            log.print(`No display name for resource with name ${row.Name}`);
            continue;
        }
        mappedResources[row.Name] = {
            displayName: displayName,
            recipeIcon: processIcon(row.Recipe_Icon),
            resourceIcon: processIcon(row.Resource_Icon),
            ingredientIn: [],
            recipes: [],
        };
    }

    /**
     * Returns the ItemStatic name of the reference based on the DataTable.
     */
    function getItemStaticName(ref: RefWithDataTable): string | undefined {
        let result: string | undefined;

        switch (ref.DataTableName) {
            case 'D_ItemTemplate':
                result = itemTemplates.get(ref.RowName.toLowerCase())?.ItemStaticData?.RowName;
                break;
            case 'D_ItemsStatic':
                result = ref.RowName;
                break;
            default:
                throw new Error(`Unknown datatable name ${ref.DataTableName}`);
        }

        if (result !== undefined) {
            return itemsStatic.get(result.toLowerCase())?.Name;
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

    const itemExcluded: Record<string, string> = {};
    const mappedItems: Record<string, OutputItem> = {};
    for (const item of itemsStatic.Rows) {
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

        const itemable = itemables.get(itemableName);

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
            : consumables.get(item.Consumable.RowName);
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
            modifiers,
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

        const workshopItem = ((): WorkshopItem | undefined => {
            const templateNames = itemTemplateMap.get(item.Name);
            if (templateNames === undefined) {
                return;
            }

            for (const templateName of templateNames) {
                const workshopItemName = workshopItemFromTemplateMap.get(templateName);
                if (workshopItemName === undefined) {
                    continue;
                }

                const workshopItemRow = workshopItems.get(workshopItemName);
                if (workshopItemRow === undefined) {
                    continue;
                }

                return workshopItemToSummary(workshopItemRow);
            }

            return undefined;
        })();

        let type: ItemType | undefined;
        if (item.Consumable !== undefined) {
            if (staticItemTagMatches(item, t => t.startsWith('Item.Medicine.Tonic.'))) {
                type = 'Tonic';
            } else if (staticItemTagMatches(item, t => t === 'Item.Medicine.Pill')) {
                type = 'Pill';
            } else if (staticItemTagMatches(item, t => t === 'Item.Medicine.Paste')) {
                type = 'Paste';
            } else if (staticItemTagMatches(item, tagname => {
                switch (tagname) {
                    case 'FieldGuide.Food':
                    case 'Item.Consumable.Food':
                    case 'Item.Deployable.Food':
                        return true;
                }

                return tagname.startsWith('Item.Consumable.Food.');
            })) {
                type = 'Food';
            }
        }

        let durability: DurableRow | undefined;
        if (item.Durable !== undefined) {
            durability = durable.get(item.Durable.RowName);
        }

        mappedItems[item.Name] = {
            displayName: displayName,
            icon: processIcon(itemable.Icon),
            description: description,
            durability: durability?.Max_Durability,
            flavorText: flavorText,
            type: type,
            recipes: [],
            ingredientIn: [],
            workshopItem: workshopItem,
            stackSize: itemable.MaxStack ?? 1,
            stats: Object.keys(itemStats).length > 0 ? itemStats : undefined,
            modifier: modifier ?? undefined,
            usable: undefined,
            weight: itemable.Weight,
        };
    }

    // Report reason for item exclusion
    log.print(`Excluded items:`);
    for (const [itemName, exclusionReason] of Object.entries(itemExcluded)) {
        log.print(`- ${itemName}: ${exclusionReason}`);
    }

    const blacklistedCrafters = new Set<string>();
    // Key=ItemStatic.Name
    const crafters = new Map<string, Crafter>();
    for (const itemStatic of itemsStatic.Rows) {
        if (itemStatic.Processing === undefined) {
            continue;
        }
        if (staticItemTagMatches(itemStatic, t => {
            switch (t) {
                case 'FieldGuide.BlackList':
                case 'Item.Decoration.Lab':
                    // Exclude items such as Prop_Mortar_And_Pestle, which is a prop only.
                    // fallthrough
                case 'FactionMission.Item':
                    // Exclude Faction_MIssion_Analyzer, which appears as an electric composter
                    return true;
                default:
                    return false;
            }
        })) {
            blacklistedCrafters.add(itemStatic.Name.toLowerCase());
            continue;
        }

        const processor = processing.get(itemStatic.Processing.RowName);
        if (processor === undefined) {
            throw new Error(`Skipping ItemStatic.${itemStatic.Name
                }.Processing, not found in D_Processing`);
        }
        if (processor.DefaultRecipeSet === undefined) {
            throw new Error(`Skipping ItemStatic.${itemStatic.Name
                }.Processing, DefaultRecipeSet not set`);
        }

        // @todo do we care about checking for this here?
        const recipeSet = recipeSets.get(processor.DefaultRecipeSet.RowName);
        if (recipeSet === undefined) {
            throw new Error(`RecipeSet ${processor.DefaultRecipeSet.RowName} not found.`);
        }

        if (itemStatic.Itemable === undefined) {
            log.print(`Crafter skipped ItemStatic.${itemStatic.Name}: not itemable`);
            continue;
        }

        const itemable = itemables.get(itemStatic.Itemable.RowName);
        if (itemable === undefined) {
            log.print(`Crafter skipped ItemStatic.${itemStatic.Name}: not found in itemable`);
            continue;
        }

        const icon = itemable.Icon;
        const [displayName, err] = extractTranslation(itemable.DisplayName);
        if (err !== null) {
            throw err;
        }

        if (icon === undefined || icon === 'None' || displayName === undefined) {
            continue;
        }

        crafters.set(itemStatic.Name, {
            icon: processIcon(icon),
            displayName: displayName,
            recipes: [],
        });
    }

    // Key=Recipe name, Value=Reason
    const excludedRecipes: Record<string, string> = {};
    const mappedRecipes: Record<string, OutputRecipe> = {};
    for (const recipe of processorRecipes.Rows) {
        if (recipe.bForceDisableRecipe === true) {
            continue;
        }

        if (recipe.Requirement !== undefined) {
            if (talents.get(recipe.Requirement.RowName) === undefined) {
                excludedRecipes[recipe.Name] = `Recipe ${
                    recipe.Name} has non-existent requirement ${recipe.Requirement.RowName}`;
                continue;
            }
        }

        const elementCountsToItemCount = (elementCounts: Array<ElementCount>): Array<ItemCount> => {
            const itemCounts: Array<ItemCount> = [];

            for (const elementCount of elementCounts) {
                // Important to get it from the map to fix casing
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
        const resourceToItemCount = (
            recipeResources: Array<ProcessorRecipeResource> | undefined,
        ): Array<ItemCount> | undefined => {
            if (recipeResources === undefined) {
                return undefined;
            }
            const itemCounts: Array<ItemCount> = [];

            for (const recipeResource of recipeResources) {
                // Important to get it from the map to fix casing
                const item = resources.get(recipeResource.Type.Value);
                if (item === undefined) {
                    log.print(`Could not find static item with name '${
                        recipeResource.Type.Value}' for recipe ${recipe.Name} `);
                    continue;
                }
                const resource = mappedResources[item.Name];
                if (resource === undefined) {
                    log.print(`Could not resource with Name=${item.Name
                        }, DataTableName=D_IcarusResources while processing recipe ${
                        recipe.Name}`);
                    continue;
                }

                itemCounts.push({
                    item: item.Name,
                    count: recipeResource.RequiredUnits,
                });
            }

            return itemCounts.sort((a, b) => a.item.localeCompare(b.item));
        };

        const inputs = elementCountsToItemCount(recipe.Inputs);
        const inputResources = resourceToItemCount(recipe.ResourceInputs);
        const outputs = elementCountsToItemCount(recipe.Outputs);
        const outputResources = resourceToItemCount(recipe.ResourceOutputs);

        if (inputs.length !== recipe.Inputs.length
            || outputs.length !== recipe.Outputs.length
            || inputResources?.length !== recipe.ResourceInputs?.length
            || outputResources?.length !== recipe.ResourceOutputs?.length
        ) {
            excludedRecipes[recipe.Name] = 'Not all inputs/outputs found.';
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
        for (const input of inputResources ?? []) {
            const mappedResource = mappedResources[input.item];
            if (mappedResource === undefined) {
                const reason = itemExcluded[input.item];
                excludedRecipes[recipe.Name] = `input resource ${
                    input.item} is not mapped.${
                    reason === undefined ? '' : ` Reason: ${reason}.`}`;
                skip = true;
                break;
            }
            mappedResource.ingredientIn.push(recipe.Name);
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
        for (const output of outputResources ?? []) {
            const mappedResource = mappedResources[output.item];
            if (mappedResource === undefined) {
                const reason = itemExcluded[output.item];
                excludedRecipes[recipe.Name] = `output resource ${
                    output.item} is not mapped.${
                    reason === undefined ? '' : ` Reason: ${reason}.`}`;
                skip = true;
                break;
            }
            mappedResource.recipes.push(recipe.Name);
        }
        if (skip) {
            continue;
        }

        const craftedAt = new Set<string>();
        for (const recipeSet of recipe.RecipeSets) {
            if (recipeSet.DataTableName !== 'D_RecipeSets') {
                throw new Error(`Unknown RecipeSet datatable ${recipeSet.DataTableName
                    } for recipe ${recipe.Name}`);
            }

            for (const processingRow of processing.Rows) {
                if (processingRow.DefaultRecipeSet?.RowName.toLowerCase()
                    !== recipeSet.RowName.toLowerCase()) {
                    continue;
                }

                const staticNames = itemStaticProcessingToId.get(processingRow.Name);
                if (staticNames === undefined) {
                    log.print(`recipe ${recipe.Name}, recipeSet ${
                        recipeSet.RowName}, D_Processing ${
                        processingRow.Name}: no matching StaticItem.Processing`);
                    continue;
                }
                for (const staticName of staticNames) {
                    if (blacklistedCrafters.has(staticName.toLowerCase())) {
                        continue;
                    }
                    const crafter = crafters.get(staticName);
                    if (crafter === undefined) {
                        log.print(`recipe ${
                            recipe.Name}, recipeSet ${recipeSet.RowName}, D_Processing ${
                            processingRow.Name}: no crafter for static item ${staticName}`);
                        continue;
                    }
                    craftedAt.add(staticName);
                    crafter.recipes.push(recipe.Name);
                }
            }
        }

        mappedRecipes[recipe.Name] = {
            requirement: recipe.Requirement?.RowName,
            craftedAt: Array.from(craftedAt),
            inputs: inputs,
            inputResources: inputResources,
            outputs: outputs,
            outputResources: outputResources,
        };
    }

    for (const [recipeName, exclusionReason] of Object.entries(excludedRecipes)) {
        log.print(`Recipe ${recipeName} excluded: ${exclusionReason}`);
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

    const gameData: GameData = {
        crafters: sortObjectKeys(Object.fromEntries(crafters)),
        items: sortObjectKeys(mappedItems),
        recipes: sortObjectKeys(mappedRecipes),
        resources: sortObjectKeys(mappedResources),
        stats: sortObjectKeys(Object.fromEntries(stats)),
    };

    return gameData;
}
