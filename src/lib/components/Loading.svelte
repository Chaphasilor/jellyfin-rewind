<script lang="ts">
  import type { Progress } from "$lib/utility/Progress";

  export let progress: Progress;
  let { current, max, name } = progress;
</script>

<div>
  <div>
    {#if $max != 0 && $current == $max}
      <h5 class="text-lg font-semibold opacity-75">{name}...</h5>
    {/if}
    {#if $max != 0 && $current != $max}
      <div class="progress">
        <h4 class="text-2xl font-bold">{name}...</h4>
        <p class="mt-4 font-mono">{$current} / {$max}</p>
        <!-- <p class="h-12">
          {#if detail != ""}
            {detail}
          {/if}
        </p> -->
        <div class="barbg">
          <div class="percent">
            {Math.round(($current / $max) * 100)}%
          </div>
          <div
            class="barfg"
            style={`width: ${
              ($current / $max) * 100
            }%; transition: width 0.3s ease;`}
          >
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
