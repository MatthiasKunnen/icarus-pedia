export function sortObjectKeys<T>(obj: Record<string, T>): Record<string, T> {
    return Object.keys(obj).sort().reduce<Record<string, T>>((newObj, key) => {
        newObj[key] = obj[key]!;
        return newObj;
    }, {});
}
