<script lang="ts">
    import Logo from '$lib/Logo.svelte';
</script>
<svelte:head>
    <title>IcarusPedia</title>
</svelte:head>

<div class="home-content">
    <div class="logo">
        <Logo size="auto"></Logo>
    </div>
    <p>
        An information hub on the items in Icarus.
        All data is extracted from the game files
        This makes sure the information is up-to-date, though items that are not yet accessible may
        be shown.
    </p>
    <h2>Items</h2>
    <p>View all items in Icarus at <a class="link" href="/Items">/Items</a>.</p>
    <h2>Crafting benches</h2>
    <p>View all crafting benches <a class="link" href="/Crafters">/Crafters</a>.</p>
</div>

<style>
    .home-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        align-items: center;
        justify-content: center;
        gap: 1em;
        font-size: min(5vw, 1.5em);
        text-align: center;
    }

    .logo {
        font-size: 1.5em;
    }
</style>
