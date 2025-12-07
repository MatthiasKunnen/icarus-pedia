import {exec} from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'url';

import type {GameData} from '../../src/lib/data.interface.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(dirname, '..', '..', 'static', 'gameicons');
const sourcePath = path.join(dirname, '..', '..', 'gamedata', 'UI');

const data: GameData = JSON.parse(fs.readFileSync(
    path.join(dirname, 'summarized-data.json'),
    {encoding: 'utf-8'},
));
const icons = [
    ...Object.values(data.items).map(item => item.icon),
    ...Object.values(data.crafters).map(item => item.icon),
];
icons.push('Logos/Icon_Icarus');

console.log('Cleaning output path');
for (const filename of await fs.promises.readdir(outputPath)) {
    const filepath = path.join(outputPath, filename);
    await fs.promises.rm(filepath, {
        recursive: true,
    });
}

const linkedIcons: Array<string> = [];
console.log('Creating symlinks');
for (const icon of icons) {
    await fs.promises.mkdir(path.join(outputPath, path.dirname(icon)), {
        recursive: true,
    });
    const iconSourcePath = `${path.join(sourcePath, icon)}.png`;
    const iconOutputPath = path.join(outputPath, icon);
    try {
        await fs.promises.access(iconSourcePath, fs.constants.R_OK);
    } catch (error) {
        console.log(`Skipping "${icon}", it could not be accessed: ${error}`);
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
    commands.push(`convert ${iconPath}.png ${iconPath}.avif`);
    commands.push(`convert ${iconPath}.png ${iconPath}.webp`);
    commands.push(`cjxl -d 4 -e 9 ${iconPath}.png ${iconPath}.jxl`);

    for (const size of sizes) {
        const f = `${iconPath}_${size}`;
        commands.push(`convert ${iconPath}.png -resize ${size} \
            -define png:exclude-chunk=TIME \
            -strip \
            ${f}.png \
            && convert ${f}.png ${f}.avif \
            && convert ${f}.png ${f}.webp \
            && cjxl -d 4 -e 9 ${f}.png ${f}.jxl`);
    }
}

fs.writeFileSync(
    path.join(dirname, 'commands.txt'),
    `${commands.join('\n')}\n`,
    {encoding: 'utf-8'},
);

console.log('Generating image variants');

async function worker() {
    // eslint-disable-next-line @typescript-eslint/tslint/config
    for (;;) {
        const command = commands.shift();
        if (command === undefined) {
            break;
        }
        await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error !== null) {
                    reject(error);
                    return;
                }

                resolve(stdout);
            });
        });
    }
}

const workers: Array<Promise<void>> = [];

// eslint-disable-next-line @typescript-eslint/prefer-for-of
for (let i = 0; i < os.cpus().length; i++) {
    workers.push(worker());
}

await Promise.all(workers);

console.log('Done');
