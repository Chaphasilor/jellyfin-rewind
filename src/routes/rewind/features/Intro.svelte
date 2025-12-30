<script lang="ts">
  import Chart from "chart.js/auto";
  import {
    isAccuracyDisclaimerOpen,
    lightRewindReport,
  } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    onNextFeature,
  }: FeatureProps = $props();

  export function onEnter() {
  }
  export function onExit() {
  }

  onMount(() => {});
</script>

<div class="p-4">
  <div class="mt-6 w-full flex flex-col items-center mb-16">
    <JellyfinRewindLogo />
  </div>

  <h2
    class="text-[1.65rem] leading-8 text-center mt-16 font-semibold text-gray-800 dark:text-gray-200"
  >
    Welcome to<br />Jellyfin Rewind {
      $lightRewindReport.jellyfinRewindReport?.year
    }!
  </h2>

  <div
    class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center"
  >
    <p class="">
      This is your personal overview over your listening habits of the past
      year. See your most-listened tracks, artists and albums, as well as other
      awesome stats!
    </p>

    <p class="">
      <!-- svelte-ignore event_directive_deprecated -->
      If you have any questions or feedback, please reach out to me on
      <a
        class="text-[#00A4DC] hover:text-[#0085B2]"
        href="https://github.com/Chaphasilor/jellyfin-rewind/issues"
        target="_blank"
        on:click|stopPropagation={() => {}}
      >GitHub</a>
      or
      <!-- svelte-ignore event_directive_deprecated -->
      <a
        class="text-[#00A4DC] hover:text-[#0085B2]"
        href="https://reddit.com/u/Chaphasilor"
        target="_blank"
        on:click|stopPropagation={() => {}}
      >Reddit</a>.
    </p>
  </div>

  <div>
    <!-- svelte-ignore event_directive_deprecated -->
    <button
      class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-600 dark:text-gray-300 mt-4 flex flex-row gap-4 items-center mx-auto"
      on:click|stopPropagation={() => isAccuracyDisclaimerOpen.set(true)}
    >
      Accuracy Disclaimer
    </button>
  </div>

  <!-- svelte-ignore event_directive_deprecated -->
  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-8 flex flex-row gap-4 items-center mx-auto"
    on:click|stopPropagation={() => {
      console.info("button");
      onNextFeature();
    }}
  >
    <span>Let's Go!</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-arrow-big-right"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path
        d="M4 9h8v-3.586a1 1 0 0 1 1.707 -.707l6.586 6.586a1 1 0 0 1 0 1.414l-6.586 6.586a1 1 0 0 1 -1.707 -.707v-3.586h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z"
      >
      </path>
    </svg>
  </button>
</div>
