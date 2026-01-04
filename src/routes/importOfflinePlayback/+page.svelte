<script lang="ts">
  import { goto } from "$app/navigation";
  import Header from "$lib/components/Header.svelte";
  import { oldReport } from "$lib/globals";
  import { importRewindReport } from "$lib/utility/oldReportDelta";
  import Jellyfin from "$lib/jellyfin/index";
  import { importOfflinePlayback } from "$lib/utility/offlineImport";
  import { uploadOfflinePlaybackBatched } from "$lib/jellyfin/queries/api/playbackReporting";
  import Modal from "$lib/components/Modal.svelte";
  import jellyfin from "$lib/jellyfin/index";
    import ShareIcon from "$lib/components/icons/ShareIcon.svelte";
    import LogoutOrInIcon from "$lib/components/icons/LogoutOrInIcon.svelte";

  let importingOfflinePlayback = $state(false);
  // let finampOfflineExportDialogOpen = $state(false);
  let offlinePlayback;
</script>

<div class="p-4">
  <Header />

  <div
    class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-400 mt-4 w-full mx-auto text-balance text-center"
  >
    <p class="">Are you using Finamp's beta version to listen to music?</p>
    <p class="">
      Finamp keeps track of your playback history even when you're not connected
      to your server, and you can now import that history!
    </p>
    <p class="">
      Imported plays will only be added to the Playback Reporting addon's
      database, but can then used to generate a more accurate Rewind report for
      you in the following steps.
    </p>
  </div>
  <!-- 
  <button
    class="px-2 py-1 rounded-lg text-sm border-2 border-gray-400 hover:bg-gray-300 font-medium text-gray-200 mt-4 flex flex-row gap-4 items-center mx-auto hover:text-white"
    on:click={() => (finampOfflineExportDialogOpen = true)}
  >
    <span>How can I import my offline plays?</span>
  </button> -->

  {#if jellyfin.user?.isAdmin}
    <div class="w-full flex flex-col gap-4 items-center text-center mt-8">
      <a
        class="px-3 py-3 rounded-lg text-md border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-200 mt-2 flex flex-row gap-2 items-center mx-auto hover:text-white"
        href="finamp://internal/playbackhistory"
      >
        <img class="size-8" src="/media/finamp_cropped.svg" alt="Finamp Logo" />
        <span>Open Finamp's Playback History</span>
      </a>
      <div class="flex flex-col gap-0.5">
        <span>Export & save Offline Plays</span><span
          class="flex flex-row gap-1.5"
        >by clicking the <ShareIcon />icon, then</span>
      </div>

      <label
        for="import-file"
        class={`px-4 py-3 rounded-xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-col gap-1 items-center mx-auto ${
          importingOfflinePlayback ? `saturation-50` : ``
        }`}
      >
        <span>Import Offline Playback History</span>
        <span class="font-bold text-[1.1rem] text-orange-800">
            Only import once per Finamp install!
        </span>
      </label>
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

            goto("/importLastYearsReport");
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
        <p class="mt-8 px-10 text-xl text-balance font-semibold text-gray-300">
          Importing, please wait a few seconds...
        </p>
      {:else}
        <div>
          <!-- <p class="mt-4 px-10 text-balance font-semibold text-gray-300">
          Already imported your offline plays or don't have any?
        </p> -->
          <button
            class="px-2 py-1 rounded-lg mt-4 text-sm border-gray-400 hover:bg-gray-300 border-2 hover:bg-[#0085B2] font-medium text-gray-200 flex flex-row gap-4 items-center mx-auto hover:text-white"
            on:click={() => goto("/importLastYearsReport")}
          >
            <span>Continue without importing</span>
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div>
      <p
        class="flex flex-col gap-4 text-lg font-medium leading-6 text-orange-400 mt-12 w-full mx-auto text-balance text-center"
      >
        Importing offline playback is only available when logged in with
        administrator access. Please log in with an admin account in addition to
        your current account to import playback data.
      </p>
      <!-- svelte-ignore event_directive_deprecated -->
      <button
        class="px-4 py-2 rounded-xl border-2 border-red-400 hover:bg-red-500 dark:border-red-600 dark:hover:bg-red-700 font-medium mt-6 flex flex-row gap-3 items-center mx-auto text-red-500 hover:text-white"
        on:click={async () => {
          // await jellyfin.terminateSession();
          goto("/adminLogin");
          //TODO await deleteRewind()
        }}
      >
        <span>Log In As Admin</span>
        <LogoutOrInIcon />
      </button>
      <button
        class="px-2 py-1 rounded-lg mt-4 text-sm border-gray-400 hover:bg-gray-300 border-2 hover:bg-[#0085B2] font-medium text-gray-200 flex flex-row gap-4 items-center mx-auto hover:text-white"
        on:click={() => goto("/importLastYearsReport")}
      >
        <span>Continue without importing</span>
      </button>
    </div>
  {/if}
</div>
