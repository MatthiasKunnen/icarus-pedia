<script lang="ts">
    export let seconds: number;

    function secondsToHuman(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const formattedTimeParts: string[] = [];

        if (hours > 1) {
            formattedTimeParts.push(`${hours} hours`);
        } else if (hours === 1) {
            formattedTimeParts.push(`1 hour`);
        }

        if (minutes > 1) {
            formattedTimeParts.push(`${minutes} minutes`);
        } else if (minutes === 1) {
            formattedTimeParts.push(`1 minute`);
        }

        if (remainingSeconds > 1) {
            formattedTimeParts.push(`${remainingSeconds} seconds`);
        } else if (remainingSeconds === 1) {
            formattedTimeParts.push(`1 second`);
        }

        return formattedTimeParts.join(' ');
    }

    $: time = secondsToHuman(seconds);
    $: showSeconds = seconds > 60;
</script>

{time}
{#if showSeconds}({seconds} seconds){/if}
