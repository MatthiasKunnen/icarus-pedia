<script lang="ts">
    import type {FullRecipe} from '$lib/recipe.interface';
    import RecipeItems from '$lib/RecipeItems.svelte';

    export let recipe: FullRecipe;
</script>

<div class="recipe">
    <div class="in-and-out" data-recipe-name={recipe.name}>
        <ul class="items">
            <RecipeItems items={recipe.outputs}></RecipeItems>
        </ul>
        <span class="direction">←</span>
        <ul class="items">
            <RecipeItems items={recipe.inputs}></RecipeItems>
        </ul>
    </div>
    <p class="craft-at">Craft at:
        {#each recipe.craftedAt as crafter, i}
            {#if i > 0},{/if}
            <a href="/Items/Item/{crafter.id}">{crafter.displayName}</a>
        {:else}
            cannot be crafted anywhere.
        {/each}
    </p>
</div>

<style>
    .recipe {
        container: recipe / inline-size;
    }

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
    }

    ul {
        margin: 0;
        padding: 0;
    }

    .craft-at {
        margin: 1em 0 0 0;
    }

    .craft-at a {
        border-bottom: 1px solid white;
    }

    @container recipe (max-width: 599px) {

        .in-and-out {
            flex-direction: column;
        }

        .direction {
            transform: rotate(90deg);
        }
    }
</style>
