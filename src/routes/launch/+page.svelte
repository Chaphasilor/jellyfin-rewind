<script lang="ts">
  import Loading from "$lib/components/Loading.svelte";
  import { goto } from "$app/navigation";
  import {
    downloadingProgress,
    generatingProgress,
    lightRewindReport,
    processingProgress,
    processingResult,
  } from "$lib/globals";
  import processing from "$lib/jellyfin/queries/local/processing";
  import { processingResultToRewindReport } from "$lib/utility/convert";
</script>

<button
  on:click={() => {
    document.documentElement.requestFullscreen();
    goto("/rewind");
  }}
>
  Launch Jellyfin Rewind
</button>
