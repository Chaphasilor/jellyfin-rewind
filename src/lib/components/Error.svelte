<script lang="ts">
    export let error: string | undefined = undefined;
</script>

{#if error}
    <div class="warning">
        <h3>An error occurred</h3> {error}
    </div>
{/if}
