import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'url';

import {DataTable} from './util/datatable.js';
import {LogWriter} from './util/logwriter.js';
import {summarizeData} from './util/summarize.js';

/*
 * Maps the data found in the game's several json files and massage them to something smaller we can
 * use.
 * Run: yarn run run:tool tools/summarize/summarize-game-data.ts
 */

const dirname = path.dirname(fileURLToPath(import.meta.url));
const gameDataPath = path.join(dirname, '..', '..', 'gamedata', 'data_pak');

async function readDataTable<T extends DataTable<any>>(
    filepath: string,
): Promise<T> {
    const parsed = JSON.parse(await fs.promises.readFile(path.join(
        gameDataPath,
        ...filepath.split('/'),
    ), {encoding: 'utf-8'}));

    return new DataTable(parsed) as T;
}

const logWriter = new LogWriter(path.join(dirname, 'summarized-data.log'));

(async () => {
    const gameData = summarizeData({
        consumables: await readDataTable('Traits/D_Consumable.json'),
        durable: await readDataTable('Traits/D_Durable.json'),
        itemTemplates: await readDataTable('Items/D_ItemTemplate.json'),
        itemables: await readDataTable('Traits/D_Itemable.json'),
        itemsStatic: await readDataTable('Items/D_ItemsStatic.json'),
        log: logWriter,
        modifiers: await readDataTable('Modifiers/D_ModifierStates.json'),
        processing: await readDataTable('Traits/D_Processing.json'),
        processorRecipes: await readDataTable('Crafting/D_ProcessorRecipes.json'),
        recipeSets: await readDataTable('Crafting/D_RecipeSets.json'),
        resources: await readDataTable('Resources/D_IcarusResources.json'),
        statsFile: await readDataTable('Stats/D_Stats.json'),
        talents: await readDataTable('Talents/D_Talents.json'),
        workshopItems: await readDataTable('MetaWorkshop/D_WorkshopItems.json'),
    });

    fs.writeFileSync(
        path.join(dirname, 'summarized-data.json'),
        `${JSON.stringify(gameData, undefined, 4)}\n`,
        {
            encoding: 'utf-8',
        },
    );
})().catch(async err => {
    if (err instanceof Error) {
        await logWriter.fatal(err.stack ?? err.message);
    } else {
        await logWriter.fatal(err);
    }
    process.exit(1);
});
