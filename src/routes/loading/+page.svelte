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

  let error: string | undefined = $state(undefined);

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
      error = result.reason
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

  {#if error}
    <div class="warning mb-4">
      <div
        class="flex flex-col items-start gap-1 text-base font-medium leading-6 text-red-100 w-5/6 mx-auto"
      >
        <p class="">An error occurred!</p>
        <p class="font-mono mx-auto">{error.toString()}</p>
        <!-- svelte-ignore event_directive_deprecated -->
      </div>
    </div>
  {/if}
</div>
