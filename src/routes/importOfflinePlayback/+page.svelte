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
        >by clicking the <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="icon icon-tabler icons-tabler-outline icon-tabler-share"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <path d="M8.7 10.7l6.6 -3.4" />
            <path d="M8.7 13.3l6.6 3.4" />
          </svg>icon, then</span>
      </div>

      <label
        for="import-file"
        class={`px-4 py-3 rounded-xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-col gap-1 items-center mx-auto ${
          importingOfflinePlayback ? `saturation-50` : ``
        }`}
      >
        <span>Import Offline Playback History</span>
        <span class="font-bold text-[1.1rem] text-orange-800"
        >Only import once per Finamp install!</span>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 stroke-[2.5] icon icon-tabler icon-tabler-logout"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path
            d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"
          >
          </path>
          <path d="M7 12h14l-3 -3m0 6l3 -3"></path>
        </svg>
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
<!-- 
<Modal open={finampOfflineExportDialogOpen}>
  <h1>Important Offline Listens from Finamp Beta</h1>
  <p>Its really easy!</p>
  <ol type="1">
    <li>
      Click <a href="finamp://internal/playbackhistory"
      >this link to open Finamp on this device</a>, or follow steps 1-3
    </li>
    <li>Open Finamp</li>
    <li>Expand Sidebar</li>
    <li>Click on "Playback History"</li>
    <li>Save History via the share button on the top right</li>
    <li>Import it here!</li>
  </ol>
  <button on:click={() => (finampOfflineExportDialogOpen = false)}>
    Okay!
  </button>
</Modal> -->
