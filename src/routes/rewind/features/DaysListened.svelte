<script lang="ts">
  import Chart from "chart.js/auto";
  import { rewindReport, year } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import { Spring } from "svelte/motion";
  import Unavailable from "$lib/components/Unavailable.svelte";
  import { goto } from "$app/navigation";
  import UnavailableReasonPlaybackReporting from "$lib/components/UnavailableReasonPlaybackReporting.svelte";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  // svelte-ignore non_reactive_update
  let unavailableOverlay: Unavailable;

  const musicDays = new Spring(0, {
    stiffness: 0.025,
    damping: 0.05,
    precision: 0.075,
  });

  export function onEnter() {
    musicDays.set(0, {
      instant: true,
    });
    setTimeout(() => {
      musicDays.set(
        $rewindReport.jellyfinRewindReport.generalStats.totalMusicDays,
        {
          instant: false,
        },
      );
    }, 1000);
  }
  export function onExit() {
    setTimeout(() => {
      musicDays.set(0, {
        instant: true,
      });
    }, 500);
  }

  onMount(() => {
    if (extraFeatures().totalMusicDays) {
      musicDays.set(0, {
        instant: true,
      });
      onEnter();
    }
  });
</script>

<div class="text-center pt-10">
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
      {#if       $rewindReport.jellyfinRewindReport.generalStats.totalMusicDays <
        364}
        <div>
          <span class="font-semibold text-sm text-center"
          >What did you do on the {(365 - musicDays.target).toFixed(0)} missing
            days?!</span>
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
        >On those {musicDays.target.toFixed(0)}
          days,<br />you listened to
          <span class="text-3xl text-sky-500 font-quicksand">{
            showAsNumber(
              $rewindReport.jellyfinRewindReport?.generalStats
                ?.minutesPerDay?.mean.toFixed(
                  0,
                ),
            )
          }</span> minutes per day on average.</span>
      </div>
      <div>
        <span class="font-semibold text-xl"
        >That's <span class="text-2xl text-sky-500 font-quicksand">{
            showAsNumber(
              (
                $rewindReport.jellyfinRewindReport?.generalStats
                  ?.minutesPerDay?.mean / 60.0
              ).toFixed(2),
            )
          }</span>
          hours or
          <span class="text-2xl text-sky-500 font-quicksand">{
              showAsNumber(
                (
                  ($rewindReport.jellyfinRewindReport?.generalStats
                    ?.minutesPerDay?.mean /
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
            $rewindReport.jellyfinRewindReport?.generalStats
              ?.minutesPerDay?.median.toFixed(
                1,
              ),
          )
        }</span> minutes, for those who care)
      </div>
    </div>
  {/if}

  {#if !extraFeatures().totalMusicDays}
    <Unavailable bind:this={unavailableOverlay}>
      <UnavailableReasonPlaybackReporting
        closeModal={() => unavailableOverlay.closeModal()}
      />
    </Unavailable>
  {/if}
</div>
