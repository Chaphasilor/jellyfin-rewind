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

  processing().then(async (result) => {
    if (result.success) {
      processingResult.set(result.data);
      const conversionResult = await processingResultToRewindReport(
        $processingResult,
      );
      if (conversionResult.success) {
        lightRewindReport.set(conversionResult.data);
        console.log(`$lightRewindReport:`, $lightRewindReport);
      }
      goto("/rewind");
    } else {
      console.error("Failed to process", result.reason);
      goto("/welcome");
    }
  });
</script>

<Loading {...$downloadingProgress} title="Downloading Data" />

<Loading {...$processingProgress} title="Cleaning up Data" />

<Loading {...$generatingProgress} title="Generating Rewind, just for you!" />
