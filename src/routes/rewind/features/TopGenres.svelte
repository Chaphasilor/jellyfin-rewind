<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  function stringToColor(string: string) {
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    // var color = `#`;
    // for (var i = 0; i < 3; i++) {
    //     var value = (hash >> (i * 8)) & 0xFF;
    //     color += ('00' + value.toString(16)).substring(-2);
    // }
    return `hsl(${Number(hash) % 256}, 100%, 80%)`;
  }

  onMount(() => {});
</script>

<div class="text-center">
  <h2 class="text-2xl font-medium mt-5">Your Top Genres<br />of the year</h2>
  <ol
    id="top-genres-main-feature"
    class="flex flex-col gap-2 p-6 dark:text-black"
  >
    {#each $lightRewindReport.genres?.[rankingMetric]?.slice(0, 5) as
      genre,
      index
      (genre.id)
    }
      <li
        class="relative z-[10] flex flex-row items-center gap-4 overflow-hidden px-4 py-3 rounded-xl"
        style={`background-color: ${stringToColor(genre.name)}`}
      >
        <div
          class="flex flex-col gap-1 overflow-hidden h-full w-full rounded-md"
        >
          <div
            class="flex flex-row gap-4 w-full justify-start items-center whitespace-nowrap"
          >
            <span class="font-semibold basext-xl">{index + 1}.</span>
            <div class="flex flex-col gap-0.5 items-start">
              <span
                class="font-quicksand-bold text-lg uppercase tracking-widest"
              >{genre.name}</span>

              <div
                class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs"
              >
                <div>
                  <span class="font-semibold text-black">{
                    showAsNumber(
                      genre.playCount[informationSource],
                    )
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
                  <span class="font-semibold text-black">{
                    showAsNumber(genre.uniqueTracks)
                  }</span>
                  tracks
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
                  <span class="font-semibold text-black">{
                    showAsNumber(
                      genre.totalPlayDuration[informationSource]
                        .toFixed(0),
                    )
                  }</span>
                  min
                </div>
              </div>
            </div>
            <div
              id={`top-genres-visualizer-${index}`}
              class="absolute top-0 right-0 w-[8vh] h-full grid place-content-center text-black hidden"
            >
            </div>
          </div>
        </div>
      </li>
    {/each}
  </ol>
</div>
<!-- continue as simple list -->
<ol
  class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-48"
>
  {#each $lightRewindReport.genres?.[rankingMetric]?.slice(5, 20) as
    genre,
    index
    (genre.id)
  }
    <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
      <div class="flex flex-col gap-1 w-full">
        <div class="flex flex-col gap-0.25 items-start">
          <div
            class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center"
          >
            <span class="font-semibold mr-2">{index + 1 + 5}.</span>
            <span
              class="font-semibold leading-tight text-ellipsis overflow-hidden"
            >{genre.name}</span>
          </div>
        </div>
      </div>
    </li>
  {/each}
</ol>
<!-- TODO add pie chart with percentages -->
