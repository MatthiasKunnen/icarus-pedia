<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte';
    import type {FullItemCount} from '$lib/recipe.interface';

    export let items: Array<FullItemCount>;
</script>

{#each items as item, i}
    <li class="sum">{#if i > 0}+{/if}</li>
    <li class="item" data-name={item.item.name}>
        <a href="/Items/Item/{item.item.name}">
            <GameIcon
                counter={item.count}
                icon={item.item.icon}
                size="64"
                alt={item.item.displayName}
                showCaption={true}></GameIcon>
        </a>
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
        --game-icon-width: 64px;
        display: flex;
        align-items: center;
    }
</style>
