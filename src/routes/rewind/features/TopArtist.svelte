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
    Your Top Artist<br />of {$lightRewindReport?.year}:
  </h2>
  <div class="flex mt-10 flex-col">
    <img
      id="top-artist-image"
      class="w-[30vh] h-[30vh] mx-auto rounded-2xl drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]"
    />
    <div class="px-4 py-4 overflow-hidden whitespace-wrap">
      <div class="-rotate-6 mt-16 text-5xl font-semibold">
        <div class="">
          {$lightRewindReport.artists?.[rankingMetric]?.[0]?.name}
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
          $lightRewindReport.artists?.[rankingMetric]?.[0]?.playCount?.[
            informationSource
          ],
        )
      }</span> times.
    </div>
    <div>
      Listened to <span class="font-semibold">{
        showAsNumber(
          $lightRewindReport.artists?.[rankingMetric]?.[0]
            ?.uniquePlayedTracks?.[informationSource],
        )
      }</span>
      unique tracks <br />for
      <span class="font-semibold">{
        showAsNumber(
          $lightRewindReport.artists?.[rankingMetric]?.[0]
            ?.totalPlayDuration[
              informationSource
            ].toFixed(0),
        )
      }</span> minutes.
    </div>
  </div>
</div>
<div
  class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 md:translate-x-1/3 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]"
>
  <img id="top-artist-background-image" class="w-full h-full" />
</div>
