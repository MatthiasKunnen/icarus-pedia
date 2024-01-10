<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte';
    import type {FullItemCount} from '$lib/recipe.interface';

    export let items: Array<FullItemCount>;
</script>

{#each items as item, i}
    {#if i > 0}
        +
    {/if}
    <li class="item">
        <a href="/items/{item.item.name}">
            <GameIcon
                icon={item.item.icon}
                size="64"
                alt={item.item.displayName}
                showCaption={true}></GameIcon>
        </a>
        {#if item.count > 1}
            <span class="counter">{item.count}</span>
        {/if}
    </li>
{/each}

<style>
    a {
        color: unset;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
    }

    .item {
        position: relative;
        display: flex;
        padding-top: 6px;
        padding-right: 16px;
        align-items: center;
    }

    .counter {
        position: absolute;
        top: 0;
        right: 0;
        padding: 0 4px;
        background-color: #a5d740;
        color: black;
        border-radius: 0.2em;
    }
</style>
