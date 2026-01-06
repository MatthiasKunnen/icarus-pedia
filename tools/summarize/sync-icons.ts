import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'url';

import {LogWriter} from './util/logwriter.js';
import type {GameData} from '../../src/lib/data.interface.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(dirname, '..', '..', 'static', 'gameicons');
const sourcePath = path.join(dirname, '..', '..', 'gamedata', 'UI');
const log = new LogWriter(path.join(dirname, 'sync-icons.log'));

(async () => {
    const data: GameData = JSON.parse(fs.readFileSync(
        path.join(dirname, 'summarized-data.json'),
        {encoding: 'utf-8'},
    ));
    const icons = new Set<string>();
    for (const item of Object.values(data.items)) {
        icons.add(item.icon);
    }
    for (const item of Object.values(data.crafters)) {
        icons.add(item.icon);
    }
    for (const item of Object.values(data.resources)) {
        icons.add(item.resourceIcon);
        icons.add(item.recipeIcon);
    }
    icons.add('Logos/Icon_Icarus');

    log.print('Cleaning output path');
    for (const filename of await fs.promises.readdir(outputPath)) {
        const filepath = path.join(outputPath, filename);
        await fs.promises.rm(filepath, {
            recursive: true,
        });
    }

    const linkedIcons: Array<string> = [];
    log.print('Creating symlinks');
    for (const icon of icons) {
        await fs.promises.mkdir(path.join(outputPath, path.dirname(icon)), {
            recursive: true,
        });
        const iconSourcePath = `${path.join(sourcePath, icon)}.png`;
        const iconOutputPath = path.join(outputPath, icon);
        try {
            await fs.promises.access(iconSourcePath, fs.constants.R_OK);
        } catch (error) {
            log.print(`Skipping "${icon}", it could not be accessed: ${error}`);
            continue;
        }

        try {
            await fs.promises.symlink(
                path.relative(path.dirname(iconOutputPath), `${iconSourcePath}`),
                `${iconOutputPath}.png`,
            );
        } catch (error) {
            if (error != null
                && typeof error === 'object'
                && 'code' in error
                && typeof error.code === 'string'
                && error.code === 'EEXIST') {
                continue;
            } else {
                throw error;
            }
        }

        linkedIcons.push(iconOutputPath);
    }

    const sizes = [
        '64x64',
        '128x128',
    ];

    const commands: Array<string> = [];
    for (const iconPath of linkedIcons) {
        commands.push(pngToAvif(iconPath));
        commands.push(pngToWebp(iconPath));
        commands.push(pngToJxl(iconPath));

        for (const size of sizes) {
            const f = `${iconPath}_${size}`;
            commands.push(`magick ${iconPath}.png -resize ${size} \
-define png:exclude-chunk=TIME \
-strip \
${f}.png \
&& ${pngToAvif(f)} \
&& ${pngToWebp(f)} \
&& ${pngToJxl(f)}`);
        }
    }

    const commandOutputFileName = 'image-convert-commands.txt';
    fs.writeFileSync(
        path.join(dirname, '..', '..', commandOutputFileName),
        `${commands.join('\n')}\n`,
        {encoding: 'utf-8'},
    );

    log.print(`Generate the image variants by executing \`parallel --progress < ${
        commandOutputFileName}\`. Requires GNU parallel.`);
})().catch(async err => {
    if (err instanceof Error) {
        await log.fatal(err.toString());
    } else {
        await log.fatal(String(err));
    }

    process.exit(1);
});

function pngToAvif(iconPath: string): string {
    return `avifenc --jobs 1 --speed 3 -q 50 ${iconPath}.png ${iconPath}.avif > /dev/null`;
}

function pngToJxl(iconPath: string): string {
    return `cjxl --quiet -d 4 -e 9 ${iconPath}.png ${iconPath}.jxl`;
}

function pngToWebp(iconPath: string): string {
    return `magick ${iconPath}.png ${iconPath}.webp`;
}
