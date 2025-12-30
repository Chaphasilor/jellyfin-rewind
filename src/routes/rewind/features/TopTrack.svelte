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

<div class="text-center text-white">
  <h2 class="text-2xl mt-5">
    Your Top Track<br />of {$lightRewindReport.jellyfinRewindReport?.year}:
  </h2>
  <div class="flex mt-10 flex-col">
    <img
      id="top-track-image"
      class="w-[30vh] h-[30vh] mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]"
    />
    <div class="px-4 py-4 overflow-hidden whitespace-wrap">
      <div class="-rotate-6 -ml-10 mt-10 text-4xl font-semibold">
        <div class="">
          {
            $lightRewindReport.jellyfinRewindReport.tracks?.[
              rankingMetric
            ]?.[0].artistsBaseInfo.reduce(
              (acc, cur, index) =>
                index > 0 ? `${acc} & ${cur.name}` : cur.name,
              ``,
            )
          } -
        </div>
        <div class="mt-8 ml-10">
          {
            $lightRewindReport.jellyfinRewindReport.tracks
              ?.[rankingMetric]?.[0]?.name
          }
        </div>
      </div>
    </div>
  </div>
  <div
    class="absolute bottom-20 left-0 w-full flex flex-col items-center gap-3"
  >
    <div>
      Streamed <span class="font-semibold">{
        showAsNumber(
          $lightRewindReport.jellyfinRewindReport.tracks
            ?.[rankingMetric]?.[0]?.playCount[
              informationSource
            ],
        )
      }</span> times.
    </div>
    <div>
      Listened for <span class="font-semibold">{
        showAsNumber(
          $lightRewindReport.jellyfinRewindReport.tracks
            ?.[rankingMetric]?.[0]
            ?.totalPlayDuration[
              informationSource
            ]?.toFixed(0),
        )
      }</span> minutes.
    </div>
  </div>
</div>
<div
  class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 md:translate-x-1/3 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]"
>
  <img id="top-track-background-image" class="w-full h-full" />
</div>
