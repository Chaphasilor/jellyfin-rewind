<script lang="ts">
  import Chart from "chart.js/auto";
  import {
    isAccuracyDisclaimerOpen,
    rewindReport,
    year,
  } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import jellyfin from "$lib/jellyfin";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    onNextFeature,
  }: FeatureProps = $props();

  export function onEnter() {}
  export function onExit() {}

  onMount(() => {});
</script>

<div class="p-4">
  <div class="mt-6 w-full flex flex-col items-center mb-8">
    <JellyfinRewindLogo />
  </div>

  <div
    class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-400 mt-4 w-full mx-auto text-balance text-center"
  >
    <p>
      The data in your Jellyfin Rewind Report is sourced from Jellyfin directly,
      because you either don't have the Playback Reporting plugin installed, or
      it hasn't been installed for most of the year.
    </p>
    <p>
      This means that the data displayed in this report may not be as accurate
      or comprehensive as it could be. Jellyfin doesn't remember <i>when</i> you
      played something, only when you <i>last</i> played it. That means it's not
      possible to properly limit playback data to just {year}.
    </p>
    <p>
      For next year, you should definitely install the Playback Reporting plugin
      for Jellyfin, and set its data retention duration to at least 2 years, or
      to forever.<br />
      If the plugin wasn't set up correctly yet, you should've seen a prompt
      during login already :)
    </p>
  </div>
  <!-- svelte-ignore event_directive_deprecated -->
  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-8 flex flex-row gap-4 items-center mx-auto"
    on:click|stopPropagation={() => onNextFeature()}
  >
    Understood, continue!
  </button>
</div>
