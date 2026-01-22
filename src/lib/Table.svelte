<script lang="ts">
    import type {TableColumn, TableRow} from './table.interface';
    import {toHtmlId} from '$lib/util/id.util';
    import {SvelteMap} from 'svelte/reactivity';

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

    /**
     * Maps columnId to its dialog.
     * Note that a column's renderOptions could be removed and then the dialog would
     * no longer exist.
     */
    let dialogs = $state(new SvelteMap<string, HTMLDialogElement>());
</script>

<div class="table-wrapper">
    <table class={{
        'first-column-sticky': firstColumnSticky,
    }}>
        <thead>
        <tr>
            {#each displayedColumnIds as columnId (columnId)}
                {@const column = columns.get(columnId)!}
                <th data-column-id={columnId}>
                    {#if column.renderOptions === undefined}
                        {column.headerDisplay}
                    {:else}
                        <button
                            class="focus"
                            onclick={() => dialogs.get(columnId)?.showModal()}
                            title="Open column options"
                            aria-label="{column.headerDisplay} — open column options"
                            aria-haspopup="dialog"
                            disabled={column.renderOptions === undefined}
                        >
                            {column.headerDisplay}▼
                        </button>
                    {/if}
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
                        {@render column.render(row, columnId)}
                    </td>
                {/each}
            </tr>
        {/each}
        </tbody>
    </table>

    {#each displayedColumnIds as columnId (columnId)}
        {@const column = columns.get(columnId)!}
        {@const htmlId = toHtmlId(columnId)}
        <dialog
            id="{htmlId}-dialog"
            bind:this={() => dialogs.get(columnId), v => dialogs.set(columnId, v)}
            class="filter-dialog"
            closedby="any">
            <h1>{column.headerDisplay}: options</h1>
            <form class="inputs" method="dialog">
                <button type="submit" hidden>
                    <!--A submit button must be first to prevent triggering another
                    submit button-->
                </button>
                {@render column.renderOptions?.(columnId)}
                <div class="bottom-actions">
                    <button
                        type="submit"
                        class="outline">Close
                    </button>
                </div>
            </form>
        </dialog>
    {/each}
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
        max-width: clamp(15ch, 8dvw, 30ch);
        background-color: var(--background-color);
    }

    th button {
        padding: 0.25em 0.5em;
    }

    th:has(button) {
        padding-right: 0;
        padding-left: 0;
    }

    tbody tr:nth-child(odd) td {
        background-color: color-mix(in oklch, var(--background-color), white 3%);
    }

    tbody tr:is(:hover, :focus-within) td {
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

    table.first-column-sticky tr :where(td, td):first-of-type,
    th {
        position: sticky;
    }

    .filter-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        max-height: 90dvh;
        min-width: min(90dvw, 500px);
        color: inherit;
        padding: 1em;
        background-color: var(--background-color);
        border: 1px solid white;
        border-radius: var(--border-radius);
        margin: 0;

        h1 {
            font-size: 1.7em;
        }

        .bottom-actions {
            display: flex;
            flex-direction: row-reverse;
            justify-content: end;
            gap: 1em;
        }

        .bottom-actions {
            margin-top: 1em;
        }
    }
</style>
