<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport, year } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { writable } from "svelte/store";
  import { goto } from "$app/navigation";
  import { log } from "$lib/utility/logging";
  import { reset } from "$lib/jellyfin/queries/local/processing/functions";
  import jellyfin from "$lib/jellyfin";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  let rewindReportDownloaded = $state(false);

  function download() {
    const filename =
      `jellyfin-rewind-report-${$lightRewindReport.jellyfinRewindReport.year}_for-${
        jellyfin.user?.name ?? ``
      }_${new Date().toISOString().slice(0, 10)}.json`;
    const data = new Blob([JSON.stringify(
      $lightRewindReport.jellyfinRewindReport,
    )], {
      type: "text/json",
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = window.URL.createObjectURL(data);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(
      ":",
    );
    const evt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(evt);
    link.remove();

    rewindReportDownloaded = true;
  }
  function close(logout: boolean = false) {
    if (logout) {
      jellyfin.terminateSession();
    }
    reset().then(() => {
      goto("/welcome");
    });
  }

  export function onEnter() {
  }
  export function onExit() {
  }

  let closeModalOpen = $state(false);

  onMount(() => {});
</script>

<div class="p-4">
  <h2
    class="text-[1.65rem] leading-8 text-center mt-4 font-semibold text-gray-100"
  >
    That was
  </h2>

  <div class="mt-4 w-full flex flex-col items-center">
    <JellyfinRewindLogo />
    <h3
      class="-rotate-6 ml-4 -mt-2 text-3xl font-quicksand font-medium text-[#00A4DC]"
    >
      Rewind
    </h3>
  </div>

  <div
    class="flex flex-col gap-3 text-lg font-medium leading-6 text-gray-400 mt-8 w-5/6 mx-auto"
  >
    <p class="">
      Thank you so much for checking it out, I hope you had fun and saw some
      interesting stats!
    </p>
    <p class="">Please make sure to</p>
  </div>
  <!-- svelte-ignore event_directive_deprecated -->
  <button
    class="px-6 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-3 flex flex-row gap-4 items-center mx-auto"
    on:click|stopPropagation={() => {
      download();
    }}
  >
    <span class="leading-7">Download Your<br />Rewind Report</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-download"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
      <polyline points="7 11 12 16 17 11"></polyline>
      <line x1="12" y1="4" x2="12" y2="16"></line>
    </svg>
  </button>

  <div
    class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 text-gray-400 mt-3 w-5/6 mx-auto text-center"
  >
    <p class="">
      and <span class="font-bold text-orange-600"
      >store it until next year</span> because it might help to show you even
      more insights next time around!
    </p>
    <p class="">
      We'd love to hear your feedback on <a
        class="text-[#00A4DC] hover:text-[#0085B2]"
        href="https://github.com/Chaphasilor/jellyfin-rewind/issues"
        target="_blank"
        on:click|stopPropagation={() => {}}
      >GitHub</a>!<br />Feel free to leave suggestions or report bugs
      :)
    </p>
    <p>
      See you next year!<br>
      <span class="italic right-0 bottom-0">
        - Chaphasilor, Floschy, 1hitsong, and all other contributors
      </span>
    </p>
  </div>

  <!-- svelte-ignore event_directive_deprecated -->
  <!-- <button
    class="px-4 py-2 rounded-xl text-base leading-6 border-2 border-[#00A4DC] hover:bg-[#0085B2] text-gray-200 hover:text-white font-semibold mt-12 flex flex-row gap-2 items-center mx-auto"
    on:click|stopPropagation={() => {
      closeModalOpen = true;
    }}
  >
    <span>Close Jellyfin Rewind</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-6 h-6 stroke-[2.5] icon icon-tabler icon-tabler-x"
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
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button> -->
</div>

<Modal open={closeModalOpen}>
  <h1>Thanks for checking out the {year} rewind!</h1>
  {#if !rewindReportDownloaded}
    <p>
      You havent yet downloaded the rewind, so you can compare {year} to {
        year + 1
      }
    </p>
    <p>Do you want to close the rewind without saving?</p>
    <button on:click|stopPropagation={() => download()}>
      Stop! I want to the Download Report!
    </button>
  {:else}
    <p>Make sure you have placed the rewind json in the right place.</p>
    <p>If you want you can also download it again</p>
    <button on:click|stopPropagation={() => download()}>
      I want to be sure!
    </button>
  {/if}
  <br>
  <br>
  <br>
  <button on:click={() => closeModalOpen = false}>Dont Close</button>
  <br>
  <br>
  <button on:click={() => close()}>Close</button>
  <button on:click={() => close(true)}>Close & Logout</button>
</Modal>
