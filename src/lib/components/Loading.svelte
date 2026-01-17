<script lang="ts">
  import type { Progress } from "$lib/utility/Progress";

  let { progress }: { progress: Progress } = $props();
  let { current, max, name } = $derived(progress);

  let visible = $derived($max != 0);
  let finished = $derived($current == $max);
  let percent = $derived($current / $max * 100);
</script>

<div>
  <div>
    {#if visible && finished}
      <h5 class="text-lg font-semibold opacity-75">{name}...</h5>
    {:else if visible && !finished}
      <div class="progress">
        <h4 class="text-2xl font-bold">{name}...</h4>
        <p class="mt-4 font-mono">{$current} / {$max}</p>
        <div class="barbg">
          <div class="percent">
            {Math.round(percent)}%
          </div>
          <div
            class="barfg"
            style={`width: ${percent}%; transition: width 0.3s ease;`}
          >
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
