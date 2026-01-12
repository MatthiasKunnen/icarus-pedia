<script lang="ts">
    import type {TableColumn, TableRow} from './Table.interface';

    let {
        columns: columnsInput,
        firstColumnSticky = true,
        id,
        rows,
    }: {
        columns: Array<TableColumn>;
        firstColumnSticky?: boolean,
        id: string,
        rows: Array<TableRow>;
    } = $props()

    interface InternalColumn {
        info: TableColumn;
        rowsWithData: number;
    }

    let columns = $derived.by<Array<InternalColumn>>(() => {
        const result: Array<InternalColumn> = [];
        for (const column of columnsInput) {
            const intColumn: InternalColumn = {
                info: column,
                rowsWithData: 0,
            }

            for (const row of rows) {
                if (row[column.id] !== undefined) {
                    intColumn.rowsWithData++
                }
            }

            result.push(intColumn);
        }
        result.sort((a, b) => {
            if (a.info.reorder !== true || b.info.reorder !== true) {
                return 0
            }

            return b.rowsWithData - a.rowsWithData
        })

        return result
    })


</script>

<div class="wrapper">
    <table class={{
        'first-column-sticky': firstColumnSticky,
    }}>
        <thead>
        <tr>
            {#each columns as column}
                {#if column.rowsWithData > 0}
                    <th data-column-id={column.info.id}>
                        <button>{column.info.headerDisplay}</button>
                    </th>
                {/if}
            {/each}
        </tr>
        </thead>
        <tbody>
        {#each rows as row (row.id)}
            <tr>
                {#each columns as column (column.info.id)}
                    {#if column.rowsWithData > 0}
                        <td class={{
                            'text-center': column.info.align === 'center',
                            'text-right': column.info.align === 'right',
                        }}>
                            {@render column.info.render(row, column.info.id)}
                        </td>
                    {/if}
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<style>
    .wrapper {
        width: 100%;
        overflow: auto;
    }

    table {
        position: relative;
        border-collapse: collapse;
        width: max-content;
        background-color: var(--background-color);
    }

    th {
        z-index: 10;
        top: 0;
        font-size: 1.1em;
        font-weight: bold;
    }

    td, th {
        padding: 0.25em 0.5em;
        max-width: clamp(15ch, 8vw, 30ch);
        background-color: var(--background-color);
    }
    tbody tr:nth-child(odd) td {
        background-color: color-mix(in oklch, var(--background-color), white 3%);

    }
    tbody tr:hover td,
    tbody tr:focus-within td {
        background-color: color-mix(in oklch, var(--background-color), white 10%);
    }

    table.first-column-sticky tr th:first-of-type {
        z-index: 15;
        left: 0;
    }

    table.first-column-sticky tr td:first-of-type {
        z-index: 5;
        left: 0;
    }

    table.first-column-sticky tr td:first-of-type,
    table.first-column-sticky tr th:first-of-type,
    th {
        position: sticky;
    }
</style>
