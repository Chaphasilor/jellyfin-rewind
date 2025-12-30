<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  onMount(() => {});
</script>

<div class="text-center">
  <h2 class="text-2xl mt-5">Sick of it:<br />Tracks you skipped the most</h2>
  {#if extraFeatures().mostSkippedTracks}
    <ol id="most-skipped-tracks-main-feature" class="flex flex-col gap-2 p-6">
      {#each $lightRewindReport.tracks?.[`mostSkipped`]?.slice(0, 5) as
        track,
        index
        (track.id)
      }
        <li
          class="relative z-[10] flex flex-row items-center dark:bg-gray-800 gap-4 overflow-hidden px-4 py-2 rounded-xl"
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
            class="flex flex-col gap-1 justify-center bg-white/30 dark:bg-black/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md"
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
              >by {
                  track.artistsBaseInfo.reduce(
                    (acc, cur, index) =>
                      index > 0 ? `${acc} & ${cur.name}` : cur.name,
                    ``,
                  )
                }</span>
            </div>
            <div
              class="flex flex-row justify-start font-medium text-gray-800 dark:text-gray-300 gap-0.5 items-center text-xs"
            >
              <div>
                <span class="font-semibold text-black dark:text-white">{
                  showAsNumber(track.skips.total)
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
                <span class="font-semibold text-black dark:text-white">{
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
                <span class="font-semibold text-black dark:text-white">{
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
    <div
      class="absolute top-0 left-0 w-full h-full flex flex-col items-center bg-black/40 justify-center gap-12"
    >
      <div
        class="bg-white/60 dark:bg-[#000B25]/60 flex flex-col items-center justify-center gap-12 px-12 pt-20 pb-12 rounded-xl"
      >
        <span
          class="text-4xl rotate-12 text-[#00A4DC] tracking-wider font-semibold"
        >Unavailable</span>
        <button
          on:click|stopPropagation={{
            //TODO showOverlayFeatureUnavailableMissingPlaybackReporting()
          }}
          class="w-32 rounded-md flex flex-row items-center justify-around px-2 py-1 bg-white text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 icon icon-tabler icon-tabler-info-square-rounded"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M12 8h.01"></path>
            <path d="M11 12h1v4h1"></path>
            <path
              d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"
            >
            </path>
          </svg>
          <span class="font-medium">Learn why</span>
        </button>
      </div>
    </div>
  {/if}
</div>
<!-- continue as simple list -->
{#if extraFeatures().mostSkippedTracks}
  <ol
    class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40"
  >
    {#each $lightRewindReport.tracks?.[`mostSkipped`]?.slice(5, 20) as
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
              by
              <span class="font-semibold text-ellipsis overflow-hidden">{
                track.artistsBaseInfo.reduce(
                  (acc, cur, index) =>
                    index > 0 ? `${acc} & ${cur.name}` : cur.name,
                  ``,
                )
              }</span>
            </div>
          </div>
        </div>
      </li>
    {/each}
  </ol>
{/if}
