<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte'

    export let data;

</script>

<h1>All Icarus Items</h1>

<div class="items">
    {#each data.items as [name, item]}
        <a href="/items/{name}">
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

    .items {
        display: flex;
        flex-wrap: wrap;
        gap: 1em;
        --game-icon-width: 64px;
    }
</style>
