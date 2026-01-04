<script lang="ts">
  import { rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import type { FeatureProps } from "$lib/types";
  import { formatArtists, showAsNumber } from "$lib/utility/format";
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
    const topAlbumByDuration = $rewindReport.jellyfinRewindReport
      .albums?.[rankingMetric][informationSource]?.[0];
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
    const topAlbumByDuration = $rewindReport.jellyfinRewindReport
      .albums?.[rankingMetric][informationSource]?.[0];
    console.log(`topAlbumByDuration:`, topAlbumByDuration);
    loadImage([topAlbumPrimaryImage], topAlbumByDuration.image, `album`);
  });
</script>

<div class="text-center text-white pt-10">
  <h2 class="text-2xl mt-5">
    Your Top Album<br />of {$rewindReport.jellyfinRewindReport?.year}:
  </h2>
  <div class="flex mt-10 flex-col items-center">
    <img
      id="top-album-image"
      class="w-[30vh] h-[30vh] mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]"
    />
    <div class="px-4 py-4 overflow-hidden whitespace-wrap">
      <div class="-rotate-6 mt-10 text-3xl font-semibold">
        <div class="-ml-4">
          {
            $rewindReport.jellyfinRewindReport.albums
              ?.[rankingMetric][
                informationSource
              ]?.[0].name
          }
        </div>
        <div class="ml-4 mt-8 max-h-[3.5em]">
          {
            formatArtists(
              $rewindReport.jellyfinRewindReport.albums
                ?.[rankingMetric][
                  informationSource
                ]?.[0]?.artists?.map((x) => x.name),
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
          $rewindReport.jellyfinRewindReport.albums?.[rankingMetric][
            informationSource
          ]?.[0]?.playCount[informationSource],
        )
      }</span> times.
    </div>
    <div>
      Listened for <span class="font-semibold">{
        showAsNumber(
          $rewindReport.jellyfinRewindReport.albums?.[rankingMetric][
            informationSource
          ]?.[0]?.totalPlayDuration[informationSource]?.toFixed(0),
        )
      }</span> minutes.
    </div>
  </div>
</div>
