import {sortObjectKeys} from './object.util.js';
import type {ItemModifier, ItemStats} from '../../../src/lib/data.interface.js';
import type {ConsumableRow} from '../types/consumable.interface.js';
import type {ModifierStateRow} from '../types/modifier-states.interface.js';

const statRegex = /^\(Value="(.*)"\)$/u;

export function extractStats(
    input: Record<string, number>,
    knownStats: ReadonlyMap<string, unknown>,
): [stats: ItemStats, error: null] | [stats: null, error: string] {
    const stats: ItemStats = {};

    for (const [stat, value] of Object.entries(input)) {
        const matchResult = statRegex.exec(stat);

        if (matchResult === null) {
            return [null, `Stat '${stat}' cannot be parsed.`];
        }

        const match = matchResult[1];

        if (match === undefined) {
            return [
                null, `Match for '${stat}' did capture, regexResult=[${
                    matchResult.join(', ')}].`,
            ];
        }

        if (!knownStats.has(match)) {
            continue;
        }

        stats[match] = value;
    }

    return [stats, null];
}

export function getModifier(
    consumable: ConsumableRow | undefined,
    modifierStatesMap: Map<string, ModifierStateRow>,
    knownStats: ReadonlyMap<string, unknown>,
): [modifer: null, error: string] | [modifier: ItemModifier | undefined, error: null] {
    if (consumable?.Modifier?.Modifier === undefined) {
        return [undefined, null];
    }

    const modifierName = consumable.Modifier.Modifier.RowName;
    const modifierState = modifierStatesMap.get(modifierName);

    if (modifierState === undefined) {
        return [null, `modifier '${modifierName}' of consumable ${consumable.Name} not found`];
    }

    let stats: ItemStats | undefined;
    if (modifierState.GrantedStats !== undefined) {
        const [statsResult, error] = extractStats(
            modifierState.GrantedStats,
            knownStats,
        );

        if (error !== null) {
            return [
                null,
                `getModifier: name=${modifierName}, consumable=${consumable.Name}. Err=${error}`,
            ];
        }

        stats = sortObjectKeys(statsResult);
    }

    if ((stats === undefined || Object.keys(stats).length === 0)
        && consumable.Modifier.ModifierLifetime === 0) {
        return [undefined, null];
    }

    return [
        {
            lifetime: consumable.Modifier.ModifierLifetime,
            stats: stats,
        },
        null,
    ];
}
