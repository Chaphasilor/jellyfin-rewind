<script lang="ts">
  import { onMount } from "svelte";
  import Loading from "$lib/components/Loading.svelte";
  import { goto } from "$app/navigation";
  import {
    downloadingProgress,
    generatingProgress,
    processingListensProgress,
    processingProgress,
    processingResult,
    rewindReport,
  } from "$lib/globals";
  import processing from "$lib/jellyfin/queries/local/processing";
  import { processingResultToRewindReport } from "$lib/utility/convert";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import jellyfin from "$lib/jellyfin";
    import type { JellyfinResponse_SystemInfoPublic } from "$lib/types";

  let error: string | undefined = $state(undefined);

  let serverInfo: JellyfinResponse_SystemInfoPublic | null = $state(null);

  const { current: downloadingCurrent, max: downloadingMax } =
    downloadingProgress;

  onMount(() => {
    console.log(`loading jellyfin:`, jellyfin);
    if (!jellyfin.baseurl || !jellyfin.user || !jellyfin.userId) {
      goto("/welcome");
      return;
    }
    
    console.log(`processing`);
    processing().then(async (result) => {
      if (result.success) {
        processingResult.set(result.data);
        const conversionResult = await processingResultToRewindReport(
          $processingResult,
        );
        if (conversionResult.success) {
          rewindReport.set(conversionResult.data);
          console.log(`$rewindReport:`, $rewindReport);
        }
        goto("/launch");
      } else {
        console.error("Failed to process", result.reason);
        error = result.reason;
      }
    });

    // give the user some feedback after waiting for a bit
    setTimeout(() => {
      jellyfin.pingServer().then((info) => {
        if (info.success) {
          serverInfo = info.data;
          console.log(`serverInfo:`, serverInfo);
        }
      });
    }, 12*1000)
    
  });
</script>

<div
  class="p-6 text-center flex flex-col justify-center items-center w-full h-screen gap-16"
>
  <JellyfinRewindLogo />

  <div>
    <Loading progress={downloadingProgress} />

    <Loading progress={processingProgress} />

    <Loading progress={processingListensProgress} />

    <Loading progress={generatingProgress} />

    {#if $downloadingCurrent < $downloadingMax && serverInfo?.Version?.includes?.("10.11.") && Number(serverInfo?.Version?.split(".").at(-1)) < 6}
    <div class="info flex flex-col gap-2 text-sm text-balance">
      <span>You're using Jellyfin {serverInfo.Version}</span>
      <span>Depending on your library size, loading the data may take several <b class="font-bold text-orange-500!">minutes</b>, due to degraded music library performance in this version.</span>
      <b class="font-bold text-orange-500! text-lg">Please be patient!</b> 
      <span>As long as no error is shown, progress <b class="font-bold text-orange-500!">is</b> being made.</span> 
    </div>
    {/if}
    
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
