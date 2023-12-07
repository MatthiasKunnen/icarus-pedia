import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'url';

import type {RefWithDataTable} from './common.interface.js';
import type {ItemsStatic} from './item-static.interface.js';
import type {ItemTemplates} from './item-templates.interface.js';
import type {Itemable} from './itemable.interface.js';
import type {ProcessorRecipes} from './processor-recipes.interface.js';
import {extractTranslation} from './util/localization.util.js';

/*
 * Maps the data found in the game's several json files and massage them to something smaller we can
 * use.
 * Run: yarn run run:tool tools/summarize/summarize-game-data.ts
 */

const dirname = path.dirname(fileURLToPath(import.meta.url));
const gameDataPath = path.join(dirname, '..', '..', 'gamedata', 'data_pak');

const itemsStatic: ItemsStatic = JSON.parse(await fs.promises.readFile(path.join(
    gameDataPath,
    'Items',
    'D_ItemsStatic.json',
), {encoding: 'utf-8'}));
const itemTemplates: ItemTemplates = JSON.parse(await fs.promises.readFile(path.join(
    gameDataPath,
    'Items',
    'D_ItemTemplate.json',
), {encoding: 'utf-8'}));

/**
 * Contains name, description, and icon link of an item.
 */
const itemables: Itemable = JSON.parse(await fs.promises.readFile(path.join(
    gameDataPath,
    'Traits',
    'D_Itemable.json',
), {encoding: 'utf-8'}));
const processorRecipes: ProcessorRecipes = JSON.parse(await fs.promises.readFile(path.join(
    gameDataPath,
    'Crafting',
    'D_ProcessorRecipes.json',
), {encoding: 'utf-8'}));

// Later
// const recipeSets = JSON.parse(await fs.promises.readFile(path.join(
//     gameDataPath,
//     'Crafting',
//     'D_RecipeSets.json',
// ), {encoding: 'utf-8'}));

const iconPrefix = '/Game/Assets/2DArt/UI/';

const output: Record<string, any> = {};

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

        const mappedRecipe = {
            Requirement: recipe.Requirement?.RowName,
            RecipeSets: recipe.RecipeSets,
            Inputs: recipe.Inputs.map(input => {
                return {
                    Item: getItemStaticName(input.Element),
                    Count: input.Count,
                };
            }),
            Outputs: recipe.Inputs.map(input => {
                return {
                    Item: getItemStaticName(input.Element),
                    Count: input.Count,
                };
            }),
        };

        if (addToRecipes) {
            recipes.push(mappedRecipe);
        }

        if (addToIngredientsIn) {
            ingredientIn.push(mappedRecipe);
        }
    }

    output[item.Name] = {
        Name: item.Name,
        DisplayName: itemable.DisplayName,
        Icon: itemable.Icon.substring(iconPrefix.length),
        Description: itemable.Description,
        FlavorText: itemable.FlavorText,
        Itemable: item.Itemable.RowName,
        IsConsumable: item.Consumable !== undefined,
        Type: type,
        Recipes: recipes,
        IngredientIn: ingredientIn,
    };
}
console.log(JSON.stringify(output, undefined, 4));
