<script lang="ts">
  import Chart from "chart.js/auto";
  import { rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  export function onEnter() {
  }
  export function onExit() {
  }

  onMount(() => {});
</script>

<div class="text-center">
  <h2 class="text-2xl font-medium mt-5">Your Library & You</h2>

  <div class="mt-12 w-full px-6 flex flex-col items-center gap-2">
    <div class="font-semibold text-xl">
      Listening to your entire library would take <span
        class="font-semibold text-3xl text-sky-500 font-quicksand"
      >{
        showAsNumber(
          (
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.totalRuntime /
            60.0 /
            60.0
          ).toFixed(0),
        )
      }</span> hours.
    </div>
    <div class="font-semibold text-xl">
      That's <span class="font-semibold text-3xl text-sky-500 font-quicksand">{
        showAsNumber(
          (
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.totalRuntime /
            60.0 /
            60.0 /
            24.0
          ).toFixed(1),
        )
      }</span> days!
    </div>
  </div>

  <div class="mt-16 w-full px-10 flex flex-col items-center gap-3">
    <div>
      <span class="font-semibold text-xl"><span
          class="text-3xl text-sky-500 font-quicksand"
        >{
          showAsNumber(
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.tracks?.favorite,
          )
        }</span> favorite tracks.</span>
    </div>
    <div>
      <span class="font-semibold text-xl"><span
          class="text-3xl text-sky-500 font-quicksand"
        >{
          showAsNumber(
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.tracks?.total,
          )
        }</span> unique tracks.</span>
    </div>
    <div>
      <span class="font-semibold text-xl"><span
          class="text-3xl text-sky-500 font-quicksand"
        >{
          showAsNumber(
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.albums?.total,
          )
        }</span> albums.</span>
    </div>
    <div>
      <span class="font-semibold text-xl"><span
          class="text-3xl text-sky-500 font-quicksand"
        >{
          showAsNumber(
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.artists?.total,
          )
        }</span> artists.</span>
    </div>
    <div><span class="font-semibold text-xl mt-4">Impressive.</span></div>
  </div>

  <div class="mt-16 w-full px-10 flex flex-col items-center gap-2">
    <div>
      <span class="font-semibold text-xl"
      >Average track length: <span
          class="text-2xl text-sky-500 font-quicksand"
        >{
          showAsNumber(
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.trackLength?.mean
              .toFixed(0),
          )
        }</span> seconds.</span>
    </div>
    <div>
      <span class="font-semibold -mt-1"
      >(Median: <span class="text-sky-500 font-quicksand">{
          showAsNumber(
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.trackLength?.median
              .toFixed(0),
          )
        }</span>)</span>
    </div>
    <div>
      <span class="font-semibold text-xl"
      >Shortest: <span class="text-2xl text-sky-500 font-quicksand">{
          showAsNumber(
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.trackLength?.min
              .toFixed(0),
          )
        }</span> seconds.</span>
    </div>
    <div>
      <span class="font-semibold text-xl"
      >Longest: <span class="text-2xl text-sky-500 font-quicksand">{
          showAsNumber(
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.trackLength?.max
              .toFixed(0),
          )
        }</span> seconds.</span>
    </div>
    <div><span class="font-semibold text-xl mt-4">Surprised?</span></div>
  </div>
</div>
