<script lang="ts">
    import type {FullRecipe} from '$lib/recipe.interface';
    import RecipeItems from '$lib/RecipeItems.svelte';

    export let recipe: FullRecipe;
</script>

<div class="in-and-out" data-recipe-name={recipe.name}>
    <ul class="items">
        <RecipeItems items={recipe.outputs}></RecipeItems>
    </ul>
    <span class="direction">←</span>
    <ul class="items">
        <RecipeItems items={recipe.inputs}></RecipeItems>
    </ul>
</div>
<p class="craft-at">Craft at: {recipe.craftedAt.join(', ')}</p>

<style>
    .in-and-out {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
    }

    .direction {
        font-size: 3em;
    }

    .items {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        list-style: none;
    }

    .items:first-of-type {
        flex-shrink: 0;
    }

    ul {
        margin: 0;
        padding: 0;
    }

    .craft-at {
        margin: 1em 0 0 0;
    }
</style>
