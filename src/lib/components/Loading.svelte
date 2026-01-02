<script lang="ts">
  export let title: string;
  export let detail: string = "";
  export let max: number;
  export let cur: number;
</script>

<div>
  <div>
    {#if max != 0 && cur == max}
      <h5 class="text-lg font-semibold opacity-75">{title}</h5>
    {/if}
    {#if max != 0 && cur != max}
      <div class="progress">
        <h4 class="text-2xl font-bold">{title}</h4>
        <p class="mt-4 font-mono">{cur} / {max}</p>
        <!-- <p class="h-12">
          {#if detail != ""}
            {detail}
          {/if}
        </p> -->
        <div class="barbg">
          <div class="percent">
            {Math.round((cur / max) * 100)}%
          </div>
          <div
            class="barfg"
            style={`width: ${
              (cur / max) * 100
            }%; transition: width 0.3s ease;`}
          >
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
