<script lang="ts">
    import Seconds from '$lib/Seconds.svelte';
    import type {TableColumn, TableRow} from '$lib/table.interface.js';
    import Table from '$lib/Table.svelte';
    import TableRangeFilter from '$lib/TableRangeFilter.svelte';
    import {toHtmlId} from '$lib/util/id.util';
    import {SvelteMap} from 'svelte/reactivity';

    let {data} = $props();

    const toColumnInfo = (statId: string): TableColumn => {
        let display: string;
        let renderOptions: TableColumn['renderOptions'] | undefined;

        switch (statId) {
            case 'BaseFoodStomachSlots_+':
                display = 'Stomach slots';
                renderOptions = statFilter
                break;
            default:
                const stat = data.stats.get(statId);
                if (stat === undefined) {
                    console.error(`Could not find stat with name ${statId}`);
                    display = statId;
                    break;
                }

                display = stat.positiveFormat.replace('{0}', '');
                renderOptions = statFilter
        }

        return {
            align: 'center',
            headerDisplay: display,
            render: stringVal,
            renderOptions: renderOptions,
        }
    }

    let rows = $derived.by(() => {
        return data.items.map(([itemId, item]) => {
            const row: TableRow = {
                id: itemId,
                name: item.displayName,
            };
            for (const [statId, statValue] of Object.entries(item.stats ?? {})) {
                row[statId] = statValue
            }
            if (item.modifier !== undefined) {
                row.duration = item.modifier.lifetime;
                for (const [statId, statValue] of Object.entries(item.modifier.stats ?? {})) {
                    row[statId] = statValue
                }
            }

            return row;
        })
    })


    let [columns, alwaysVisibleColumns, hideWhenEmptyColumns] = $derived.by(() => {
        const columnsResult = new Map<string, TableColumn>();
        const columnDataCount = new Map<string, number>();

        columnsResult.set('name', {
            headerDisplay: 'Name',
            render: nameRender,
            sort: 'asc',
            // @todo renderOptions: checkboxFilterWithSearch,
        })
        columnsResult.set('duration', {
            align: 'center',
            headerDisplay: 'Duration',
            render: duration,
            renderOptions: durationFilter,
        })

        const incColumnValue = (columnId: string) => {
            const currentCount = columnDataCount.get(columnId);
            if (currentCount === undefined) {
                columnDataCount.set(columnId, 1)
            } else {
                columnDataCount.set(columnId, currentCount + 1)
            }
        }

        for (const [itemId, item] of data.items) {
            for (const statId of Object.keys(item.stats ?? {})) {
                incColumnValue(statId);

                if (!columnsResult.has(statId)) {
                    columnsResult.set(statId, toColumnInfo(statId));
                }
            }

            if (item.modifier !== undefined) {
                for (const statId of Object.keys(item.modifier.stats ?? {})) {
                    incColumnValue(statId);

                    if (!columnsResult.has(statId)) {
                        columnsResult.set(statId, toColumnInfo(statId));
                    }
                }
            }
        }

        return [
            columnsResult,
            [
                'name',
                'duration',
            ],
            Array.from(columnDataCount.entries())
                .sort(([, aCount], [, bCount]) => bCount - aCount)
                .map(([columnId]) => columnId),
        ];
    })

    /**
     * filter contains a Map of columnId -> filterFn.
     * When filtering, filterFn will be called with the row and columnId.
     * True should be returned if the row matches the filter, false otherwise.
     */
    let filter = $state(new SvelteMap<string, (row: TableRow, columnId: string) => boolean>())
    let sort = $state<{columnId: string; asc: boolean} | undefined>(undefined);
    let [filteredRows, displayedColumnIds] = $derived.by(() => {
        const rowFilterResult = rows.filter(row => {
            for (const [columnId, filterFn] of filter) {
                if (!filterFn(row, columnId)) {
                    return false
                }
            }

            return true
        })
        const sortV = sort
        if (sortV !== undefined) {
            rowFilterResult.sort((aRow, bRow) => {
                if (!sortV.asc) {
                    [aRow, bRow] = [bRow, aRow]
                }

                let a = aRow[sortV.columnId]
                let b = bRow[sortV.columnId]
                if (typeof a === 'string' || typeof b === 'string') {
                    const aString = typeof a === 'string' ? a : ''
                    const bString = typeof b === 'string' ? b : ''

                    return aString.localeCompare(bString)
                }
                if (typeof a === 'number' || typeof b === 'number') {
                    const aNumber = typeof a === 'number' ? a : -Infinity
                    const bNumber = typeof b === 'number' ? b : -Infinity

                    return aNumber - bNumber
                }

                return 0
            })
        }

        const displayedColumnsResult = hideWhenEmptyColumns.filter(columnId => {
            if (filter.has(columnId)) {
                return true;
            }

            return rowFilterResult.some(row => row[columnId] !== undefined)
        });

        return [
            rowFilterResult,
            [...alwaysVisibleColumns, ...displayedColumnsResult],
        ]
    })
</script>
<svelte:head>
    <title>Food | IcarusPedia</title>
</svelte:head>

<h1>Food</h1>

<Table
    columns={columns}
    data={filteredRows}
    displayedColumnIds={displayedColumnIds}
    id="food-comparison"></Table>

{#snippet nameRender(val: TableRow, columnId: string)}
    <a class="name-link" href="/Items/Item/{val.id}">{val[columnId]}</a>
{/snippet}

{#snippet stringVal(val: TableRow, columnId: string)}
    {val[columnId]}
{/snippet}

{#snippet duration(val: TableRow, columnId: string)}
    {#if typeof val[columnId] === 'number'}
        <Seconds seconds={val[columnId]} format="short"></Seconds>
    {/if}
{/snippet}

{#snippet statFilter(columnId: string)}
    {@const htmlId = toHtmlId(columnId)}
    {@render sortOptions(columnId)}
    <TableRangeFilter
        htmlId={htmlId}
        change={predicate => {
            if (predicate === null) {
                filter.delete(columnId);
            } else {
                filter.set(columnId, (row, columnId) => {
                    return predicate(row[columnId]);
                })
            }
        }}
    ></TableRangeFilter>
{/snippet}
{#snippet durationFilter()}
    {@render sortOptions("duration")}
    <TableRangeFilter
        htmlId="duration"
        change={predicate => {
            if (predicate === null) {
                filter.delete("duration");
            } else {
                filter.set("duration", (row, columnId) => {
                    const duration = row[columnId]
                    if (duration === undefined) {
                        return false;
                    }
                    if (typeof duration !== 'number') {
                        throw new Error('Duration is not a number')
                    }
                    return predicate(duration / 60);
                })
            }
        }}
    ></TableRangeFilter>
{/snippet}

{#snippet sortOptions(columnId: string)}
    <div class="top-actions">
        <button
            type="submit"
            class="outline"
            onclick={() => sort = {columnId: columnId, asc: false}}
        >Sort descending</button>
        <button
            type="submit"
            class="outline"
            onclick={() => sort = {columnId: columnId, asc: true}}
        >Sort ascending</button>
    </div>
{/snippet}

<style>
    .name-link {
        font-weight: bold;
        font-size: 1.1em;
    }

    .top-actions {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: start;
        gap: 1em;
        margin-bottom: 1em;
    }
</style>
