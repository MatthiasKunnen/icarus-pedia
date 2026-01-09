<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte';

    let {data} = $props();
</script>
<svelte:head>
    <title>Crafters | IcarusPedia</title>
</svelte:head>

<h1>Crafters</h1>

<div class="crafters">
    {#each data.crafters as [name, crafter]}
        <a href="/Items/Item/{name}" data-name={name}>
            <GameIcon
                icon={crafter.icon}
                alt={crafter.displayName}
                size="64"
                showCaption={false}></GameIcon>
            <h2>{crafter.displayName}</h2>
        </a>
    {/each}
</div>

<style>
    a {
        display: flex;
        align-items: center;
        color: white;
        gap: 4px;
        text-decoration: none;
    }

    h2 {
        font-size: 1.3em;
    }

    .crafters {
        display: grid;
        gap: 2em;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        --game-icon-width: 64px;
    }
</style>
