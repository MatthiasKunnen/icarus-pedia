import type {Stat} from '$lib/data.interface';

export function formatStat(
    statName: string,
    statValue: number,
    stats: Record<string, Stat>,
): string {
    const stat = stats[statName];

    if (stat === undefined) {
        console.error(`Could not find stat with name ${statName}`);
        return `${statName} ${statValue}`;
    }

    const format = statValue < 0 && stat.negativeFormat !== undefined
        ? stat.negativeFormat
        : stat.positiveFormat;

    return format.replace('{0}', Math.abs(statValue).toString());
}
