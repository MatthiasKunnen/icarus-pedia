<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte';
    import Recipe from '$lib/Recipe.svelte';

    export let data;
</script>

<a href="/Crafters">&lt; See all crafters</a>
<h1>{data.crafter.displayName}</h1>
<div class="icon">
    <GameIcon
        icon={data.crafter.icon}
        alt="{data.crafter.displayName}"
        size="128"
        showCaption={false}></GameIcon>
</div>

<h2>Crafts</h2>
<div class="recipes">
    {#each data.recipes as recipe}
        <div class="recipe">
            <Recipe recipe={recipe}></Recipe>
        </div>
    {:else}
        <p class="no-content">Nothing to craft.</p>
    {/each}
</div>

<style>
    .icon {
        --game-icon-width: 128px;
    }

    h2, .recipe, .no-content {
        padding: .8em;
    }

    h2, .recipes {
        border: 1px solid var(--accent-color);
    }

    .recipe {
        border-bottom: 1px solid var(--accent-color);
    }

    h2 {
        margin-bottom: 0;
    }

    .recipe {
        border-top: none;
    }
</style>
