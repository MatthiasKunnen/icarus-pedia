<script lang="ts">
export let counter: number = 0;
export let icon: string;
export let alt: string;
export let size: '64' | '128';

export let showCaption: boolean = true;
</script>

<figure>
    <div class="picture-container">
        <picture>
            <source srcset="/gameicons/{icon}_{size}x{size}.jxl" type="image/jxl"/>
            <source srcset="/gameicons/{icon}_{size}x{size}.avif" type="image/avif"/>
            <source srcset="/gameicons/{icon}_{size}x{size}.webp" type="image/webp"/>
            <img
                src="/gameicons/{icon}_{size}x{size}.png"
                width="1"
                height="1"
                alt="{alt}'s icon"
                loading="lazy"
            />
        </picture>
        {#if counter > 1}
            <span class="counter">{counter}</span>
        {/if}
    </div>
    {#if showCaption}
        <figcaption>{alt}</figcaption>
    {/if}
</figure>

<style>
    .picture-container {
        position: relative;
        padding: 6px 12px 0;
    }

    picture {
        display: inline-block;
        width: var(--game-icon-width)
    }

    img {
        width: 100%;
        height: auto;
    }

    figure {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
    }

    .counter {
        position: absolute;
        top: 0;
        right: 0;
        padding: 0 4px;
        background-color: #a5d740;
        color: black;
        border-radius: 0.2em;
    }
</style>
