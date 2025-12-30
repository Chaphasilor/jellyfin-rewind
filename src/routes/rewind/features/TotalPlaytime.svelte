<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
    import Unavailable from "$lib/components/Unavailable.svelte";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  let canvas: HTMLCanvasElement;

  onMount(() => {
    // const rawData = $processingResult.monthOfYear.entries;
    // rawData.forEach(([month, d]) => {
    //   const i = parseInt(month);
    //   duration[i] = Math.round(
    //     d.counters[informationSource].listenDuration / 60,
    //   );
    //   plays[i] =
    //     d.counters[informationSource].fullPlays +
    //     d.counters[informationSource].partialSkips;
    //   skips[i] =
    //     d.counters[informationSource].fullSkips +
    //     d.counters[informationSource].partialSkips;
    // });
    // mostDuration = indexOfMax(duration);
    // mostPlays = indexOfMax(plays);
    // mostSkips = indexOfMax(skips);
    // monthWithMostDuration = months[mostDuration];
    // monthWithMostPlays = months[mostPlays];
    // monthWithMostSkips = months[mostSkips];
    // leastDuration = indexOfMin(duration);
    // leastPlays = indexOfMin(plays);
    // leastSkips = indexOfMin(skips);
    // monthWithLeastDuration = months[leastDuration];
    // monthWithLeastPlays = months[leastPlays];
    // monthWithLeastSkips = months[leastSkips];
    // console.log(
    //   mostDuration,
    //   mostPlays,
    //   monthWithMostDuration,
    //   monthWithMostPlays,
    //   leastDuration,
    //   leastPlays,
    //   monthWithLeastDuration,
    //   monthWithLeastPlays,
    // );
    // new Chart(canvas.getContext("2d")!, {
    //   type: "bar",
    //   options: {
    //     scales: {
    //       playtime: {
    //         title: {
    //           text: "Listen duration in minutes",
    //           display: true,
    //         },
    //         position: "bottom",
    //         min: 0,
    //         max: Math.max(...duration),
    //       },
    //       plays: {
    //         title: {
    //           text: "Number of Plays",
    //           display: true,
    //         },
    //         position: "top",
    //         min: 0,
    //         max: Math.max(...plays),
    //       },
    //     },
    //     indexAxis: "y",
    //     responsive: true,
    //     maintainAspectRatio: false,
    //     plugins: {
    //       legend: {
    //         position: "bottom",
    //       },
    //     },
    //   },
    //   data: {
    //     yLabels: months,
    //     datasets: [
    //       {
    //         label: "Listen duration",
    //         data: duration,
    //         xAxisID: "playtime",
    //         backgroundColor: "rgba(241, 181, 57, 0.2)",
    //         borderRadius: 6,
    //         borderColor: "rgba(241, 181, 57, 0.7)",
    //         borderWidth: 1,
    //       },
    //       {
    //         label: "Plays",
    //         data: plays,
    //         xAxisID: "plays",
    //         backgroundColor: "rgba(133, 181, 227, 0.2)",
    //         borderRadius: 6,
    //         borderColor: "rgba(133, 181, 227, 0.7)",
    //         borderWidth: 1,
    //       },
    //     ],
    //   },
    // });
  });
</script>

<div class="text-center">
  <h2 class="text-2xl font-medium mt-5">
    Your Total Playtime<br />of {
      $lightRewindReport.jellyfinRewindReport?.year
    }<span
      class="inline-flex flex-row align-items-start hover:text-gray-700 cursor-pointer"
      on:click|stopPropagation={() => {
        //TODO showOverlayDataAccuracy
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5 icon icon-tabler icon-tabler-asterisk"
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
        <path d="M12 12l8 -4.5"></path>
        <path d="M12 12v9"></path>
        <path d="M12 12l-8 -4.5"></path>
        <path d="M12 12l8 4.5"></path>
        <path d="M12 3v9"></path>
        <path d="M12 12l-8 4.5"></path>
      </svg>
    </span>:
  </h2>

  <div class="mt-10 -rotate-6 font-quicksand text-sky-500 text-4xl">
    <span class="font-quicksand-bold">{
      showAsNumber(
        $lightRewindReport.jellyfinRewindReport.generalStats
          .totalPlaybackDurationMinutes[
            informationSource
          ].toFixed(0),
      )
    }</span> min
  </div>

  <div class="mt-12 w-full flex flex-col items-center gap-0.5 text-sm">
    <div>
      <span class="font-semibold">{
        showAsNumber(
          $lightRewindReport.jellyfinRewindReport.generalStats
            ?.[`totalPlays`]
            ?.[informationSource],
        )
      }</span> total streams.
    </div>
    <div>
      <span class="font-semibold">{
        showAsNumber(
          $lightRewindReport.jellyfinRewindReport.generalStats
            ?.[`uniqueTracksPlayed`],
        )
      }</span> unique tracks.
    </div>
    <div>
      <span class="font-semibold">{
        showAsNumber(
          $lightRewindReport.jellyfinRewindReport.generalStats
            ?.[`uniqueArtistsPlayed`],
        )
      }</span> unique artists.
    </div>
    <div>
      <span class="font-semibold">{
        showAsNumber(
          $lightRewindReport.jellyfinRewindReport.generalStats
            ?.[`uniqueAlbumsPlayed`],
        )
      }</span> unique albums.
    </div>
  </div>

  <div class="absolute bottom-20 w-full h-2/5 px-8">
    <canvas
      id="playtime-by-month-chart"
      class={extraFeatures().totalPlaytimeGraph ? `` : `opacity-30`}
    ></canvas>
    {#if extraFeatures().totalPlaytimeGraph}
      <br />
    {:else}
      <Unavailable />
    {/if}
  </div>
</div>
