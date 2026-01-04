<script lang="ts">
  import Chart from "chart.js/auto";
  import { rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin, showPlaying } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import {
    loadImage,
    loadTracksForGroup,
  } from "$lib/utility/jellyfin-helper";
    import CircleIcon from "$lib/components/icons/CircleIcon.svelte";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
  }: FeatureProps = $props();

  // plays a random track from the top 5 artists (excluding the top artist)
  async function playTopArtists() {
    const topArtists = $rewindReport.jellyfinRewindReport.artists
      ?.[rankingMetric][informationSource]?.slice(1, 5); // first artist excluded
    const randomArtistId = Math.floor(Math.random() * topArtists.length);
    const randomArtist = topArtists[randomArtistId];
    console.log(`randomArtist:`, randomArtist);
    showPlaying(`#top-artists-visualizer`, randomArtistId + 1, 5);

    let artistsTracks = await loadTracksForGroup(randomArtist.id, `artist`);
    let randomTrackId = Math.floor(Math.random() * artistsTracks.length);
    let randomTrack = artistsTracks[randomTrackId];
    console.log(`randomTrack:`, randomTrack);

    fadeToNextTrack({ id: randomTrack.Id });
  }

  export function onEnter() {
    playTopArtists();
  }
  export function onExit() {
  }

  onMount(() => {
    const topArtists = $rewindReport.jellyfinRewindReport.artists?.[
      rankingMetric
    ][informationSource]?.slice(0, 5);

    topArtists.forEach((artist, index) => {
      const artistPrimaryImage = document.querySelector(
        `#top-artists-image-${index}`,
      );
      const artistBackgroundImage = document.querySelector(
        `#top-artists-background-image-${index}`,
      );
      console.log(`img:`, artistPrimaryImage);
      loadImage(
        [artistPrimaryImage, artistBackgroundImage],
        artist.images.primary,
        `artist`,
      );
    });
  });
</script>

<div class="text-center pt-10">
  <h2 class="text-2xl font-medium mt-5">Your Top Artists<br />of the year</h2>
  <ol id="top-artists-main-feature" class="flex flex-col gap-2 p-6">
    {#each       $rewindReport.jellyfinRewindReport.artists
        ?.[rankingMetric][informationSource]
        ?.slice(0, 5) as
      artist,
      index
      (artist.id)
    }
      <li
        class="relative z-[10] flex flex-row items-center bg-gray-800 gap-4 overflow-hidden px-4 py-2 rounded-xl"
      >
        <div
          class="relative w-[8vh] h-[8vh] flex-shrink-0 rounded-md overflow-hidden"
        >
          <img id={`top-artists-image-${index}`} class="w-full h-full" />
          <div
            id={`top-artists-visualizer-${index}`}
            class="absolute top-0 left-0 w-full h-full grid place-content-center text-white bg-black/30 hidden"
          >
          </div>
        </div>
        <div
          class="flex flex-col gap-1 justify-center bg-black/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md"
        >
          <div class="flex flex-col gap-0.25 items-start">
            <div
              class="flex flex-row w-full justify-start items-center whitespace-nowrap"
            >
              <span class="font-semibold text-base mr-2">{index + 1}.</span>
              <span
                class="font-semibold text-base leading-tight w-full text-start whitespace-nowrap text-ellipsis overflow-hidden"
              >{artist.name}</span>
            </div>
          </div>
          <div
            class="flex flex-row justify-start font-medium text-gray-300 gap-0.5 items-center text-xs"
          >
            <div>
              <span class="font-semibold text-white">{
                showAsNumber(artist.playCount[informationSource])
              }</span>
              streams
            </div>
            <CircleIcon />
            <div>
              <span class="font-semibold text-white">{
                showAsNumber(artist.uniqueTracks)
              }</span>
              tracks
            </div>
            <CircleIcon />
            <div>
              <span class="font-semibold text-white">{
                showAsNumber(
                  artist.totalPlayDuration[informationSource]
                    .toFixed(0),
                )
              }</span>
              min
            </div>
          </div>
        </div>
        <div
          class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]"
        >
          <img
            id={`top-artists-background-image-${index}`}
            class="w-full h-full"
          />
        </div>
      </li>
    {/each}
  </ol>
</div>
<!-- continue as simple list -->
<ol
  class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40"
>
  {#each     $rewindReport.jellyfinRewindReport.artists
      ?.[rankingMetric][informationSource]
      ?.slice(5) as
    artist,
    index
    (artist.id)
  }
    <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
      <div class="flex flex-col gap-1 w-full">
        <div class="flex flex-col gap-0.25 items-start">
          <div
            class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center"
          >
            <span class="font-semibold mr-2">{index + 1 + 5}.</span>
            <span
              class="font-base leading-tight text-ellipsis overflow-hidden"
            >{artist.name}</span>
          </div>
        </div>
      </div>
    </li>
  {/each}
</ol>
