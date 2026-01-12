<script lang="ts">
    let {
        format = 'short',
        seconds,
    }: {
        format?: 'short' | 'long',
        seconds: number;
    } = $props();

    function secondsToHuman(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const formattedTimeParts: string[] = [];

        if (format === 'short' && hours > 0) {
            formattedTimeParts.push(`${hours}h`);
        } else if (hours > 1) {
            formattedTimeParts.push(`${hours} hours`);
        } else if (hours === 1) {
            formattedTimeParts.push(`1 hour`);
        }

        if (format === 'short' && minutes > 0) {
            formattedTimeParts.push(`${minutes}m`);
        } else if (minutes > 1) {
            formattedTimeParts.push(`${minutes} minutes`);
        } else if (minutes === 1) {
            formattedTimeParts.push(`1 minute`);
        }

        if (format === 'short' && remainingSeconds > 0) {
            formattedTimeParts.push(`${remainingSeconds}s`);
        } else if (remainingSeconds > 1) {
            formattedTimeParts.push(`${remainingSeconds} seconds`);
        } else if (remainingSeconds === 1) {
            formattedTimeParts.push(`1 second`);
        }

        return formattedTimeParts.join(' ');
    }

    let time = $derived(secondsToHuman(seconds));
    let showSeconds = $derived(seconds > 60);
</script>

{time}
{#if showSeconds && format === 'long'}({seconds} seconds){/if}
