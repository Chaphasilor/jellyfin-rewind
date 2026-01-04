<script lang="ts">
  import type { FeatureProps } from "$lib/types";
  import { rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { showPlaying } from "$lib/utility/other";
  import { formatArtists, showAsNumber } from "$lib/utility/format";
  import Unavailable from "$lib/components/Unavailable.svelte";
  import { loadImage } from "$lib/utility/jellyfin-helper";
  import UnavailableReasonPlaybackReporting from "$lib/components/UnavailableReasonPlaybackReporting.svelte";
  import CircleIcon from "$lib/components/icons/CircleIcon.svelte";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
  }: FeatureProps = $props();

  // svelte-ignore non_reactive_update
  let unavailableOverlay: Unavailable;

  // plays a random track from the 5 most skipped tracks
  function playMostSkippedTracks() {
    if (!extraFeatures().mostSkippedTracks) {
      return;
    }
    const mostSkippedTracks = $rewindReport.jellyfinRewindReport.tracks
      ?.mostSkipped[informationSource]?.slice(0, 5); // first track excluded
    const randomTrackId = Math.floor(
      Math.random() * mostSkippedTracks.length,
    );
    const randomTrack = mostSkippedTracks[randomTrackId];
    showPlaying(`#most-skipped-tracks-visualizer`, randomTrackId, 5);

    console.log(`randomTrack:`, randomTrack);
    fadeToNextTrack(randomTrack);
  }

  export function onEnter() {
    playMostSkippedTracks();
  }
  export function onExit() {}

  onMount(() => {
    console.log(`mostSkippedTracksMedia`);

    const topTracks = $rewindReport.jellyfinRewindReport.tracks
      ?.mostSkipped[informationSource]?.slice(0, 5);

    topTracks.forEach((track, index) => {
      const trackPrimaryImage = document.querySelector(
        `#most-skipped-tracks-image-${index}`,
      );
      const trackBackgroundImage = document.querySelector(
        `#most-skipped-tracks-background-image-${index}`,
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

<div class="text-center pt-10">
  <h2 class="text-2xl mt-5">Sick of it:<br />Tracks you skipped the most</h2>
  {#if extraFeatures().mostSkippedTracks}
    <ol id="most-skipped-tracks-main-feature" class="flex flex-col gap-2 p-6">
      {#each       $rewindReport.jellyfinRewindReport.tracks
        ?.mostSkipped[informationSource]?.slice(0, 5) as
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
            <img
              id={`most-skipped-tracks-image-${index}`}
              class="w-full h-full"
            />
            <div
              id={`most-skipped-tracks-visualizer-${index}`}
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
                  showAsNumber(track.skips.total)
                }</span>
                skips
              </div>
              <CircleIcon />
              <div>
                <span class="font-semibold text-white">{
                  showAsNumber(track.playCount[informationSource])
                }</span>
                streams
              </div>
              <CircleIcon />
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
              id={`most-skipped-tracks-background-image-${index}`}
              class="w-full h-full"
            />
          </div>
        </li>
      {/each}
    </ol>
  {:else}
    <Unavailable bind:this={unavailableOverlay}>
      <UnavailableReasonPlaybackReporting
        closeModal={() => unavailableOverlay.closeModal()}
      />
    </Unavailable>
  {/if}
</div>
<!-- continue as simple list -->
{#if extraFeatures().mostSkippedTracks}
  <ol
    class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40"
  >
    {#each     $rewindReport.jellyfinRewindReport.tracks
      ?.mostSkipped[informationSource]?.slice(5) as
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
{/if}
