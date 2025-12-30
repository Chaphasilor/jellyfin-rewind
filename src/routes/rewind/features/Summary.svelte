<script lang="ts">
  import Chart from "chart.js/auto";
  import { lightRewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { indexOfMax, indexOfMin } from "$lib/utility/other";
  import { CounterSources, type FeatureProps } from "$lib/types";
  import { showAsNumber } from "$lib/utility/format";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import { loadImage } from "$lib/utility/jellyfin-helper";

  const { informationSource, rankingMetric, extraFeatures }: FeatureProps =
    $props();

  onMount(() => {
    console.log(`summary`);

    // top track
    const topTrackPrimaryImage = document.querySelector(
      `#summary-top-track-image`,
    );
    console.log(`img:`, topTrackPrimaryImage);
    const topTrack =
      $lightRewindReport.jellyfinRewindReport.tracks?.[rankingMetric]?.[0];
    console.log(`topTrack:`, topTrack);

    // top artist
    const topArtistPrimaryImage = document.querySelector(
      `#summary-top-artist-image`,
    );
    console.log(`img:`, topArtistPrimaryImage);
    const topArtist =
      $lightRewindReport.jellyfinRewindReport.artists?.[rankingMetric]?.[0];
    console.log(`topArtist:`, topArtist);

    // most successive plays
    const mostSuccessivePlaysTrackPrimaryImage = document.querySelector(
      `#summary-most-successive-streams-track-image`,
    );
    console.log(`img:`, mostSuccessivePlaysTrackPrimaryImage);
    const mostSuccessivePlaysTrack =
      $lightRewindReport.jellyfinRewindReport.generalStats?.mostSuccessivePlays
        ?.track;
    console.log(`mostSuccessivePlaysTrack:`, mostSuccessivePlaysTrack);

    // load images
    loadImage([topTrackPrimaryImage], topTrack.image, `track`);
    loadImage([topArtistPrimaryImage], topArtist.images.primary, `artist`);
    if (extraFeatures().mostSuccessivePlays) {
      loadImage(
        [mostSuccessivePlaysTrackPrimaryImage],
        mostSuccessivePlaysTrack.image,
        `track`,
      );
    }
  });
</script>

<div class="h-full p-4 flex flex-col justify-around">
  <h2
    class="text-2xl mt-8 font-quicksand leading-8 flex flex-col items-center gap-1.5 text-center font-semibold text-gray-800 dark:text-gray-200"
  >
    <span>{$lightRewindReport.jellyfinRewindReport?.user?.name}'s</span>
    <div class="w-full flex flex-col items-center">
      <JellyfinRewindLogo />
    </div>
    <span
      >Report <span class="text-[#00A4DC] text-2xl font-semibold font-quicksand"
        >{$lightRewindReport.jellyfinRewindReport?.year}</span
      ></span
    >
  </h2>

  <div
    class="grid grid-cols-2 place-items-stretch gap-1 w-full mt-6 pb-20 text-gray-800 dark:text-gray-100"
  >
    <div
      class="overflow-hidden border-2 border-black/5 dark:border-white/5 text-center p-1 flex flex-col justify-center items-center rounded-md col-span-2"
    >
      <!-- duration -->
      <div class="text-lg">
        <span class="text-[#00A4DC] text-2xl font-semibold font-quicksand"
          >{showAsNumber(
            $lightRewindReport.jellyfinRewindReport.generalStats.totalPlaybackDurationMinutes[
              informationSource
            ].toFixed(0),
          )}</span
        > minutes listened
      </div>
    </div>
    <div
      class="overflow-hidden border-2 border-black/5 dark:border-white/5 p-1 rounded-md text-center flex flex-col justify-end items-center"
    >
      <!-- top track -->
      <h4 class="text-xs">Top Track</h4>
      <img
        id="summary-top-track-image"
        class="w-auto h-[5rem] my-1.5 rounded-md"
      />
      <div class="text-balance">
        <span class="text-[#00A4DC] font-semibold font-quicksand"
          >{$lightRewindReport.jellyfinRewindReport.tracks?.[rankingMetric]?.[0]
            ?.name}</span
        >
        <span class=""
          >by {$lightRewindReport.jellyfinRewindReport.tracks?.[
            rankingMetric
          ]?.[0]?.artistsBaseInfo?.reduce(
            (acc, cur, index) =>
              index > 0 ? `${acc} & ${cur.name}` : cur.name,
            ``,
          )}</span
        >
      </div>
    </div>
    <div
      class="overflow-hidden border-2 border-black/5 dark:border-white/5 p-1 rounded-md text-center flex flex-col justify-end items-center"
    >
      <!-- top artist -->
      <h4 class="text-xs">Top Artist</h4>
      <img
        id="summary-top-artist-image"
        class="w-auto h-[5rem] my-1.5 rounded-md"
      />
      <div class="text-balance">
        <span class="text-[#00A4DC] font-semibold font-quicksand"
          >{$lightRewindReport.jellyfinRewindReport.artists?.[
            rankingMetric
          ]?.[0]?.name}</span
        >
      </div>
    </div>
    {#if extraFeatures().totalMusicDays}
      <div
        class="overflow-hidden border-2 border-black/5 dark:border-white/5 p-1 text-center rounded-md grid place-content-center"
      >
        <!-- days listened to music -->
        <div class="text-xl text-balance">
          Listened on
          <span class="font-semibold text-[#00A4DC] text-3xl font-quicksand"
            >{showAsNumber(
              $lightRewindReport.jellyfinRewindReport.generalStats
                .totalMusicDays,
            )}</span
          >
          days
        </div>
      </div>
    {/if}
    <div
      class="overflow-hidden border-2 border-black/5 dark:border-white/5 py-1 px-3 rounded-md"
    >
      <!-- stats 1 - unique items -->
      <div>
        <span class="font-semibold text-[#00A4DC] font-quicksand"
          >{showAsNumber(
            $lightRewindReport.jellyfinRewindReport.generalStats
              .uniqueTracksPlayed,
          )}</span
        > unique tracks
      </div>
      <div>
        <span class="font-semibold text-[#00A4DC] font-quicksand"
          >{showAsNumber(
            $lightRewindReport.jellyfinRewindReport.generalStats
              .uniqueArtistsPlayed,
          )}</span
        > unique artists
      </div>
      <div>
        <span class="font-semibold text-[#00A4DC] font-quicksand"
          >{showAsNumber(
            $lightRewindReport.jellyfinRewindReport.generalStats
              .uniqueAlbumsPlayed,
          )}</span
        > unique albums
      </div>
    </div>
    {#if extraFeatures().mostSuccessivePlays}
      <div
        class="overflow-hidden border-2 border-black/5 dark:border-white/5 p-1 rounded-md text-center flex flex-col justify-end items-center"
      >
        <!-- most successive plays -->
        <h4 class="text-xs">Most Successive Streams</h4>
        <img
          id="summary-most-successive-streams-track-image"
          class="w-auto h-[5rem] my-1.5 rounded-md"
        />
        <div class="text-balance">
          <span class="text-[#00A4DC] font-semibold font-quicksand"
            >{$lightRewindReport.jellyfinRewindReport.generalStats
              .mostSuccessivePlays?.name}</span
          >
          <span class=""
            >by {$lightRewindReport.jellyfinRewindReport.generalStats.mostSuccessivePlays?.artists?.reduce(
              (acc, cur, index) =>
                index > 0 ? `${acc} & ${cur.name}` : cur.name,
              ``,
            )}</span
          >
        </div>
      </div>
    {/if}
    <div
      class="overflow-hidden border-2 border-black/5 dark:border-white/5 py-1 px-3 rounded-md text-center flex flex-col items-center justify-around"
    >
      <!-- stats 1 - unique items -->
      <div class="text-balance">
        Library Duration: <span
          class="font-semibold text-[#00A4DC] text-2xl font-quicksand"
          >{showAsNumber(
            (
              $lightRewindReport.jellyfinRewindReport?.libraryStats
                ?.totalRuntime /
              60.0 /
              60.0 /
              24.0
            ).toFixed(1),
          )}</span
        > days
      </div>
      <div class="text-balance">
        Average track length: <span
          class="font-semibold text-[#00A4DC] text-2xl font-quicksand"
          >{showAsNumber(
            $lightRewindReport.jellyfinRewindReport?.libraryStats?.trackLength?.mean.toFixed(
              0,
            ),
          )}</span
        > seconds
      </div>
    </div>
    {#if extraFeatures().listeningActivityDifference}
      <div
        class="overflow-hidden border-2 border-black/5 dark:border-white/5 p-1 rounded-md col-span-2"
      >
        <!-- stats 2 - listening activity difference (if positive) -->
        {#if ($lightRewindReport.jellyfinRewindReport?.featureDelta?.listeningActivityDifference?.totalPlays[informationSource] ?? 0) > 0}
          <div class="text-center mb-2">
            <span class="font-semibold font-quicksand text-[#00A4DC] text-lg"
              >{showAsNumber(
                Math.abs(
                  $lightRewindReport.jellyfinRewindReport?.featureDelta
                    ?.listeningActivityDifference?.totalPlays[
                    informationSource
                  ] ?? 0,
                ).toFixed(0),
              )}</span
            >
            more streams than last year
          </div>
        {/if}
        <div class="flex flex-row flex-wrap justify-around gap-4">
          {#if ($lightRewindReport.jellyfinRewindReport?.featureDelta?.listeningActivityDifference?.uniquePlays.tracks ?? 0) >= 0}
            <div class="text-center">
              <span class="text-lg text-[#00A4DC] font-semibold font-quicksand"
                >{showAsNumber(
                  Math.abs(
                    $lightRewindReport.jellyfinRewindReport?.featureDelta
                      ?.listeningActivityDifference?.uniquePlays.tracks ?? 0,
                  ),
                )}</span
              ><br />more tracks
            </div>
          {/if}
          {#if ($lightRewindReport.jellyfinRewindReport?.featureDelta?.listeningActivityDifference?.uniquePlays.artists ?? 0) >= 0}
            <div class="text-center">
              <span class="text-lg text-[#00A4DC] font-semibold font-quicksand"
                >{showAsNumber(
                  Math.abs(
                    $lightRewindReport.jellyfinRewindReport?.featureDelta
                      ?.listeningActivityDifference?.uniquePlays.artists ?? 0,
                  ),
                )}</span
              ><br />more artists
            </div>
          {/if}
          {#if ($lightRewindReport.jellyfinRewindReport?.featureDelta?.listeningActivityDifference?.uniquePlays.albums ?? 0) >= 0}
            <div class="text-center">
              <span class="text-lg text-[#00A4DC] font-semibold font-quicksand"
                >{showAsNumber(
                  Math.abs(
                    $lightRewindReport.jellyfinRewindReport?.featureDelta
                      ?.listeningActivityDifference?.uniquePlays.albums ?? 0,
                  ),
                )}</span
              ><br />more albums
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
