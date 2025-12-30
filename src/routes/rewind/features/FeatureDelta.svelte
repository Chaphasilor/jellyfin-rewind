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
    <Unavailable />
  {/if}
</div>
