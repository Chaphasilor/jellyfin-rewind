<script lang="ts">
  import { rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { showPlaying } from "$lib/utility/other";
  import type { FeatureProps } from "$lib/types";
  import { formatArtists, showAsNumber } from "$lib/utility/format";
  import { loadImage } from "$lib/utility/jellyfin-helper";
  import CircleIcon from "$lib/components/icons/CircleIcon.svelte";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
  }: FeatureProps = $props();

  // plays a random track from the 5 forgotten favorites
  function playTopForgotten() {
    const forgottenFavoriteTracks = $rewindReport.jellyfinRewindReport
      .tracks?.forgottenFavoriteTracks[informationSource].slice(0, 5);
    const randomTrackId = Math.floor(
      Math.random() * forgottenFavoriteTracks.length,
    );
    const randomTrack = forgottenFavoriteTracks[randomTrackId];

    showPlaying(
      `#forgotten-tracks-visualizer`,
      randomTrackId,
      forgottenFavoriteTracks.length,
    );
    fadeToNextTrack(randomTrack);
  }

  export function onEnter() {
    playTopForgotten();
  }
  export function onExit() {
  }

  onMount(() => {
    const forgottenFavoriteTracks = $rewindReport.jellyfinRewindReport
      .tracks?.forgottenFavoriteTracks[informationSource];

    forgottenFavoriteTracks.forEach((track, index) => {
      const trackPrimaryImage = document.querySelector(
        `#forgotten-tracks-image-${index}`,
      );
      const trackBackgroundImage = document.querySelector(
        `#forgotten-tracks-background-image-${index}`,
      );
      loadImage(
        [trackPrimaryImage, trackBackgroundImage],
        track.image,
        `track`,
      );
    });
  });
</script>

<div class="text-center pt-10">
  <h2 class="text-xl font-medium mt-5 px-2">
    Remember These Forgotten Favorites?
  </h2>
  <h3 class="px-6">
    Here are {
      $rewindReport.jellyfinRewindReport.tracks
        ?.forgottenFavoriteTracks[informationSource].length
    } tracks you loved earlier this year, but it's been a while since you last
    played them.
  </h3>
  <h3 class="px-6"><em>What changed?</em></h3>

  <ol id="top-forgotten-main-feature" class="flex flex-col gap-2 p-6">
    {#each       $rewindReport.jellyfinRewindReport.tracks
        ?.forgottenFavoriteTracks[informationSource].slice(0, 5) as
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
          <img id={`forgotten-tracks-image-${index}`} class="w-full h-full" />
          <div
            id={`forgotten-tracks-visualizer-${index}`}
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
                class="font-semibold text-base leading-tight text-ellipsis overflow-hidden"
              >{track.name}</span>
            </div>
            <span
              class="text-sm ml-2 max-h-[2rem] text-ellipsis overflow-hidden"
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
            <CircleIcon />
            <div>
              <span class="font-semibold text-white">Last Played
                {
                  new Date(
                    track.lastPlayed ?? 0,
                  ).toLocaleDateString()
                }</span>
            </div>
          </div>
        </div>
        <div
          class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]"
        >
          <img
            id={`forgotten-tracks-background-image-${index}`}
            class="w-full h-full"
          />
        </div>
      </li>
    {/each}
  </ol>
</div>
<!-- continue as simple list -->
<ol
  class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-36"
>
  {#each     $rewindReport.jellyfinRewindReport.tracks
      ?.forgottenFavoriteTracks[informationSource].slice(5) as
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
            <span class="font-semibold mr-2">{index + 6}.</span>
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
