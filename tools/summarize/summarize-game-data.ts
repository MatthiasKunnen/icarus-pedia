import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'url';

import type {RefWithDataTable} from './common.interface.js';
import type {Crafter} from './crafter.interface.js';
import type {ItemsStatic} from './item-static.interface.js';
import type {ItemTemplates} from './item-templates.interface.js';
import type {Itemable} from './itemable.interface.js';
import type {ProcessorRecipes} from './processor-recipes.interface.js';
import type {RecipeSets} from './recipe-sets.interface.js';
import {extractTranslation} from './util/localization.util.js';
import {staticItemTagMatches} from './util/tag.util.js';

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

/**
 * Contains name, description, and icon link of an item.
 */
const itemables: Itemable = await readData('Traits/D_Itemable.json');
const processorRecipes: ProcessorRecipes = await readData('Crafting/D_ProcessorRecipes.json');
const recipeSets: RecipeSets = await readData('Crafting/D_RecipeSets.json');

const iconPrefix = '/Game/Assets/2DArt/UI/';

/**
 * Maps item templates to their static name.
 */
const itemTemplateMap = new Map<string, string>();

for (const itemTemplate of itemTemplates.Rows) {
    if (itemTemplate.ItemStaticData === undefined) {
        continue;
    }

    itemTemplateMap.set(itemTemplate.Name, itemTemplate.ItemStaticData.RowName);
}

function getItemStaticName(ref: RefWithDataTable): string | undefined {
    switch (ref.DataTableName) {
        case 'D_ItemTemplate':
            return itemTemplateMap.get(ref.RowName);
        case 'D_ItemsStatic':
            return ref.RowName;
        default:
            console.log(`Unknown datatable name ${ref.DataTableName}`);
            return undefined;
    }
}

const mappedItems: Record<string, any> = {};
for (const item of itemsStatic.Rows) {
    if (item.Itemable === undefined) {
        continue;
    }

    /**
     * E.g. Name of item as used in D_ItemsStatic.json, e.g. Stick.
     */
    const itemableName = item.Itemable.RowName;

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

    const itemable = itemables.Rows.find(itemr => {
        return itemr.Name === itemableName;
    });

    if (itemable === undefined) {
        console.log(`${item.Name} not found in itemable`);
        continue;
    }

    if (itemable.Icon === undefined) {
        continue;
    }

    const displayName = extractTranslation(itemable.DisplayName);

    if (displayName == null) {
        continue;
    }

    const recipes: Array<any> = [];
    const ingredientIn: Array<any> = [];

    for (const recipe of processorRecipes.Rows) {
        const addToRecipes = recipe.Outputs.some(o => {
            return getItemStaticName(o.Element) === item.Name;
        });
        const addToIngredientsIn = recipe.Inputs.some(o => {
            return getItemStaticName(o.Element) === item.Name;
        });

        if (!addToRecipes && !addToIngredientsIn) {
            continue;
        }

        if (addToRecipes) {
            recipes.push(recipe.Name);
        }

        if (addToIngredientsIn) {
            ingredientIn.push(recipe.Name);
        }
    }

    mappedItems[item.Name] = {
        DisplayName: displayName,
        Icon: itemable.Icon.substring(iconPrefix.length),
        Description: extractTranslation(itemable.Description),
        FlavorText: extractTranslation(itemable.FlavorText),
        IsFood: staticItemTagMatches(item, tag => tag.startsWith('Item.Consumable.Food')),
        Type: type,
        Recipes: recipes,
        IngredientIn: ingredientIn,
    };
}

const crafters: Record<string, Crafter> = {};
for (const recipeSet of recipeSets.Rows) {
    const icon = recipeSet.RecipeSetIcon;
    const displayName = extractTranslation(recipeSet.RecipeSetName);

    if (icon === undefined || icon === 'None' || displayName == null) {
        continue;
    }

    crafters[recipeSet.Name] = {
        Icon: icon.substring(iconPrefix.length),
        DisplayName: displayName,
        Recipes: [],
    };
}

const mappedRecipes: Record<string, any> = {};
for (const recipe of processorRecipes.Rows) {
    for (const recipeSet of recipe.RecipeSets) {
        if (recipeSet.DataTableName !== 'D_RecipeSets') {
            console.error(`Unknown RecipeSet datatable ${recipeSet.DataTableName} for recipe ${
                recipe.Name}`);
        }

        const crafter = crafters[recipeSet.RowName];

        if (crafter === undefined) {
            console.log(`Unknown RecipeSet ${recipeSet.RowName} for recipe ${recipe.Name}`);
            continue;
        }

        crafter.Recipes.push(recipe.Name);
    }

    mappedRecipes[recipe.Name] = {
        Requirement: recipe.Requirement?.RowName,
        RecipeSets: recipe.RecipeSets,
        Inputs: recipe.Inputs.map(input => {
            return {
                Item: getItemStaticName(input.Element),
                Count: input.Count,
            };
        }),
        Outputs: recipe.Outputs.map(input => {
            return {
                Item: getItemStaticName(input.Element),
                Count: input.Count,
            };
        }),
    };
}

fs.writeFileSync(
    path.join(dirname, 'summarized-data.json'),
    JSON.stringify({
        crafters: crafters,
        items: mappedItems,
        recipes: mappedRecipes,
    }, undefined, 4),
    {
        encoding: 'utf-8',
    },
);
