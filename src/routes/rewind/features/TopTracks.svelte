<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin, showPlaying } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { formatArtists, showAsNumber } from "$lib/utility/format";
  import { loadImage } from "$lib/utility/jellyfin-helper";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
  }: FeatureProps = $props();

  // plays a random track from the top 5 tracks (excluding the top track)
  function playTopTracks() {
    const topTracks = $lightRewindReport.jellyfinRewindReport.tracks?.[
      rankingMetric
    ]?.slice(1, 5); // first track excluded
    const randomTrackId = Math.floor(Math.random() * topTracks.length);
    const randomTrack = topTracks[randomTrackId];
    showPlaying(`#top-tracks-visualizer`, randomTrackId + 1, 5);

    console.log(`randomTrack:`, randomTrack);
    fadeToNextTrack(randomTrack);
  }

  export function onEnter() {
    playTopTracks();
  }
  export function onExit() {
  }

  onMount(() => {
    console.log(`topTracksMedia`);

    const topTracks = $lightRewindReport.jellyfinRewindReport.tracks?.[
      rankingMetric
    ]?.slice(0, 5);

    topTracks.forEach((track, index) => {
      const trackPrimaryImage = document.querySelector(
        `#top-tracks-image-${index}`,
      );
      const trackBackgroundImage = document.querySelector(
        `#top-tracks-background-image-${index}`,
      );
      console.log(`img:`, trackPrimaryImage);
      loadImage(
        [trackPrimaryImage, trackBackgroundImage],
        track.image,
        `track`,
      );
    });
  });
</script>

<div class="text-center">
  <h2 class="text-2xl font-medium mt-5">Your Top Tracks<br />of the year</h2>
  <ol id="top-tracks-main-feature" class="flex flex-col gap-2 p-6">
    {#each       $lightRewindReport.jellyfinRewindReport.tracks?.[rankingMetric]
        ?.slice(0, 5) as
      track,
      index
      (track.id)
    }
      <li
        class="relative z-[10] flex flex-row items-center bg-gray-800 gap-4 overflow-hidden px-4 py-2 rounded-xl"
      >
        <div
          class="relative w-[8vh] h-[8vh] flex-shrink-0 rounded-md overflow-hidden"
        >
          <img id={`top-tracks-image-${index}`} class="w-full h-full" />
          <div
            id={`top-tracks-visualizer-${index}`}
            class="absolute top-0 left-0 w-full h-full grid place-content-center text-white bg-black/30 hidden"
          >
          </div>
        </div>
        <div
          class="flex flex-col gap-1 justify-center bg-black/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md"
        >
          <div class="flex flex-col gap-0.25 items-start">
            <div
              class="flex flex-row w-full justify-start items-start whitespace-nowrap"
            >
              <span class="font-semibold text-base mr-2">{index + 1}.</span>
              <span
                class="font-semibold text-base leading-tight text-ellipsis overflow-hidden"
              >{track.name}</span>
            </div>
            <span
              class="text-sm ml-2 max-h-[2em] w-full text-start text-ellipsis overflow-hidden whitespace-nowrap"
            >{
              formatArtists(
                track.artistsBaseInfo.map((x) => x.name),
              )
            }</span>
          </div>
          <div
            class="flex flex-row justify-start font-medium text-gray-300 gap-0.5 items-center text-xs"
          >
            <div>
              <span class="font-semibold text-white">{
                showAsNumber(track.playCount[informationSource])
              }</span>
              streams
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
            <div>
              <span class="font-semibold text-white">{
                showAsNumber(
                  track.totalPlayDuration[informationSource]
                    .toFixed(0),
                )
              }</span>
              minutes
            </div>
          </div>
        </div>
        <div
          class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]"
        >
          <img
            id={`top-tracks-background-image-${index}`}
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
  {#each     $lightRewindReport.jellyfinRewindReport.tracks?.[rankingMetric]?.slice(
      5,
      20,
    ) as
    track,
    index
    (track.id)
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
            >{track.name}</span>
          </div>
          <div class="ml-6 max-h-[2rem] text-xs">
            <span class="font-semibold text-ellipsis overflow-hidden">{
              formatArtists(
                track.artistsBaseInfo.map((x) => x.name),
              )
            }</span>
          </div>
        </div>
      </div>
    </li>
  {/each}
</ol>
