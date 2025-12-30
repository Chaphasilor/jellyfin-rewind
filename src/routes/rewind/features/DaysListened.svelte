<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import { Spring } from "svelte/motion";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  const musicDays = new Spring(0, {
    stiffness: 0.005,
    damping: 0.015,
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
    <div
      class="absolute top-0 left-0 grid content-center w-full h-full px-8 bg-black/50 backdrop-saturate-25"
    >
      <div
        class="flex flex-col items-center justify-center gap-12 bg-black/75 p-8 pt-16 rounded-xl"
      >
        <span class="text-5xl rotate-12 text-[#00A4DC] tracking-wider font-bold"
        >Unavailable</span>
        <button
          on:click|stopPropagation={() => {
            //TODO showOverlayFeatureUnavailableMissingPlaybackReporting(),
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
