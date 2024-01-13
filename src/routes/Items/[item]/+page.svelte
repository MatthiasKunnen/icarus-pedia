<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte';
    import Recipe from '$lib/Recipe.svelte';

    export let data;
</script>

<a href="/Items">&lt; See all items</a>
<h1>{data.item.displayName}</h1>
<div class="icon">
    <GameIcon
        icon={data.item.icon}
        alt="{data.item.displayName}"
        size="128"
        showCaption={false}></GameIcon>
</div>

<p>{data.item.description}</p>
<p class="flavor-text">{data.item.flavorText}</p>

<h2>Craft</h2>
<div class="recipes">
    {#each data.recipes as recipe}
        <div class="recipe">
            <Recipe recipe={recipe}></Recipe>
        </div>
    {:else}
        <p class="no-content">Not craftable.</p>
    {/each}
</div>

<h2>Used in</h2>
<div class="recipes">
    {#each data.ingredientIn as recipe}
        <div class="recipe">
            <Recipe recipe={recipe}></Recipe>
        </div>
    {:else}
        <p class="no-content">Not used in any recipes.</p>
    {/each}
</div>

{#if data.crafts.length > 0}
    <h2>Crafts</h2>
    <div class="recipes">
        {#each data.crafts as recipe}
            <div class="recipe">
                <Recipe recipe={recipe}></Recipe>
            </div>
        {/each}
    </div>
{/if}

<style>
    .icon {
        --game-icon-width: 128px;
    }

    .flavor-text {
        font-style: italic;
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
