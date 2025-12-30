<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  let rewindReportDownloaded = $state(false);

  onMount(() => {});
</script>

<div class="p-4">
  <h2
    class="text-[1.65rem] leading-8 text-center mt-4 font-semibold text-gray-800 dark:text-gray-100"
  >
    That's the end<br />of this year's
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
    class="flex flex-col gap-3 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-8 w-5/6 mx-auto"
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
      if (!$lightRewindReport.jellyfinRewindReport.rawData) {
        showIncompleteReportOverlay();
      } else {
        downloadRewindReportData($lightRewindReport.jellyfinRewindReport);
        rewindReportDownloaded = true;
      }
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
    class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 text-gray-400 mt-3 w-5/6 mx-auto"
  >
    <p class="">
      and <span class="font-bold text-orange-600"
      >store it until next year</span> because it might help to show you even
      more insights next time around!
    </p>
    <p class="">
      Oh and I'd love to hear your feedback on <a
        class="text-[#00A4DC] hover:text-[#0085B2]"
        href="https://github.com/Chaphasilor/jellyfin-rewind/issues"
        target="_blank"
        on:click|stopPropagation={() => {}}
      >GitHub</a>
      or
      <a
        class="text-[#00A4DC] hover:text-[#0085B2]"
        href="https://reddit.com/u/Chaphasilor"
        target="_blank"
        on:click|stopPropagation={() => {}}
      >Reddit</a>!<br />Feel free to let me know your suggestions or report bugs
      :)
    </p>
    <p class="relative">
      Thanks for using Jellyfin Rewind. See you next year &lt;3 <span
        class="absolute italic right-0 bottom-0"
      >- Chaphasilor</span>
    </p>
  </div>

  <!-- svelte-ignore event_directive_deprecated -->
  <button
    class="px-4 py-2 rounded-xl text-base leading-6 border-2 border-[#00A4DC] hover:bg-[#0085B2] text-gray-800 dark:text-gray-200 hover:text-white font-semibold mt-12 flex flex-row gap-2 items-center mx-auto"
    on:click|stopPropagation={() => {
      const closeJellyfinRewind = () => {
        closeOverlay(`overlay-download-report-prompt`);
        // state.currentFeature = 0;#
        closeFeatures();
      };
      if (!rewindReportDownloaded) {
        //TODO
        // showOverlay({
        //   title: `Are you sure?`,
        //   key: `download-report-prompt`,
        //   content: html`
        //     <div
        //       class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-200 mt-10 w-5/6 mx-auto"
        //     >
        //       <p class="">You haven't downloaded your Rewind report yet.</p>
        //       <p class="">
        //         Without this data, you might be missing out on some insights
        //         next year, as well as improved quality of the statistics.
        //       </p>
        //       <p class="">
        //         If possible, please save the Rewind report somewhere safe until
        //         next year, just in case. It's only a few (hundred) MBs in size.
        //       </p>
        //     </div>
        //     <button
        //       class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-12 flex flex-row gap-4 items-center mx-auto"
        //       on:click|stopPropagation={() => {n}(e) => {
        //         if (!$lightRewindReport.jellyfinRewindReport.rawData) {
        //           showIncompleteReportOverlay(closeJellyfinRewind);
        //         } else {
        //           window.downloadRewindReportData($lightRewindReport.jellyfinRewindReport);
        //           state.rewindReportDownloaded = true;
        //         }
        //       })}"
        //     >
        //       <span>Download Report</span>
        //       <svg
        //         xmlns="http://www.w3.org/2000/svg"
        //         class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-download"
        //         width="24"
        //         height="24"
        //         viewBox="0 0 24 24"
        //         stroke="currentColor"
        //         fill="none"
        //         stroke-linecap="round"
        //         stroke-linejoin="round"
        //       >
        //         <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        //         <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
        //         <polyline points="7 11 12 16 17 11"></polyline>
        //         <line x1="12" y1="4" x2="12" y2="16"></line>
        //       </svg>
        //     </button>
        //     <button
        //       class="px-4 py-2 rounded-xl text-[1.2rem] bg-orange-300 hover:bg-orange-400 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-regular mt-12 flex flex-row gap-4 items-center mx-auto"
        //       on:click|stopPropagation={() => {(}) => {
        //         closeJellyfinRewind();
        //       })}"
        //     >
        //       <span>Skip and close</span>
        //     </button>
        //   `,
        // });
      } else {
        closeJellyfinRewind();
      }
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
  </button>
</div>
