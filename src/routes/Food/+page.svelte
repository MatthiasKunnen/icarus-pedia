<script lang="ts">
    import Seconds from '$lib/Seconds.svelte';
    import type {TableColumn, TableRow} from '$lib/table.interface.js';
    import Table from '$lib/Table.svelte';
    import {toHtmlId} from '$lib/util/id.util';

    let {data} = $props();

    const toColumnInfo = (statId: string): TableColumn => {
        // let filterType: TableColumn['filterType'] = 'Range';
        let display: string;

        switch (statId) {
            case 'BaseFoodStomachSlots_+':
                display = 'Stomach slots';
                //     filterType = 'CheckboxNoFilter';
                break;
            default:
                const stat = data.stats.get(statId);
                if (stat === undefined) {
                    console.error(`Could not find stat with name ${statId}`);
                    display = statId;
                    break;
                }

                display = stat.positiveFormat.replace('{0}', '');
        }

        return {
            align: 'center',
            headerDisplay: display,
            render: stringVal,
            renderOptions: statFilter,
        }
    }

    let filter = $state({})

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
    let [columns, displayedColumnIds] = $derived.by(() => {
        const columnsResult = new Map<string, TableColumn>();
        const columnDataCount = new Map<string, number>();

        columnsResult.set('name', {
            // filterType: 'CheckboxWithFilter',
            headerDisplay: 'Name',
            render: nameRender,
            sort: 'asc',
        })
        columnsResult.set('duration', {
            align: 'center',
            headerDisplay: 'Duration',
            render: duration,
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
                ...Array.from(columnDataCount.entries())
                    .sort(([, aCount], [, bCount]) => bCount - aCount)
                    .map(([columnId]) => columnId)
            ]
        ];
    })
</script>
<svelte:head>
    <title>Food | IcarusPedia</title>
</svelte:head>

<h1>Food</h1>

<Table
    columns={columns}
    data={rows}
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
    <div class="input-grid">
        <label for="{htmlId}-from">From</label>
        <input bind:value={filter[columnId].from} id="{htmlId}-from" type="number" placeholder="10">
        <label for="{htmlId}-to">To</label>
        <input id="{htmlId}-to" type="number" placeholder="50">
    </div>
{/snippet}

<style>
    .name-link {
        font-weight: bold;
        font-size: 1.1em;
    }
</style>
