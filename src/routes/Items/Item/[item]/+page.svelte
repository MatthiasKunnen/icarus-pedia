<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte';
    import Recipe from '$lib/Recipe.svelte';
    import Seconds from '$lib/Seconds.svelte';

    let {data} = $props();
</script>

<svelte:head>
    <title>{data.displayName} | IcarusPedia</title>
</svelte:head>

<a href="/Items">&lt; See all items</a>
<h1>{data.displayName}</h1>
<div class="icon">
    <GameIcon
        icon={data.icon}
        alt={data.displayName}
        size="128"
        showCaption={false}></GameIcon>
</div>

<p>{data.description}</p>
{#if data.flavorText !== undefined}
    <p class="flavor-text">{data.flavorText}</p>
{/if}

<div class="stats-wrapper">
    <div class="statblock">
        <h2 id="info" class="box-start">Information</h2>
        <div class="box">
            <dl class="info-grid">
                <dt>Weight:</dt>
                <dd>{data.weight / 1000} kg</dd>
                <dt>Stack size:</dt>
                <dd>{data.stackSize}</dd>
                <dt>Full stack weight:</dt>
                <dd>{data.stackSize * data.weight / 1000} kg</dd>
                {#if data.durability !== undefined}
                    <dt>Durability:</dt>
                    <dd>{data.durability}</dd>
                {/if}
                {#if data.affectedByWeather !== undefined}
                    <dt>Affected by weather:</dt>
                    <dd>{data.affectedByWeather ? 'Yes' : 'No'}</dd>
                {/if}
                {#if data.requiresShelter !== undefined}
                    <dt>Requires shelter:</dt>
                    <dd>{data.requiresShelter ? 'Yes' : 'No'}</dd>
                {/if}
                {#if data.mustBeOutside !== undefined}
                    <dt>Must be outside:</dt>
                    <dd>{data.mustBeOutside ? 'Yes' : 'No'}</dd>
                {/if}
            </dl>
        </div>
    </div>
    {#if data.stats.length > 0}
        <div class="statblock">
            <h2 id="stats" class="box-start">Stats</h2>
            <div class="box">
                <ul class="list stats">
                    {#each data.stats as stat}
                        <li>{stat}</li>
                    {/each}
                </ul>
            </div>
        </div>
    {/if}
    {#if data.modifier !== undefined}
        <div class="statblock">
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
        </div>
    {/if}
</div>

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

    .stats-wrapper {
        display: flex;
        gap: 1.5em;
    }

    .statblock {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        flex-grow: 1;
    }

    .statblock .box {
        flex-grow: 1;
    }

    .info-grid {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.5em;
    }

    .info-grid dt {
        justify-self: flex-end;
    }

    @media (max-width: 1199px) {
        .stats-wrapper {
            flex-direction: column;
            gap: 0;
        }
    }
</style>
