<script lang="ts">
  import Chart from "chart.js/auto";
  import { processingResult } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";

  let canvas: HTMLCanvasElement;

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  let actualInformationSource: CounterSources = $state(
    CounterSources.PLAYBACK_REPORTING,
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let duration = Array.from({ length: 12 }).fill(0) as number[];
  let plays = Array.from({ length: 12 }).fill(0) as number[];
  let skips = Array.from({ length: 12 }).fill(0) as number[];

  let monthWithMostSkips = $state("");
  let mostSkips = $state(0);
  let monthWithMostDuration = $state("");
  let mostDuration = $state(0);
  let monthWithMostPlays = $state("");
  let mostPlays = $state(0);

  let monthWithLeastSkips = $state("");
  let leastSkips = $state(0);
  let monthWithLeastDuration = $state("");
  let leastDuration = $state(0);
  let monthWithLeastPlays = $state("");
  let leastPlays = $state(0);

  export function onEnter() {
  }
  export function onExit() {
  }

  onMount(() => {
    const rawData = $processingResult.monthOfYear.entries;

    rawData.forEach(([month, d]) => {
      const i = parseInt(month);
      duration[i] = Math.round(
        // @ts-expect-error TS doesn't understand d.counters is indexable
        d.counters[actualInformationSource].listenDuration / 60,
      );
      // @ts-expect-error TS doesn't understand d.counters is indexable
      plays[i] = d.counters[actualInformationSource].fullPlays +
        // @ts-expect-error TS doesn't understand d.counters is indexable
        d.counters[actualInformationSource].partialSkips;
      // @ts-expect-error TS doesn't understand d.counters is indexable
      skips[i] = d.counters[actualInformationSource].fullSkips +
        // @ts-expect-error TS doesn't understand d.counters is indexable
        d.counters[actualInformationSource].partialSkips;
    });

    mostDuration = indexOfMax(duration);
    mostPlays = indexOfMax(plays);
    mostSkips = indexOfMax(skips);
    monthWithMostDuration = months[mostDuration];
    monthWithMostPlays = months[mostPlays];
    monthWithMostSkips = months[mostSkips];

    leastDuration = indexOfMin(duration);
    leastPlays = indexOfMin(plays);
    leastSkips = indexOfMin(skips);
    monthWithLeastDuration = months[leastDuration];
    monthWithLeastPlays = months[leastPlays];
    monthWithLeastSkips = months[leastSkips];

    console.log(
      mostDuration,
      mostPlays,
      monthWithMostDuration,
      monthWithMostPlays,
      leastDuration,
      leastPlays,
      monthWithLeastDuration,
      monthWithLeastPlays,
    );

    new Chart(canvas.getContext("2d")!, {
      type: "bar",
      options: {
        scales: {
          playtime: {
            title: {
              text: "Listen duration in minutes",
              display: true,
            },
            position: "bottom",
            min: 0,
            max: Math.max(...duration),
          },
          plays: {
            title: {
              text: "Number of Plays",
              display: true,
            },
            position: "top",
            min: 0,
            max: Math.max(...plays),
          },
        },
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
      data: {
        yLabels: months,
        datasets: [
          {
            label: "Listen duration",
            data: duration,
            xAxisID: "playtime",
            backgroundColor: "rgba(241, 181, 57, 0.2)",
            borderRadius: 6,
            borderColor: "rgba(241, 181, 57, 0.7)",
            borderWidth: 1,
          },
          {
            label: "Plays",
            data: plays,
            xAxisID: "plays",
            backgroundColor: "rgba(133, 181, 227, 0.2)",
            borderRadius: 6,
            borderColor: "rgba(133, 181, 227, 0.7)",
            borderWidth: 1,
          },
        ],
      },
    });
  });
</script>

<br /><br /><br /><br />

{#if monthWithMostDuration == monthWithMostPlays}
  <h4>
    In <b>{monthWithMostDuration}</b>
    you had the most playbacks and playtime with
    <b>{duration[mostDuration]}
      minutes</b>
    during
    <b>{plays[mostPlays]} plays</b>!
  </h4>
{:else}
  <h4>
    In <b>{monthWithMostDuration}</b>
    you listened to the most amount of music at a wrapping
    <b>{duration[mostDuration]} minutes</b>!
  </h4>
  <br />
  <h4>
    The most playbacks happened during
    <b>{monthWithMostPlays}</b>
    with <b>{plays[mostPlays]} plays</b>!
  </h4>
{/if}

<br /><br />

{#if monthWithLeastDuration == monthWithLeastPlays}
  <h5>
    On the contrary <b>{monthWithLeastDuration}</b>
    was your least active month with
    <b>{duration[leastDuration]} minutes</b> shared across
    <b>{plays[leastPlays]} plays</b>.
  </h5>
{:else}
  <h5>
    On the other hand <b>{monthWithLeastDuration}</b>
    was quiet with only
    <b>{duration[leastDuration]} minutes</b>
    of playback.
  </h5>
  <br />
  <h5>
    With only <b>{plays[leastPlays]} plays</b> the month of
    <b>{monthWithLeastPlays}</b> holds the record for least plays.
  </h5>
{/if}

<br /><br />

<h5>
  <b>{monthWithLeastSkips}</b> made you listen more actively than any other
  month with just <b>{skips[leastSkips]} skips</b> while
  <b>{monthWithMostSkips}</b> was the month with the most skips at a total of
  <b>{skips[mostSkips]}</b>.
</h5>

<br /><br /><br /><br /><br /><br />

<h2>You can also inspect the data yourself!</h2>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    max-height: 40rem;
  }
  h4,
  h5 {
    max-width: 30rem;
    margin: auto;
  }
</style>
