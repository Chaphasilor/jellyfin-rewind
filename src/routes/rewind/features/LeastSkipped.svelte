<script lang="ts">
  import Chart from "chart.js/auto";
  import { rewindReport, year } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin, showPlaying } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { formatArtists, showAsNumber } from "$lib/utility/format";
  import Unavailable from "$lib/components/Unavailable.svelte";
  import { loadImage } from "$lib/utility/jellyfin-helper";
  import { goto } from "$app/navigation";
  import UnavailableReasonPlaybackReporting from "$lib/components/UnavailableReasonPlaybackReporting.svelte";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
  }: FeatureProps = $props();

  // svelte-ignore non_reactive_update
  let unavailableOverlay: Unavailable;

  // plays a random track from the 5 least skipped tracks
  function playLeastSkippedTracks() {
    if (!extraFeatures().leastSkippedTracks) {
      return;
    }
    const leastSkippedTracks = $rewindReport.jellyfinRewindReport.tracks
      ?.leastSkipped[informationSource]?.slice(0, 5); // first track excluded
    const randomTrackId = Math.floor(
      Math.random() * leastSkippedTracks.length,
    );
    const randomTrack = leastSkippedTracks[randomTrackId];
    showPlaying(`#least-skipped-tracks-visualizer`, randomTrackId, 5);

    console.log(`randomTrack:`, randomTrack);
    fadeToNextTrack(randomTrack);
  }

  export function onEnter() {
    playLeastSkippedTracks();
  }
  export function onExit() {}

  onMount(() => {
    console.log(`leastSkippedTracksMedia`);

    const topTracks = $rewindReport.jellyfinRewindReport.tracks
      ?.leastSkipped[informationSource]?.slice(0, 5);

    topTracks.forEach((track, index) => {
      const trackPrimaryImage = document.querySelector(
        `#least-skipped-tracks-image-${index}`,
      );
      const trackBackgroundImage = document.querySelector(
        `#least-skipped-tracks-background-image-${index}`,
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
  <h2 class="text-2xl mt-5">Til the end:<br />Tracks you never skipped</h2>
  {#if extraFeatures().leastSkippedTracks}
    <ol id="least-skipped-tracks-main-feature" class="flex flex-col gap-2 p-6">
      {#each       $rewindReport.jellyfinRewindReport.tracks
        ?.leastSkipped[informationSource]?.slice(0, 5) as
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
              id={`least-skipped-tracks-image-${index}`}
              class="w-full h-full"
            />
            <div
              id={`least-skipped-tracks-visualizer-${index}`}
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
                  formatArtists(track.artistsBaseInfo.map((x) =>
                    x.name
                  ))
                }
              </span>
            </div>
            <div
              class="flex flex-row justify-start font-medium text-gray-300 gap-0.5 items-center text-xs"
            >
              <div>
                <span class="font-semibold text-white">{
                  showAsNumber(track.skips.partial)
                }</span>
                skips
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
              id={`least-skipped-tracks-background-image-${index}`}
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
{#if extraFeatures().leastSkippedTracks}
  <ol
    class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40"
  >
    {#each     $rewindReport.jellyfinRewindReport.tracks
      ?.leastSkipped[informationSource]?.slice(5) as
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
