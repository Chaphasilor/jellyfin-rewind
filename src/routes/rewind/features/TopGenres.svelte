<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin, showPlaying } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import { loadTracksForGroup } from "$lib/utility/jellyfin-helper";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
  }: FeatureProps = $props();

  function stringToColor(string: string) {
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Number(hash) % 256}, 100%, 80%)`;
  }

  // plays a random track from the top 5 genres
  async function playTopGenres() {
    const topGenres = $lightRewindReport.jellyfinRewindReport.genres
      ?.[rankingMetric]?.slice(0, 5); // first genre excluded
    const randomGenreId = Math.floor(Math.random() * topGenres.length);
    const randomGenre = topGenres[randomGenreId];
    console.log(`randomGenre:`, randomGenre);
    showPlaying(`#top-genres-visualizer`, randomGenreId, 5);

    let genresTracks = await loadTracksForGroup(randomGenre.id, `genre`);
    let randomTrackId = Math.floor(Math.random() * genresTracks.length);
    let randomTrack = genresTracks[randomTrackId];
    console.log(`randomTrack:`, randomTrack);

    fadeToNextTrack({ id: randomTrack.Id });
  }

  export function onEnter() {
    playTopGenres();
  }
  export function onExit() {
  }

  onMount(() => {});
</script>

<div class="text-center">
  <h2 class="text-2xl font-medium mt-5">Your Top Genres<br />of the year</h2>
  <ol
    id="top-genres-main-feature"
    class="flex flex-col gap-2 p-6 text-black"
  >
    {#each       $lightRewindReport.jellyfinRewindReport.genres?.[rankingMetric]
        ?.slice(0, 8) as
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
                class="font-quicksand-bold text-lg uppercase tracking-widest w-full text-start whitespace-nowrap text-ellipsis overflow-hidden"
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
                    showAsNumber(
                      genre
                        .uniquePlayedTracks[informationSource],
                    )
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
  {#each     $lightRewindReport.jellyfinRewindReport.genres?.[rankingMetric]?.slice(
      8,
      20,
    ) as
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
            <span class="font-semibold mr-2">{index + 1 + 8}.</span>
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
