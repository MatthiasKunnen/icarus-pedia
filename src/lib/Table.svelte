<script lang="ts">
    import type {TableColumn, TableRow} from './Table.interface';

    export type TableValue = string | number | undefined;

    export interface TableColumn<Row = any> {
        align?: 'center' | 'right';
        headerDisplay: string;
        id: string;
        render: Snippet<[Row, columnId: string]>;
        /**
         * Columns with reorder set to true will be ordered so that the columns with most values
         * are placed first. If set to false, this column will not be reordered.
         */
        reorder?: boolean;
        sort?: 'asc' | 'desc';
        /**
         * @default true
         */
        sortEnabled?: boolean;
    }

    export interface TableRow {
        id: TableValue;
        [key: string]: TableValue
    }

    let {
        columns,
        data,
        displayedColumnIds,
        firstColumnSticky = true,
        id,
    }: {
        columns: Map<string, TableColumn>;
        data: Array<TableRow>;
        displayedColumnIds: Array<string>,
        firstColumnSticky?: boolean,
        id: string,
    } = $props()
</script>

<div class="table-wrapper">
    <table class={{
        'first-column-sticky': firstColumnSticky,
    }}>
        <thead>
        <tr>
            {#each displayedColumnIds as columnId (columnId)}
                {@const column = columns.get(columnId)!}
                {@const htmlId = columnId.replaceAll(/[^a-zA-Z0-9\-_]/g, '_')}
                <th data-column-id={column.id}>
                    <button
                        class="focus"
                        commandfor="{htmlId}-dialog"
                        command="show-modal"
                        title="Open filter/sort options"
                        aria-label="Open filter/sort options"
                    >
                        {column.headerDisplay}{#if column.hasOptions}
                        ▼
                        {/if}
                    </button>
                    <dialog id="{htmlId}-dialog" class="filter-dialog" closedby="any">
                        <div class="top-actions">
                            <button class="outline">Sort ascending 🡱</button>
                            <button class="outline">Sort descending 🡳</button>
                        </div>
                        <form class="inputs">
                            <!--{#if column.filterType === 'CheckboxWithFilter'}
                                <label for="{htmlId}-search">Contains</label>
                                <input id="{htmlId}-search" type="search">
                            {/if}
                            {#if column.filterType === 'CheckboxWithFilter'
                                || column.filterType === 'CheckboxNoFilter'}
                                {#each column.uniqueValues as value}
                                    <label>
                                        <input type="checkbox" checked>
                                        {value ?? '<empty>'}
                                    </label>
                                {/each}
                            {:else if column.filterType === 'Filter'}
                                <label for="{htmlId}-search">Contains</label>
                                <input id="{htmlId}-search" type="search">
                            {:else if column.filterType === 'Range'}
                                <div class="input-grid">
                                    <label for="{htmlId}-from">From</label>
                                    <input id="{htmlId}-from" type="number" placeholder="10">
                                    <label for="{htmlId}-to">To</label>
                                    <input id="{htmlId}-to" type="number" placeholder="50">
                                </div>
                            {/if}-->
                            <div class="bottom-actions">
                                <button type="submit" formmethod="dialog" class="outline">Close</button>
                                <button type="reset" formmethod="dialog" class="outline">Clear</button>
                            </div>
                        </form>
                    </dialog>
                </th>
            {/each}
        </tr>
        </thead>
        <tbody>
        {#each data as row (row.id)}
            <tr>
                {#each displayedColumnIds as columnId (columnId)}
                {@const column = columns.get(columnId)!}
                    <td class={{
                        'text-center': column.align === 'center',
                        'text-right': column.align === 'right',
                    }}>
                        {@render column.render(row, column.id)}
                    </td>
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>
</div>

<style lang="scss">
    .table-wrapper {
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

    table.first-column-sticky {

        tr th:first-of-type {
            z-index: 15;
            left: 0;
        }

        tr td:first-of-type {
            z-index: 5;
            left: 0;
        }
    }

    table.first-column-sticky tr td:first-of-type,
    table.first-column-sticky tr th:first-of-type,
    th {
        position: sticky;
    }

    .filter-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        max-height: 90vh;
        background-color: inherit;
        color: inherit;
        padding: 1em;
        border: 1px solid white;
        border-radius: var(--border-radius);
        margin: 0;

        .bottom-actions,
        .top-actions {
            display: flex;
            flex-direction: row-reverse;
            justify-content: end;
            gap: 1em;
        }

        .bottom-actions {
            margin-top: 1em;
        }

        .top-actions {
            margin-bottom: 1em;
        }

        .input-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 0.5em;
            align-items: center;
        }
    }
</style>
