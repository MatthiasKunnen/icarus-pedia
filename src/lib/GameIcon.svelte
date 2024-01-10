<script lang="ts">
export let icon: string;
export let alt: string;
export let size: '64' | '128';

export let showCaption: boolean = true;
</script>

<figure>
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
    {#if showCaption}
        <figcaption>{alt}</figcaption>
    {/if}
</figure>

<style>
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
</style>
