import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'url';

import type {ConsumableFile} from './types/consumable.interface.js';
import type {ItemsStatic} from './types/item-static.interface.js';
import type {ItemTemplates} from './types/item-templates.interface.js';
import type {Itemable} from './types/itemable.interface.js';
import type {ModifierStatesFile} from './types/modifier-states.interface.js';
import type {ProcessorRecipes} from './types/processor-recipes.interface.js';
import type {RecipeSets} from './types/recipe-sets.interface.js';
import type {StatsFile} from './types/stats.interface.js';
import {LogWriter} from './util/logwriter.js';
import {summarizeData} from './util/summarize.js';

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

const logWriter = new LogWriter(path.join(dirname, 'summarized-data.log'));

(async () => {
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

    const gameData = summarizeData({
        consumables: consumables,
        itemTemplates: itemTemplates,
        itemables,
        itemsStatic: itemsStatic,
        log: logWriter,
        modifiers: modifiers,
        processorRecipes,
        recipeSets,
        statsFile,
    });

    fs.writeFileSync(
        path.join(dirname, 'summarized-data.json'),
        `${JSON.stringify(gameData, undefined, 4)}\n`,
        {
            encoding: 'utf-8',
        },
    );
})().catch(async err => {
    await logWriter.fatal(err.message);
    process.exit(1);
});
