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
    <p>An information hub on the items in Icarus and how they are crafted.</p>
    <p>
        Content is extracted from the game files. This makes sure the information is up-to-date
        though items that are not yet accessible may be shown.<br>
        Last updated for REV. 2.3.20.145714-SHIPPING-GREATHUNTS GREAT HUNTS on 2025-12-07.
    </p>
    <p>
    </p>
</div>

<style>
    .home-content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        align-items: center;
        justify-content: center;
        gap: 1em;
        font-size: min(5vw, 2em);
        text-align: center;
    }

    .logo {
        font-size: 1.5em;
    }
</style>
