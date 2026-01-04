<script lang="ts">
    import GameIcon from '$lib/GameIcon.svelte';
    import Recipe from '$lib/Recipe.svelte';

    export let data;
</script>

<svelte:head>
    <title>{data.displayName} | IcarusPedia</title>
</svelte:head>

<h1>{data.displayName}</h1>
<div class="icon">
    <GameIcon
        icon={data.icon}
        alt="{data.displayName}"
        size="128"
        showCaption={false}></GameIcon>
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


<style>
    .icon {
        --game-icon-width: 128px;
    }

    h2 {
        margin-bottom: 0;
    }
</style>
