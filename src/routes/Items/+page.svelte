<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte'

    let {data} = $props();

    let searchTerm = $state('')

    let filteredItems = $derived((() => {
        if (searchTerm === '') {
            return data.items
        }

        const matches: Array<{index: number, score: number}> = []
        data.items.forEach((([id, item], index) => {
            if (item.displayName.toLowerCase().includes(searchTerm.toLowerCase())) {
                matches.push({index: index, score: item.displayName.length})
            }
        }));

        matches.sort((a, b) => a.score - b.score)
        const result: typeof data.items = []
        for (const match of matches) {
            result.push(data.items[match.index]!)
        }
        return result
    })());
</script>
<svelte:head>
    <title>Crafting Items | IcarusPedia</title>
</svelte:head>

<h1>All Crafting Items</h1>
<p>
    This page contains all items in Icarus that can be crafted or are used as a crafting
    ingredient.
</p>
<p>Other lists of Icarus items:</p>
<ul class="list">
    <li><a href="/Items/All" class="link">All items including non-usable experimental items</a></li>
</ul>

<search>
    <input id="search" aria-label="Search" type="search" placeholder="E.g. Epoxy" bind:value={searchTerm}/>
</search>
<div class="items">
    {#each filteredItems as [name, item] (name)}
        <a href="/Items/Item/{name}">
            <GameIcon
                icon={item.icon}
                alt={item.displayName}
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

    search {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 2em 0 1em;
    }

    search input {
        font-size: 1.3em;
        width: min(100%, 600px);
        border-radius: 0.2em;
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
