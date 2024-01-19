<script lang="ts">
    import {afterNavigate} from '$app/navigation';
    import Logo from '$lib/Logo.svelte';
    import type {Snapshot} from '@sveltejs/kit';

    import './normalize.css';
    import './global.css';

    let rootContent: HTMLElement;
    let mobileNavOpen = false;
    let lastScrollRestoreTime = 0;

    afterNavigate(() => {
        mobileNavOpen = false;
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

<div class="body" class:mobileNavOpen>
    <header>
        <nav class="nav-mobile">
            <a href="/Items">Items</a>
            <a href="/Crafters">Crafters</a>
            <a href="https://github.com/MatthiasKunnen/icarus-pedia">
                <svg class="text-icon" viewBox="0 0 98 96">
                    <path d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/>
                </svg>
                GitHub
            </a>
        </nav>
        <a href="/" class="logo">
            <Logo size={64}></Logo>
        </a>
        <nav class="nav-desktop">
            <a href="/Items">Items</a>
            <a href="/Crafters">Crafters</a>
            <a href="https://github.com/MatthiasKunnen/icarus-pedia">
                <svg class="text-icon" viewBox="0 0 98 96">
                    <path d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"/>
                </svg>
            </a>
        </nav>
        <button
            class="nav-toggle"
            on:click={() => mobileNavOpen = !mobileNavOpen}
        >
            <svg class="text-icon" viewBox="0 -960 960 960">
                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
            </svg>
        </button>
    </header>
    <div class="root-content" bind:this={rootContent}>
        <slot></slot>
    </div>
    <div
        class="mobile-nav-overlay"
        aria-hidden="true"
        on:click={() => mobileNavOpen = false}></div>
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

    .mobile-nav-overlay {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: none;
        background-color: rgba(0, 0, 0, 0.56);
        cursor: pointer;
    }

    header {
        position: relative;
        z-index: 50;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        background-color: var(--accent-color);
    }

    header .nav-mobile {
        position: absolute;
        bottom: 100%;
        right: 0;
        left: 0;
        display: none;
        flex-direction: column;
        background-color: var(--accent-color);
    }

    header .nav-mobile a {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.2em;
        padding: 0.5em;
        font-size: 1.5rem;
        font-weight: bold;
        border-bottom: 1px solid white;
        text-align: center;
    }

    .nav-desktop {
        display: flex;
        gap: 4px;
    }

    .nav-desktop a {
        border-radius: 4px;
    }

    header nav a {
        display: flex;
        align-items: center;
        padding: 0.25em 1em;
        font-size: 1.5em;
        font-weight: bold;
        transition: background-color linear 150ms;
    }

    header nav a:hover {
        background-color: rgb(255 255 255 / 22%);
    }

    .nav-toggle {
        font-size: 2em;
        padding: 0 0.3em;
        display: none;
    }

    @media (max-width: 599px) {

        .body {
            flex-direction: column-reverse;
        }

        .nav-toggle {
            display: block;
        }

        .body.mobileNavOpen .mobile-nav-overlay {
            display: block;
        }

        .body.mobileNavOpen .nav-mobile {
            display: flex;
        }

        .nav-desktop {
            display: none;
        }
    }
</style>
