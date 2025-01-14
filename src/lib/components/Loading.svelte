<script lang="ts">
    import processing from "$lib/jellyfin/queries/local/processing";

    export let title: string
    export let detail: string = ""
    export let max: number
    export let cur: number

    processing();

</script>


{#if max != 0 && cur == max}
    <h5>{title}</h5>
{/if}
{#if max != 0 && cur != max}
    <div class="progress">
        <h4>{title}</h4>
        <p>{cur} / {max}</p>
        {#if detail != ""}
            <p>{detail}</p>
        {/if}
        <div class="barbg">
            <div class="percent">
                {Math.round(cur/max*100)}%
            </div>
            <div class="barfg" style="width: {cur/max*100}%"></div>
        </div>
    </div>
{/if}

<style>
    h5 {
        font-style: italic;
        opacity: 0.8;
    }
</style>