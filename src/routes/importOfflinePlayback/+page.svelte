<script lang="ts">
  import { goto } from "$app/navigation";
  import Header from "$lib/components/Header.svelte";
  import { oldReport } from "$lib/globals";
  import { importRewindReport } from "$lib/utility/oldReportDelta";
  import Jellyfin from "$lib/jellyfin/index";
  import { importOfflinePlayback } from "$lib/utility/offlineImport";
  import { uploadOfflinePlaybackBatched } from "$lib/jellyfin/queries/api/playbackReporting";
    import Modal from "$lib/components/Modal.svelte";

  let importingOfflinePlayback = $state(false);
  let finampOfflineExportDialogOpen = $state(false);
  let offlinePlayback;
</script>

<div class="p-4">
  <Header />

  <div
    class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-4 w-full mx-auto text-balance text-center"
  >
    <p class="">
      Are you using Finamp's beta version to listen to music?
    </p>
    <p class="">
      Finamp keeps track of your playback history even when you're not connected
      to your server, and you can now import that history!
    </p>
    <p class="">
      Imported plays will only be added to the Playback Reporting addon's
      database, but can then used to generate a more accurate Rewind report for
      you in the following steps.
    </p>
    <p class="text-orange-500">Make sure to only import this once!</p>
  </div>

  <button
    class="px-2 py-1 rounded-lg text-sm border-gray-500 border-2 hover:bg-gray-600 dark:border-gray-400 dark:hover:bg-gray-300 font-medium text-gray-700 dark:text-gray-200 mt-4 flex flex-row gap-4 items-center mx-auto hover:text-white"
    on:click={() => (finampOfflineExportDialogOpen = true)}
  >
    <span>How can I import my offline plays?</span>
  </button>

  <div class="w-full flex flex-col items-center text-center mt-12">
    <label
      for="import-file"
      class="
        ${() =>
        `px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto ${importingOfflinePlayback ? `saturation-50` : ``}`}
      "
    >Import Offline Playback History</label>
    <!-- svelte-ignore event_directive_deprecated -->
    <input
      type="file"
      id="import-file"
      class="hidden"
      accept=".txt,.json,.jsonl"
      on:change={async (e) => {
        console.info(`Importing offline playback...`);
        const input = e.target;
        if (!input) {
          console.error(`No input element found.`);
          return;
        }
        try {
          importingOfflinePlayback = true;
          //@ts-ignore
          input.disabled = true;
          offlinePlayback = await importOfflinePlayback(
            //@ts-ignore
            e.target.files[0],
          );
          if (!offlinePlayback) {
            console.error(`No offline playback data found after import.`);
            return;
          }
          console.log(`offlinePlayback:`, offlinePlayback);
          console.log(
            `missing playDurations:`,
            offlinePlayback.filter((x) => !x.PlayDuration),
          );

          // import plays to server
          await uploadOfflinePlaybackBatched(offlinePlayback);

          goto("loading");
        } catch (err) {
          console.error(
            `Error while importing offline playback data:`,
            err,
          );
        }
        //@ts-ignore
        input.disabled = false;
        importingOfflinePlayback = false;
      }}
    />

    {#if importingOfflinePlayback}
      <p
        class="mt-8 px-10 text-xl text-balance font-semibold text-gray-600 dark:text-gray-300"
      >
        Importing, please wait a few seconds...
      </p>
    {:else}
      <p
        class="mt-4 px-10 text-balance font-semibold text-gray-600 dark:text-gray-300"
      >
        Already imported your offline plays or don't have any?
      </p>
      <button
        class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-700 dark:text-gray-200 mt-2 flex flex-row gap-4 items-center mx-auto hover:text-white"
        on:click={() => goto("loading")}
      >
        <span>Continue without importing</span>
      </button>
    {/if}
  </div>

  <!--TODO ${() => buttonLogOut} -->
</div>


<Modal open={finampOfflineExportDialogOpen}>
    <h1>Important Offline Listens from Finamp Beta</h1>
    <p>Its really easy!</p>
    <ol type="1">
        <li>Open Finamp</li>
        <li>Expand Sidebar</li>
        <li>Click on "Playback History"</li>
        <li>Save History via the share button on the top right</li>
        <li>Import it here!</li>
    </ol>
    <button on:click={() => finampOfflineExportDialogOpen = false}>Okay!</button>
</Modal>
