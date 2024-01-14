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

<h2 id="crafts" class="box-start">Crafts</h2>
<div class="recipes">
    {#each data.recipes as recipe}
        <div class="box recipe" id="crafts-{recipe.name}">
            <Recipe recipe={recipe}></Recipe>
        </div>
    {:else}
        <p class="box">Nothing to craft.</p>
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
