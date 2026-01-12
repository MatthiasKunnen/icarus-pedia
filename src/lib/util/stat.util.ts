import type {Stat} from '$lib/data.interface';

export function formatStat(
    statName: string,
    statValue: number | string,
    stat: Stat | undefined,
): string {
    if (stat === undefined) {
        console.error(`Could not find stat with name ${statName}`);
        return `${statName}: ${statValue}`;
    }

    if (typeof statValue === 'string') {
        return stat.positiveFormat.replace('{0}', statValue);
    }

    const format = statValue < 0 && stat.negativeFormat !== undefined
        ? stat.negativeFormat
        : stat.positiveFormat;

    return format.replace('{0}', Math.abs(statValue).toString());
}
