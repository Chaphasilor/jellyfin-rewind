<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import { Spring } from "svelte/motion";
    import Unavailable from "$lib/components/Unavailable.svelte";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  const musicDays = new Spring(0, {
    stiffness: 0.03,
    damping: 0.06,
    precision: 0.075,
  });

  onMount(() => {
    if (extraFeatures().totalMusicDays) {
      musicDays.set(0, {
        instant: true,
      });
      musicDays.set(
        $lightRewindReport.jellyfinRewindReport.generalStats.totalMusicDays,
        {
          instant: false,
        },
      );
    }
  });
</script>

<div class="text-center">
  <div class="mt-16 -rotate-6 font-quicksand text-sky-500 text-8xl">
    <span class="font-quicksand-bold">{
      extraFeatures().totalMusicDays
        ? musicDays.current.toFixed(0)
        : `???`
    }</span>
  </div>

  <div class="mt-16 w-full px-10 flex flex-col items-center gap-6">
    <div>
      <span class="font-semibold text-xl"
      >That's on how many days you listened to music through Jellyfin this
        year.</span>
    </div>
    {#if extraFeatures().totalMusicDays}
      {#if       $lightRewindReport.jellyfinRewindReport.generalStats
        .totalMusicDays < 364}
        <div>
          <span class="font-semibold text-sm text-center"
          >What did you do on the {
              (
                365 -
                $lightRewindReport.jellyfinRewindReport.generalStats
                  .totalMusicDays
              ).toFixed(0)
            } missing days?!</span>
        </div>
      {:else}
        <div>
          <span class="font-semibold text-sm text-center"
          >That's seriously impressive!</span>
        </div>
      {/if}
    {/if}
  </div>

  {#if extraFeatures().totalMusicDays}
    <div class="mt-24 w-full px-10 flex flex-col items-center gap-3">
      <div>
        <span class="font-semibold text-xl"
        >On those {
            $lightRewindReport.jellyfinRewindReport.generalStats
              .totalMusicDays
          }
          days,<br />you listened to
          <span class="text-3xl text-sky-500 font-quicksand">{
            showAsNumber(
              $lightRewindReport.jellyfinRewindReport?.generalStats
                ?.minutesPerDay?.mean
                .toFixed(0),
            )
          }</span> minutes per day on average.</span>
      </div>
      <div>
        <span class="font-semibold text-xl"
        >That's <span class="text-2xl text-sky-500 font-quicksand">{
            showAsNumber(
              (
                $lightRewindReport.jellyfinRewindReport?.generalStats
                  ?.minutesPerDay?.mean /
                60.0
              ).toFixed(2),
            )
          }</span>
          hours or
          <span class="text-2xl text-sky-500 font-quicksand">{
              showAsNumber(
                (
                  ($lightRewindReport.jellyfinRewindReport
                    ?.generalStats?.minutesPerDay
                    ?.mean /
                    60.0 /
                    24.0) *
                  100.0
                ).toFixed(1),
              )
            }%</span> of a day.</span>
      </div>
      <div class="font-semibold text-sm px-8 pt-6">
        (Median value is <span class="text-sky-500 font-quicksand">{
          showAsNumber(
            $lightRewindReport.jellyfinRewindReport?.generalStats
              ?.minutesPerDay?.median
              .toFixed(1),
          )
        }</span> minutes, for those who care)
      </div>
    </div>
  {/if}

  {#if !extraFeatures().totalMusicDays}
    <Unavailable />
  {/if}
</div>
