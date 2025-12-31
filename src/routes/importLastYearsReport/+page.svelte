<script lang="ts">
  import { goto } from "$app/navigation";
  import Header from "$lib/components/Header.svelte";
  import { oldReport } from "$lib/globals";
  import { importRewindReport } from "$lib/utility/oldReportDelta";
  import Jellyfin from "$lib/jellyfin/index";

  let importingLastYearsReport = $state(false);
</script>

<div class="p-4">
  <Header />

  <div
    class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center"
  >
    <p class="">
      You can now import last year's Jellyfin Rewind report, if you have one.
    </p>
    <p class="">
      This will give you more, and more reliable, statistics about your
      listening activity.
    </p>
  </div>

  <div class="w-full flex flex-col items-center text-center mt-12">
    {#if !$oldReport}
      <label
        for="import-file"
        class="down px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto"
        class:saturate-50={importingLastYearsReport}
      >Import Last Year's Report</label>
      <!-- svelte-ignore event_directive_deprecated -->
      <input
        type="file"
        id="import-file"
        class="hidden"
        accept=".json"
        on:change={async (e) => {
          console.info(`Importing file...`);
          const input = e.target;
          if (!input) {
            console.error(`No input element found.`);
            return;
          }
          try {
            importingLastYearsReport = true;
            //@ts-ignore
            input.disabled = true;
            //@ts-ignore
            oldReport.set(await importRewindReport(e.target.files[0]));
            console.log(`$oldReport:`, $oldReport);
            goto("loading");
            // const featureDelta = await getFeatureDelta(oldReport, state.rewindReport)
            // console.log(`featureDelta:`, featureDelta)
          } catch (err) {
            console.error(`Error while importing rewind report:`, err);
          }
          //@ts-ignore
          input.disabled = false;
          importingLastYearsReport = false;
        }}
      />

      {#if importingLastYearsReport}
        <p
          class="mt-8 px-10 text-xl text-balance font-semibold text-gray-600 dark:text-gray-300"
        >
          Importing, please wait a few seconds...
        </p>
      {:else}
        <button
          class="fwd px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-700 dark:text-gray-200 mt-8 flex flex-row gap-4 items-center mx-auto hover:text-white"
          on:click={() => goto("/loading")}
        >
          <span>Continue without last year's report</span>
        </button>

        <button
          class="up px-2 py-1 rounded-lg text-sm border-gray-500 border-2 hover:bg-gray-600 dark:border-gray-400 dark:hover:bg-gray-300 font-medium text-gray-700 dark:text-gray-200 mt-20 flex flex-row gap-4 items-center mx-auto hover:text-white"
          on:click={() => goto("/importOfflinePlayback")}
        >
          <span>Using Finamp's beta? Import offline playback now!</span>
        </button>
      {/if}
    {:else}
      <button
        class="fwd px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto"
        on:click={() => goto("/loading")}
      >
        <span>Generate Rewind Report!</span>
      </button>
    {/if}
  </div>

  <!--TODO ${() => buttonLogOut} -->
</div>


<style>
    button.up {
        cursor: n-resize;
    }
    label.down {
        cursor: s-resize;
    }
    button.fwd {
        cursor: e-resize;
    }
</style>
