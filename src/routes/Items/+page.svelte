<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte'

    export let data;

</script>
<svelte:head>
    <title>Craftable Items | IcarusPedia</title>
</svelte:head>

<h1>All Craftable Icarus Items</h1>
<p>Other lists of Icarus items:</p>
<ul class="list">
    <li><a href="/Items/All" class="link">All items including non-craftable experimental items</a></li>
</ul>

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
