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
  <h2 class="text-2xl font-medium mt-5">Your Top Albums<br />of the year</h2>
  <ol id="top-albums-main-feature" class="flex flex-col gap-2 p-6">
    {#each $lightRewindReport.albums?.[rankingMetric]?.slice(0, 5) as
      album,
      index
      (album.id)
    }
      <li
        class="relative z-[10] flex flex-row items-center dark:bg-gray-800 gap-4 overflow-hidden px-4 py-2 rounded-xl"
      >
        <div
          class="relative w-[8vh] h-[8vh] flex-shrink-0 rounded-md overflow-hidden"
        >
          <img id={`top-albums-image-${index}`} class="w-full h-full" />
          <div
            id={`top-albums-visualizer-${index}`}
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
              >{album.name}</span>
            </div>
            <span
              class="text-sm ml-2 max-h-[2rem] text-ellipsis overflow-hidden"
            >by {
                album.artists?.reduce(
                  (acc, cur, index) =>
                    index > 0 ? `${acc} & ${cur.name}` : cur.name,
                  ``,
                ) || `Unknown Artist`
              }</span>
          </div>
          <div
            class="flex flex-row justify-start font-medium text-gray-800 dark:text-gray-300 gap-0.5 items-center text-xs"
          >
            <div>
              <span class="font-semibold text-black dark:text-white">{
                showAsNumber(album.playCount[informationSource])
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
                  album.totalPlayDuration[informationSource]
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
            id={`top-albums-background-image-${index}`}
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
  {#each $lightRewindReport.albums?.[rankingMetric]?.slice(5, 20) as
    album,
    index
    (album.id)
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
            >{album.name}</span>
          </div>
          <div class="ml-6 max-h-[2rem] text-xs">
            by <span class="font-semibold">{
              album.artists?.reduce(
                (acc, cur, index) =>
                  index > 0 ? `${acc} & ${cur.name}` : cur.name,
                ``,
              ) || `Unknown Artist`
            }</span>
          </div>
        </div>
      </div>
    </li>
  {/each}
</ol>
