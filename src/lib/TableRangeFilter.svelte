<script lang="ts">
    let {
        change,
        htmlId,
    }: {
        change: (predicate: ((value: unknown) => boolean) | null) => void,
        htmlId: string,
    } = $props()

    let from = $state<number | null>(null)
    let to = $state<number | null>(null)
    const update = () => {
        if (from === null && to === null) {
            change(null)
            return;
        }

        change(val => {
            if (val === undefined || typeof val !== 'number') {
                return false;
            }

            if (from !== null && val < from) {
                return false;
            }


            if (to !== null && val > to) {
                return false;
            }

            return true;
        })
    }
</script>

<div class="inputs">
    <label for="{htmlId}-from">From</label>
    <input id="{htmlId}-from" bind:value={from} oninput={() => update()} type="number" placeholder="10">
    <label for="{htmlId}-to">To</label>
    <input id="{htmlId}-to" bind:value={to} oninput={() => update()} type="number" placeholder="50">
</div>

<style>
    label {
        margin-right: 0.5em;
    }

    .inputs {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1em;
    }

    input {
        max-width: 10ch;
        margin-right: 1em;
    }
</style>
