import type {ItemStaticRow} from '../item-static.interface.js';

export function staticItemTagMatches(
    item: ItemStaticRow,
    predicate: (tagname: string) => boolean,
): boolean {
    if (item.Manual_Tags !== undefined) {
        for (const gameplayTag of item.Manual_Tags.GameplayTags) {
            if (predicate(gameplayTag.TagName)) {
                return true;
            }
        }
    }

    if (item.Generated_Tags !== undefined) {
        for (const gameplayTag of item.Generated_Tags.GameplayTags) {
            if (predicate(gameplayTag.TagName)) {
                return true;
            }
        }
    }

    return false;
}
