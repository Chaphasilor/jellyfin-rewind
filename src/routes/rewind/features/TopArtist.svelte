<script lang="ts">
  import { rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { type FeatureProps } from "$lib/types";
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

  async function playTopArtist() {
    const topArtistByDuration = $rewindReport.jellyfinRewindReport
      .artists?.[rankingMetric][informationSource]?.[0];
    console.log(`topArtistByDuration:`, topArtistByDuration);

    let artistsTracks = await loadTracksForGroup(
      topArtistByDuration.id,
      `artist`,
    );
    let randomTrackId = Math.floor(Math.random() * artistsTracks.length);
    let randomTrack = artistsTracks[randomTrackId];
    console.log(`randomTrack:`, randomTrack);

    fadeToNextTrack({ id: randomTrack.Id });
  }

  export function onEnter() {
    playTopArtist();
  }
  export function onExit() {
  }

  onMount(() => {
    const topArtistPrimaryImage = document.querySelector(
      `#top-artist-image`,
    );
    console.log(`img:`, topArtistPrimaryImage);
    const topTrackByDuration = $rewindReport.jellyfinRewindReport
      .artists?.[rankingMetric][informationSource]?.[0];
    console.log(`topTrackByDuration:`, topTrackByDuration);
    loadImage(
      [topArtistPrimaryImage],
      topTrackByDuration.images.primary,
      `artist`,
    );
  });
</script>

<div class="text-center text-white pt-10">
  <h2 class="text-2xl mt-5">
    Your Top Artist<br />of {$rewindReport.jellyfinRewindReport?.year}:
  </h2>
  <div class="flex mt-10 flex-col">
    <img
      id="top-artist-image"
      class="w-[30vh] h-[30vh] mx-auto rounded-2xl drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]"
    />
    <div class="px-4 py-4 overflow-hidden whitespace-wrap">
      <div class="-rotate-6 mt-16 text-5xl font-semibold">
        <div class="">
          {
            $rewindReport.jellyfinRewindReport.artists
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
          $rewindReport.jellyfinRewindReport.artists?.[
            rankingMetric
          ][informationSource]?.[0]?.playCount?.[informationSource],
        )
      }</span> times.
    </div>
    <div>
      Listened to <span class="font-semibold">{
        showAsNumber(
          $rewindReport.jellyfinRewindReport.artists?.[
            rankingMetric
          ][informationSource]?.[0]?.uniquePlayedTracks
            ?.[informationSource],
        )
      }</span>
      unique tracks <br />for
      <span class="font-semibold">{
        showAsNumber(
          $rewindReport.jellyfinRewindReport.artists?.[
            rankingMetric
          ][informationSource]?.[0]
            ?.totalPlayDuration[informationSource].toFixed(0),
        )
      }</span> minutes.
    </div>
  </div>
</div>
