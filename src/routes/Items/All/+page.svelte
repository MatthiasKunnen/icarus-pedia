<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte'

    export let data;

</script>

<svelte:head>
    <title>All Items (including unusable) | IcarusPedia</title>
</svelte:head>

<h1>All Icarus Items (including unusable)</h1>
<p>
    This includes items that are experimental and not craftable. For a list of crafting items, go
    <a href="/Items" class="link">here</a>.
</p>

<div class="items">
    {#each data.items as [name, item]}
        <a href="/Items/Item/{name}">
            <GameIcon
                icon={item.icon}
                alt="{item.displayName}"
                size="64"
                showCaption={false}></GameIcon>
            <h2>{item.displayName}</h2>
        </a>
    {/each}
</div>

<style>
    h2 {
        font-size: 1.3em;
    }

    .items {
        display: grid;
        gap: 2em;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        --game-icon-width: 64px;
    }

    .items a {
        display: flex;
        align-items: center;
        color: white;
        gap: 4px;
        text-decoration: none;
    }
</style>
