<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte';
    import Recipe from '$lib/Recipe.svelte';
    import Seconds from '$lib/Seconds.svelte';

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

{#if data.stats.length > 0}
    <h2 id="stats" class="box-start">Stats</h2>
    <div class="box">
        <ul class="list stats">
            {#each data.stats as stat}
                <li>{stat}</li>
            {/each}
        </ul>
    </div>
{/if}

{#if data.modifier !== undefined}
    <h2 id="modifier" class="box-start">Modifier</h2>
    <div class="box">
        {#if data.modifier.lifetime}
            <p>
                Duration: <Seconds seconds={data.modifier.lifetime}></Seconds>
            </p>
        {/if}
        <ul class="list stats">
            {#each data.modifier.stats as stat}
                <li>{stat}</li>
            {/each}
        </ul>
    </div>
{/if}

<h2 id="craft" class="box-start">Craft</h2>
<div class="recipes">
    {#each data.recipes as recipe}
        <div class="box" id="craft-{recipe.name}">
            <Recipe recipe={recipe}></Recipe>
        </div>
    {:else}
        <p class="box">Not craftable.</p>
    {/each}
</div>

<h2 id="used-in" class="box-start">Used in</h2>
<div class="recipes">
    {#each data.ingredientIn as recipe}
        <div class="box" id="used-in-{recipe.name}">
            <Recipe recipe={recipe}></Recipe>
        </div>
    {:else}
        <p class="box">Not used in any recipes.</p>
    {/each}
</div>

{#if data.crafts.length > 0}
    <h2 id="crafts" class="box-start">Crafts</h2>
    <div class="recipes">
        {#each data.crafts as recipe}
            <div class="box" id="crafts-{recipe.name}">
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

    h2 {
        margin-bottom: 0;
    }
</style>
