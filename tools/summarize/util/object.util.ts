import type {Ref, RefWithDataTable} from '../types/common.interface.js';

export function sortObjectKeys<T>(obj: Record<string, T>): Record<string, T> {
    return Object.keys(obj).sort().reduce<Record<string, T>>((newObj, key) => {
        newObj[key] = obj[key]!;
        return newObj;
    }, {});
}

export function refIsSet<T extends Ref | RefWithDataTable>(
    ref: T | undefined,
): ref is T {
    return ref !== undefined && ref.RowName !== 'None';
}

export function objectHasKeys<T extends Record<string, unknown>>(
    obj: T | undefined,
): obj is T {
    if (obj === undefined) {
        return false;
    }

    return Object.keys(obj).length > 0;
}
