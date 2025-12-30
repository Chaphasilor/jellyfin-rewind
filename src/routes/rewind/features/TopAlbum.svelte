<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import {
    loadImage,
    loadTracksForGroup,
  } from "$lib/utility/jellyfin-helper";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
  }: FeatureProps = $props();

  async function playTopAlbum() {
    const topAlbumByDuration = $lightRewindReport.jellyfinRewindReport
      .albums?.[rankingMetric]?.[0];
    console.log(`topAlbumByDuration:`, topAlbumByDuration);

    let albumsTracks = await loadTracksForGroup(
      topAlbumByDuration.id,
      `album`,
    );
    let randomTrackId = Math.floor(Math.random() * albumsTracks.length);
    let randomTrack = albumsTracks[randomTrackId];
    console.log(`randomTrack:`, randomTrack);

    fadeToNextTrack({ id: randomTrack.Id });
  }

  export function onEnter() {
    playTopAlbum();
  }
  export function onExit() {}

  onMount(() => {
    const topAlbumPrimaryImage = document.querySelector(`#top-album-image`);
    console.log(`img:`, topAlbumPrimaryImage);
    const topAlbumByDuration = $lightRewindReport.jellyfinRewindReport
      .albums?.[rankingMetric]?.[0];
    console.log(`topAlbumByDuration:`, topAlbumByDuration);
    loadImage([topAlbumPrimaryImage], topAlbumByDuration.image, `album`);
  });
</script>

<div class="text-center text-white">
  <h2 class="text-2xl mt-5">
    Your Top Album<br />of {$lightRewindReport.jellyfinRewindReport?.year}:
  </h2>
  <div class="flex mt-10 flex-col items-center">
    <img
      id="top-album-image"
      class="w-[30vh] h-[30vh] mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]"
    />
    <div class="px-4 py-4 overflow-hidden whitespace-wrap">
      <div class="-rotate-6 mt-10 text-4xl font-semibold">
        <div class="-ml-4">
          {
            $lightRewindReport.jellyfinRewindReport.albums
              ?.[rankingMetric]?.[0]
              .name
          }
        </div>
        <div class="ml-4 mt-8 max-h-[3.5em]">
          by {
            $lightRewindReport.jellyfinRewindReport.albums?.[
              rankingMetric
            ]?.[0]?.artists.reduce(
              (acc, cur, index) =>
                index > 0 ? `${acc} & ${cur.name}` : cur.name,
              ``,
            )
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
          $lightRewindReport.jellyfinRewindReport.albums
            ?.[rankingMetric]?.[0]
            ?.playCount[informationSource],
        )
      }</span> times.
    </div>
    <div>
      Listened for <span class="font-semibold">{
        showAsNumber(
          $lightRewindReport.jellyfinRewindReport.albums?.[
            rankingMetric
          ]?.[0]?.totalPlayDuration[informationSource]?.toFixed(0),
        )
      }</span> minutes.
    </div>
  </div>
</div>
