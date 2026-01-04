import type {ItemStaticRow} from '../types/item-static.interface.js';

export function staticItemTagMatches(
    item: ItemStaticRow,
    predicate: (tagname: string) => boolean,
): boolean {
    if (item.Generated_Tags !== undefined) {
        for (const gameplayTag of item.Generated_Tags.GameplayTags) {
            if (predicate(gameplayTag.TagName)) {
                return true;
            }
        }
    }

    // For all 2435 items, Manual_Tags contains, in the same order, the first
    // x tags of Generated_Tags. This makes Manual_Tags completely redundant.
    // It does not even contain tags that are not in Generated_Tags.
    // We'll check it just in case.
    if (item.Manual_Tags !== undefined) {
        for (const gameplayTag of item.Manual_Tags.GameplayTags) {
            if (predicate(gameplayTag.TagName)) {
                return true;
            }
        }
    }

    return false;
}
