<script lang="ts">
    export let size: 'auto' | 64 | 128;

    $: imgSize = typeof size !== 'number' ? '' : `_${size}x${size}`
</script>

<div class="logo">
    <picture>
        <source srcset="/gameicons/Logos/Icon_Icarus{imgSize}.jxl" type="image/jxl"/>
        <source srcset="/gameicons/Logos/Icon_Icarus{imgSize}.avif" type="image/avif"/>
        <source srcset="/gameicons/Logos/Icon_Icarus{imgSize}.webp" type="image/webp"/>
        <img
            src="/gameicons/Logos/Icon_Icarus{imgSize}.png"
            width="1"
            height="1"
            alt="Logo"
            loading="lazy"
        />
    </picture>
    <span>Pedia</span>
</div>

<style>
    .logo {
        display: flex;
        align-items: center;
    }

    .logo span {
        font-size: 2em;
        font-weight: bold;
    }

    .logo img {
        height: 3.125em;
        width: auto;
    }
</style>
