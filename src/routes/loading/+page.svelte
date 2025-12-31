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
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";

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
      goto("/launch");
    } else {
      console.error("Failed to process", result.reason);
      // TODO make this error screenshottable, on the error page
      goto("/welcome");
    }
  });
</script>

<div
  class="p-6 text-center flex flex-col justify-center items-center w-full h-screen gap-16"
>
  <JellyfinRewindLogo />

  <div>
    <Loading {...$downloadingProgress} title="Fetching..." />

    <Loading {...$processingProgress} title="Processing Data..." />

    <Loading
      {...$generatingProgress}
      title="Generating Your Rewind Report..."
    />
  </div>
</div>
