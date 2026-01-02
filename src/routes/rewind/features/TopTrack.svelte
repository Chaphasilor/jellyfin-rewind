<script lang="ts">
  import Chart from "chart.js/auto";
  import { rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import { loadImage } from "$lib/utility/jellyfin-helper";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
    pausePlayback,
    resumePlayback,
  }: FeatureProps = $props();

  let topTrackPrimaryImage: HTMLImageElement;

  function playTopTrack() {
    const topTrackByDuration = $rewindReport.jellyfinRewindReport
      .tracks?.[rankingMetric][informationSource]?.[0];
    console.log(`topTrackByDuration:`, topTrackByDuration);
    fadeToNextTrack(topTrackByDuration);
  }

  export function onEnter() {
    playTopTrack();
  }
  export function onExit() {}

  onMount(() => {
    console.log(`img:`, topTrackPrimaryImage);
    const topTrackByDuration = $rewindReport.jellyfinRewindReport
      .tracks?.[rankingMetric][informationSource]?.[0];
    console.log(`topTrackByDuration:`, topTrackByDuration);
    loadImage([topTrackPrimaryImage], topTrackByDuration.image, `track`);
  });
</script>

<div class="text-center text-white">
  <h2 class="text-2xl mt-5">
    Your Top Track<br />of {$rewindReport.jellyfinRewindReport?.year}:
  </h2>
  <div class="flex mt-10 flex-col">
    <img
      bind:this={topTrackPrimaryImage}
      id="top-track-image"
      class="w-[30vh] h-[30vh] mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]"
    />
    <div class="px-4 py-4 overflow-hidden whitespace-wrap">
      <div class="-rotate-6 -ml-10 mt-10 text-3xl font-semibold">
        <div class="">
          {
            $rewindReport.jellyfinRewindReport.tracks?.[
              rankingMetric
            ][informationSource]?.[0].artistsBaseInfo.reduce(
              (acc, cur, index) =>
                index > 0 ? `${acc} & ${cur.name}` : cur.name,
              ``,
            )
          } -
        </div>
        <div class="mt-8 ml-10">
          {
            $rewindReport.jellyfinRewindReport.tracks
              ?.[rankingMetric][informationSource]?.[0]
              ?.name
          }
        </div>
      </div>
    </div>
  </div>
  <div
    class="absolute bottom-20 left-0 w-full flex flex-col items-center gap-3"
  >
    <div>
      Streamed <span class="font-semibold">{
        showAsNumber(
          $rewindReport.jellyfinRewindReport.tracks
            ?.[rankingMetric][informationSource]?.[0]
            ?.playCount[informationSource],
        )
      }</span> times.
    </div>
    <div>
      Listened for <span class="font-semibold">{
        showAsNumber(
          $rewindReport.jellyfinRewindReport.tracks?.[
            rankingMetric
          ][informationSource]?.[0]
            ?.totalPlayDuration[informationSource]?.toFixed(0),
        )
      }</span> minutes.
    </div>
  </div>
</div>
