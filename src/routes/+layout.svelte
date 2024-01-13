<script lang="ts">
    import {afterNavigate} from '$app/navigation';
    import {page} from '$app/stores';
    import Logo from '$lib/Logo.svelte';
    import type {Snapshot} from '@sveltejs/kit';

    import './normalize.css';
    import './global.css';

    let rootContent: HTMLElement;
    let lastScrollRestoreTime = 0;

    afterNavigate(() => {
        if (Date.now() - lastScrollRestoreTime > 500) {
            // Only scroll to top if no restore has been performed. This prevents content from
            // flashing on back button where first, a scroll to top is performed, and then
            // an immediate scroll to content.
            // See https://github.com/sveltejs/kit/issues/10823
            rootContent.scrollTop = 0;
        }
    });

    export const snapshot: Snapshot<number> = {
        capture: () => {
            return rootContent.scrollTop;
        },
        restore: (value) => {
            // Executed before afterNavigate, see https://github.com/sveltejs/kit/issues/10823
            lastScrollRestoreTime = Date.now()
            rootContent.scrollTop = value
        },
    };
</script>

<svelte:head>
    {#if typeof $page.data.title === 'string'}
        <title>{$page.data.title + ' | IcarusPedia'}</title>
    {:else}
        <title>IcarusPedia</title>
    {/if}
</svelte:head>

<div class="body">
    <div class="root-content" bind:this={rootContent}>
        <slot></slot>
    </div>
    <footer>
        <a href="/" class="logo">
            <Logo size={64}></Logo>
        </a>
        <nav>
            <a href="/Items">Items</a>
            <a href="/Crafters">Crafters</a>
        </nav>
    </footer>
</div>


<style>
    .body {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .root-content {
        display: flex;
        flex-direction: column;
        padding: 16px;
        flex-grow: 1;
        overflow: auto;
        scrollbar-gutter: stable both-edges;
    }

    footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
        background-color: var(--accent-color);
    }

    footer nav {
        gap: 4px;
    }

    footer nav a {
        border: 1px solid white;
        border-radius: 8px;
        padding: 0.25em 1.5em;
        font-size: 1.5em;
        font-weight: bold;
        transition: opacity linear 150ms;
    }

    footer nav a:hover {
        opacity: 0.5;
    }
</style>
