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
  <h2 class="text-2xl font-medium mt-10">Your Listening Habits</h2>
  <h3 class="text-2xl font-medium">...compared to last year!</h3>

  <div class="mt-24 w-full px-6 flex flex-col items-center gap-2">
    <div class="font-semibold text-xl">
      This year, you had <span
        class="font-semibold text-3xl text-sky-500 font-quicksand"
      >{
        extraFeatures().listeningActivityDifference
          ? showAsNumber(
            Math.abs(
              $lightRewindReport.jellyfinRewindReport?.featureDelta
                ?.listeningActivityDifference?.totalPlays[
                  informationSource
                ] ?? 0,
            ).toFixed(0),
          )
          : `???`
      }</span>
      {
        !extraFeatures().listeningActivityDifference ||
            ($lightRewindReport.jellyfinRewindReport?.featureDelta
                ?.listeningActivityDifference
                ?.totalPlays[informationSource] ?? 0) >= 0
          ? `more`
          : `less`
      } streams than in {
        $lightRewindReport.jellyfinRewindReport
          ?.featureDelta?.year ??
          $lightRewindReport.jellyfinRewindReport?.year - 1
      }.
    </div>
  </div>

  <div class="mt-28 w-full px-10 flex flex-col items-center gap-3">
    <span class="font-semibold text-xl mb-3">You listened to</span>
    <div>
      <span class="font-semibold text-xl"><span
          class="text-3xl text-sky-500 font-quicksand"
        >{
          extraFeatures().listeningActivityDifference
            ? showAsNumber(
              Math.abs(
                $lightRewindReport.jellyfinRewindReport?.featureDelta
                  ?.listeningActivityDifference?.uniquePlays.tracks ??
                  0,
              ),
            )
            : `???`
        }</span>
        {
          !extraFeatures().listeningActivityDifference ||
              ($lightRewindReport.jellyfinRewindReport?.featureDelta
                  ?.listeningActivityDifference?.uniquePlays.tracks ??
                  0) >= 0
            ? `more`
            : `less`
        } unique tracks.</span>
    </div>
    <div>
      <span class="font-semibold text-xl"><span
          class="text-3xl text-sky-500 font-quicksand"
        >{
          extraFeatures().listeningActivityDifference
            ? showAsNumber(
              Math.abs(
                $lightRewindReport.jellyfinRewindReport?.featureDelta
                  ?.listeningActivityDifference?.uniquePlays
                  .artists ?? 0,
              ),
            )
            : `???`
        }</span>
        {
          !extraFeatures().listeningActivityDifference ||
              ($lightRewindReport.jellyfinRewindReport?.featureDelta
                  ?.listeningActivityDifference?.uniquePlays
                  .artists ?? 0) >= 0
            ? `more`
            : `less`
        } unique artists.</span>
    </div>
    <div>
      <span class="font-semibold text-xl"><span
          class="text-3xl text-sky-500 font-quicksand"
        >{
          extraFeatures().listeningActivityDifference
            ? showAsNumber(
              Math.abs(
                $lightRewindReport.jellyfinRewindReport?.featureDelta
                  ?.listeningActivityDifference?.uniquePlays.albums ??
                  0,
              ),
            )
            : `???`
        }</span>
        {
          !extraFeatures().listeningActivityDifference ||
              ($lightRewindReport.jellyfinRewindReport?.featureDelta
                  ?.listeningActivityDifference?.uniquePlays.albums ??
                  0) >= 0
            ? `more`
            : `less`
        } unique albums.</span>
    </div>
  </div>

  <div class="mt-24 w-full px-6 flex flex-col items-center gap-2">
    <div class="font-semibold text-xl">
      You {
        !extraFeatures().listeningActivityDifference ||
            ($lightRewindReport.jellyfinRewindReport?.featureDelta
                ?.favoriteDifference ?? 0) >= 0
          ? `added`
          : `removed`
      }
      <span class="font-semibold text-3xl text-sky-500 font-quicksand">{
        extraFeatures().listeningActivityDifference
          ? showAsNumber(
            Math.abs(
              $lightRewindReport.jellyfinRewindReport?.featureDelta
                ?.favoriteDifference ?? 0,
            ),
          )
          : `???`
      }</span> favorites.
    </div>
  </div>

  {#if extraFeatures().listeningActivityDifference}
    <div class="mt-16 w-full px-10">
      <span class="font-semibold text-xl">{
        ($lightRewindReport.jellyfinRewindReport?.featureDelta
            ?.listeningActivityDifference?.totalPlays[informationSource] ??
            0) >=
            0
          ? `Keep it up!`
          : `What's going on there?`
      }</span>
    </div>
  {/if}

  {#if !extraFeatures().listeningActivityDifference}
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
            //TODO showOverlayFeatureUnavailableMissingOldReport(),
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
