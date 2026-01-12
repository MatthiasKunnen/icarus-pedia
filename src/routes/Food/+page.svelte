<script lang="ts">
    import Seconds from '$lib/Seconds.svelte';
    import type {TableColumn, TableRow} from '$lib/Table.interface.js';
    import Table from '$lib/Table.svelte';

    let {data} = $props();

    const formatStatHeader = (statId: string) => {
        switch (statId) {
            case 'BaseFoodStomachSlots_+':
                return 'Stomach slots';
            default:
                const stat = data.stats.get(statId);
                if (stat === undefined) {
                    console.error(`Could not find stat with name ${statId}`);
                    return statId;
                }

                return stat.positiveFormat.replace('{0}', '');
        }
    }

    let rows = $derived.by(() => {
        return data.items.map(([itemId, item]) => {
            const row: TableRow = {
                id: itemId,
                name: item.displayName,
            };
            for (const [statId, statValue] of Object.entries(item.stats ?? {})) {
                const columnId = statId
                row[columnId] = statValue
            }
            if (item.modifier !== undefined) {
                row.duration = item.modifier.lifetime;
                for (const [statId, statValue] of Object.entries(item.modifier.stats ?? {})) {
                    const columnId = statId
                    row[columnId] = statValue
                }
            }

            return row;
        })
    })
    let columns = $derived.by(() => {
        const result: Array<TableColumn> = [
            {
                headerDisplay: 'Name',
                id: 'name',
                render: nameRender,
                sort: 'asc',
            },
            {
                align: 'center',
                headerDisplay: 'Duration',
                id: 'duration',
                render: duration,
            },
        ];
        const columnsAdded = new Set<string>();
        for (const [itemId, item] of data.items) {
            for (const statId of Object.keys(item.stats ?? {})) {
                const columnId = statId
                if (columnsAdded.has(columnId)) {
                    continue
                }
                columnsAdded.add(columnId);

                result.push({
                    align: 'center',
                    headerDisplay: formatStatHeader(statId),
                    id: columnId,
                    render: stringVal,
                    reorder: true,
                })
            }

            if (item.modifier !== undefined) {
                for (const [statId, statValue] of Object.entries(item.modifier.stats ?? {})) {
                    const columnId = statId
                    if (columnsAdded.has(columnId)) {
                        continue
                    }
                    columnsAdded.add(columnId);

                    result.push({
                        align: 'center',
                        headerDisplay: formatStatHeader(statId),
                        id: columnId,
                        render: stringVal,
                        reorder: true,
                    })
                }
            }
        }


        return result;
    })

</script>
<svelte:head>
    <title>Food | IcarusPedia</title>
</svelte:head>

<h1>Food</h1>

<Table columns={columns} rows={rows} id="food-comparison"></Table>

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

<style>
    .name-link {
        font-weight: bold;
        font-size: 1.1em;
    }
</style>
