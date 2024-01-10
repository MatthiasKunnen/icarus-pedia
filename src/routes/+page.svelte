<script lang="ts">
    import Logo from '$lib/Logo.svelte';
</script>

<div class="home-content">
    <div class="logo">
        <Logo size="auto"></Logo>
    </div>
    <p>An information hub on the items in Icarus and how they are crafted.</p>
    <p>
        Content is extracted from the game files. This makes sure the information is up-to-date
        though items that are not yet accessible may be shown.
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
        font-size: 2em;
        text-align: center;
    }

    .logo {
        font-size: 1.5em;
    }
</style>
