<script lang="ts">
  import Chart from "chart.js/auto";
  import { isAccuracyDisclaimerOpen, rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import type { FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import Unavailable from "$lib/components/Unavailable/Unavailable.svelte";
  import StarIcon from "$lib/components/icons/StarIcon.svelte";
  import UnavailableReasonPlaybackReporting from "$lib/components/Unavailable/UnavailableReasonPlaybackReporting.svelte";
    import { stopPropagation } from "$lib/utility/handlers";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  // svelte-ignore non_reactive_update
  let unavailableOverlay: Unavailable;
  let doPollCanvas = $state(false);

  function showPlaytimeByMonthChart() {
    console.log(`Loading chart...`);

    let canvas: HTMLCanvasElement | null;

    const initializeChart = () => {
      console.log(`initializeChart:`, canvas);
      if (canvas === null) {
        console.warn(`Canvas is null, cannot initialize chart.`);
        return;
      }
      new Chart(canvas, {
        type: "bar",
        data,
        plugins: [],
        options: {
          plugins: {
            legend: {
              display: false,
            },
          },
          responsive: false,
          maintainAspectRatio: false,
          aspectRatio: 2 / 3,
          backgroundColor: `#ffffff`,
          animation: {
            duration: 2000,
            easing: `easeOutCubic`,
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              border: {
                width: 3,
                color: `#002633`,
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                display: false,
              },
              border: {
                width: 3,
                color: `#002633`,
              },
            },
          },
          layout: {},
          elements: {
            bar: {
              backgroundColor: "#00a4dc",
              borderWidth: 0,
              borderRadius: 4,
              borderSkipped: `bottom`,
              //@ts-ignore
              minBarLength: 32,
            },
          },
        },
      });
      doPollCanvas = false;
    };

    const months = [
      `January`,
      `February`,
      `March`,
      `April`,
      `May`,
      `June`,
      `July`,
      `August`,
      `September`,
      `October`,
      `November`,
      `December`,
    ];

    let monthData = Object.keys(
      $rewindReport.jellyfinRewindReport.generalStats
        .totalPlaybackDurationByMonth,
    ).reduce(
      (acc, month) => {
        acc[months[Number(month)]] =
          $rewindReport.jellyfinRewindReport.generalStats
            .totalPlaybackDurationByMonth[
              Number(month)
            ];
        return acc;
      },
      {} as Record<string, number>,
    );

    let data = {
      labels: months,
      datasets: [
        {
          label: `Playtime in minutes`,
          data: extraFeatures().totalPlaytimeGraph
            ? monthData
            : [300, 600, 367, 763, 823, 285, 506, 583, 175, 286, 1204, 496],
        },
      ],
    };

    doPollCanvas = true;
    const pollCanvas = () => {
      if (!doPollCanvas) {
        return;
      }
      canvas = document.querySelector(`#playtime-by-month-chart`);
      console.log(`canvas:`, canvas);
      if (canvas === null) {
        setTimeout(pollCanvas, 100);
      } else {
        try {
          initializeChart();
        } catch (err) {
          console.warn(`Error initializing chart:`, err);
        }
      }
    };
    pollCanvas();
  }

  function destroyPlayTimeByMonthChart() {
    Chart.getChart(`playtime-by-month-chart`)?.destroy();
  }

  export function onEnter() {
    destroyPlayTimeByMonthChart();
    showPlaytimeByMonthChart();
  }
  export function onExit() {
    // destroyPlayTimeByMonthChart();
    doPollCanvas = false;
  }

  onMount(() => {
    showPlaytimeByMonthChart();
  });
</script>

<div class="relative h-screen text-center pt-10">
  <h2 class="text-2xl font-medium mt-5">
    Your Total Playtime{#if informationSource !== "playbackReport"}
      <!-- svelte-ignore event_directive_deprecated -->
      <button
        class="inline-flex flex-row align-items-start hover:text-gray-700 cursor-pointer"
        title="Learn about data accuracy"
        tabindex="0"
        onkeydown={stopPropagation(() => {
          isAccuracyDisclaimerOpen.set(true);
        })}
        onclick={stopPropagation(() => {
          console.log(`click:`);
          isAccuracyDisclaimerOpen.set(true);
        })}
      >
        <StarIcon />
      </button>
    {/if}<br />of {$rewindReport.jellyfinRewindReport?.year}:
  </h2>

  <div class="mt-10 -rotate-6 font-quicksand font-bold text-sky-500 text-3xl">
    <span class="">{
      showAsNumber(
        $rewindReport.jellyfinRewindReport.generalStats
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
          $rewindReport.jellyfinRewindReport.generalStats?.[
            `totalPlays`
          ]?.[informationSource],
        )
      }</span> total streams.
    </div>
    <div>
      <span class="font-semibold">{
        showAsNumber(
          $rewindReport.jellyfinRewindReport.generalStats?.[
            `uniqueTracksPlayed`
          ],
        )
      }</span> unique tracks.
    </div>
    <div>
      <span class="font-semibold">{
        showAsNumber(
          $rewindReport.jellyfinRewindReport.generalStats?.[
            `uniqueArtistsPlayed`
          ],
        )
      }</span> unique artists.
    </div>
    <div>
      <span class="font-semibold">{
        showAsNumber(
          $rewindReport.jellyfinRewindReport.generalStats?.[
            `uniqueAlbumsPlayed`
          ],
        )
      }</span> unique albums.
    </div>
  </div>

  <div class="absolute w-full bottom-25 py-4">
    <div class="w-full flex flex-row justify-center">
      <canvas
        id="playtime-by-month-chart"
        class={extraFeatures().totalPlaytimeGraph
          ? `h-full`
          : `h-fullopacity-30`}
      ></canvas>
      {#if extraFeatures().totalPlaytimeGraph}
        <br />
      {:else}
        <Unavailable bind:this={unavailableOverlay}>
          <UnavailableReasonPlaybackReporting
            closeModal={() => unavailableOverlay.closeModal()}
          />
        </Unavailable>
      {/if}
    </div>
  </div>
</div>
