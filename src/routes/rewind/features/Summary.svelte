<script lang="ts">
  import { rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import type { FeatureProps } from "$lib/types";
  import { formatArtists, showAsNumber } from "$lib/utility/format";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import { loadImage } from "$lib/utility/jellyfin-helper";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
  }: FeatureProps = $props();

  function playTopTrack() {
    const topTrackByDuration = $rewindReport.jellyfinRewindReport
      .tracks?.[rankingMetric][informationSource]?.[0];
    console.log(`topTrackByDuration:`, topTrackByDuration);
    fadeToNextTrack(topTrackByDuration);
  }

  export function onEnter() {
    playTopTrack();
  }
  export function onExit() {
  }

  onMount(() => {
    console.log(`summary`);

    // top track
    const topTrackPrimaryImage = document.querySelector(
      `#summary-top-track-image`,
    );
    console.log(`img:`, topTrackPrimaryImage);
    const topTrack = $rewindReport.jellyfinRewindReport.tracks
      ?.[rankingMetric][informationSource]?.[0];
    console.log(`topTrack:`, topTrack);

    // top artist
    const topArtistPrimaryImage = document.querySelector(
      `#summary-top-artist-image`,
    );
    console.log(`img:`, topArtistPrimaryImage);
    const topArtist = $rewindReport.jellyfinRewindReport.artists
      ?.[rankingMetric][informationSource]?.[0];
    console.log(`topArtist:`, topArtist);

    // most successive plays
    const mostSuccessivePlaysTrackPrimaryImage = document.querySelector(
      `#summary-most-successive-streams-track-image`,
    );
    console.log(`img:`, mostSuccessivePlaysTrackPrimaryImage);
    const mostSuccessivePlaysTrack = $rewindReport.jellyfinRewindReport
      .generalStats?.mostSuccessivePlays
      ?.track;
    console.log(`mostSuccessivePlaysTrack:`, mostSuccessivePlaysTrack);

    // load images
    loadImage([topTrackPrimaryImage], topTrack.image, `track`);
    loadImage([topArtistPrimaryImage], topArtist.images.primary, `artist`);
    if (extraFeatures().mostSuccessivePlays && mostSuccessivePlaysTrack) {
      loadImage(
        [mostSuccessivePlaysTrackPrimaryImage],
        mostSuccessivePlaysTrack.image,
        `track`,
      );
    }
  });
</script>

<div class="h-full pt-10 p-4 flex flex-col justify-around">
  <h2
    class="text-2xl mt-8 font-quicksand leading-8 flex flex-col items-center gap-1.5 text-center font-semibold text-gray-200"
  >
    <span>{$rewindReport.jellyfinRewindReport?.user?.name}'s</span>
    <div class="w-full flex flex-col items-center">
      <JellyfinRewindLogo />
    </div>
    <span>Report <span
        class="text-[#00A4DC] text-2xl font-semibold font-quicksand"
      >{$rewindReport.jellyfinRewindReport?.year}</span></span>
  </h2>

  <div
    class="grid grid-cols-2 place-items-stretch gap-1 w-full mt-6 pb-20 text-gray-100"
  >
    <div
      class="overflow-hidden border-2 border-white/5 text-center p-1 flex flex-col justify-center items-center rounded-md col-span-2"
    >
      <!-- duration -->
      <div class="text-lg">
        <span class="text-[#00A4DC] text-2xl font-semibold font-quicksand">{
          showAsNumber(
            $rewindReport.jellyfinRewindReport.generalStats
              .totalPlaybackDurationMinutes[
                informationSource
              ].toFixed(0),
          )
        }</span> minutes listened
      </div>
    </div>
    <div
      class="overflow-hidden border-2 border-white/5 p-1 rounded-md text-center flex flex-col justify-start items-center"
    >
      <!-- top track -->
      <h4 class="text-xs">Top Track</h4>
      <img
        id="summary-top-track-image"
        alt="top track"
        class="w-auto h-[5rem] my-1.5 rounded-md"
      />
      <div class="text-balance">
        <span class="text-[#00A4DC] font-semibold font-quicksand">{
          $rewindReport.jellyfinRewindReport.tracks
            ?.[rankingMetric][informationSource]?.[0]
            ?.name
        }</span>
        <span class="">{
          formatArtists(
            $rewindReport.jellyfinRewindReport.tracks?.[
              rankingMetric
            ][informationSource]?.[0]?.artistsBaseInfo?.map((x) =>
              x.name
            ),
          )
        }</span>
      </div>
    </div>
    <div
      class="overflow-hidden border-2 border-white/5 p-1 rounded-md text-center flex flex-col justify-start items-center"
    >
      <!-- top artist -->
      <h4 class="text-xs">Top Artist</h4>
      <img
        id="summary-top-artist-image"
        alt="top artist"
        class="w-auto h-[5rem] my-1.5 rounded-md"
      />
      <div class="text-balance">
        <span class="text-[#00A4DC] font-semibold font-quicksand">{
          $rewindReport.jellyfinRewindReport.artists?.[
            rankingMetric
          ][informationSource]?.[0]?.name
        }</span>
      </div>
    </div>
    {#if extraFeatures().totalMusicDays}
      <div
        class="overflow-hidden border-2 border-white/5 p-1 text-center rounded-md grid place-content-center"
      >
        <!-- days listened to music -->
        <div class="text-xl text-balance">
          Listened on
          <span class="font-semibold text-[#00A4DC] text-3xl font-quicksand">{
            showAsNumber(
              $rewindReport.jellyfinRewindReport.generalStats
                .totalMusicDays,
            )
          }</span>
          days
        </div>
      </div>
    {/if}
    <div
      class="overflow-hidden border-2 border-white/5 py-1 px-3 rounded-md"
    >
      <!-- stats 1 - unique items -->
      <div>
        <span class="font-semibold text-[#00A4DC] font-quicksand">{
          showAsNumber(
            $rewindReport.jellyfinRewindReport.generalStats
              .uniqueTracksPlayed,
          )
        }</span> unique tracks
      </div>
      <div>
        <span class="font-semibold text-[#00A4DC] font-quicksand">{
          showAsNumber(
            $rewindReport.jellyfinRewindReport.generalStats
              .uniqueArtistsPlayed,
          )
        }</span> unique artists
      </div>
      <div>
        <span class="font-semibold text-[#00A4DC] font-quicksand">{
          showAsNumber(
            $rewindReport.jellyfinRewindReport.generalStats
              .uniqueAlbumsPlayed,
          )
        }</span> unique albums
      </div>
    </div>
    {#if extraFeatures().mostSuccessivePlays}
      <div
        class="overflow-hidden border-2 border-white/5 p-1 rounded-md text-center flex flex-col justify-end items-center"
      >
        <!-- most successive plays -->
        <h4 class="text-xs">Most Successive Streams</h4>
        <img
          id="summary-most-successive-streams-track-image"
          alt="most successive streams track"
          class="w-auto h-[5rem] my-1.5 rounded-md"
        />
        <div class="text-balance">
          <span class="text-[#00A4DC] font-semibold font-quicksand">{
            $rewindReport.jellyfinRewindReport.generalStats
              .mostSuccessivePlays?.name
          }</span>
          <span class="">{
            formatArtists(
              $rewindReport.jellyfinRewindReport.generalStats
                .mostSuccessivePlays?.artists?.map((x) => x.name),
            )
          }</span>
        </div>
      </div>
    {/if}
    <div
      class="overflow-hidden border-2 border-white/5 py-1 px-3 rounded-md text-center flex flex-col items-center justify-around"
    >
      <!-- stats 1 - unique items -->
      Library Duration: <span
        class="font-semibold text-[#00A4DC] text-2xl font-quicksand"
      >{
        showAsNumber(
          (
            $rewindReport.jellyfinRewindReport?.libraryStats
              ?.totalRuntime /
            60.0 /
            60.0 /
            24.0
          ).toFixed(1),
        )
      }</span> days
    </div>
    <div
      class="overflow-hidden border-2 border-white/5 py-1 px-3 rounded-md text-center flex flex-col items-center justify-around"
    >
      Average track length: <span
        class="font-semibold text-[#00A4DC] text-2xl font-quicksand"
      >{
        showAsNumber(
          ($rewindReport.jellyfinRewindReport?.libraryStats
            ?.trackLength?.mean / 60).toFixed(
              2,
            ),
        )
      }</span> minutes
    </div>
    {#if extraFeatures().listeningActivityDifference}
      <div
        class="overflow-hidden border-2 border-white/5 p-1 rounded-md col-span-2"
      >
        <!-- stats 2 - listening activity difference (if positive) -->
        {#if         ($rewindReport.jellyfinRewindReport?.featureDelta
          ?.listeningActivityDifference
          ?.totalPlays[informationSource] ?? 0) > 0}
          <div class="text-center mb-2">
            <span class="font-semibold font-quicksand text-[#00A4DC] text-lg">{
              showAsNumber(
                Math.abs(
                  $rewindReport.jellyfinRewindReport?.featureDelta
                    ?.listeningActivityDifference?.totalPlays[
                      informationSource
                    ] ?? 0,
                ).toFixed(0),
              )
            }</span>
            more streams than last year
          </div>
        {/if}
        <div class="flex flex-row flex-wrap justify-around gap-4">
          {#if           ($rewindReport.jellyfinRewindReport?.featureDelta
            ?.listeningActivityDifference?.uniquePlays.tracks ?? 0) >=
            0}
            <div class="text-center">
              <span
                class="text-lg text-[#00A4DC] font-semibold font-quicksand"
              >{
                showAsNumber(
                  Math.abs(
                    $rewindReport.jellyfinRewindReport
                      ?.featureDelta
                      ?.listeningActivityDifference?.uniquePlays
                      .tracks ?? 0,
                  ),
                )
              }</span><br />more tracks
            </div>
          {/if}
          {#if           ($rewindReport.jellyfinRewindReport?.featureDelta
            ?.listeningActivityDifference?.uniquePlays.artists ??
            0) >= 0}
            <div class="text-center">
              <span
                class="text-lg text-[#00A4DC] font-semibold font-quicksand"
              >{
                showAsNumber(
                  Math.abs(
                    $rewindReport.jellyfinRewindReport
                      ?.featureDelta
                      ?.listeningActivityDifference?.uniquePlays
                      .artists ?? 0,
                  ),
                )
              }</span><br />more artists
            </div>
          {/if}
          {#if           ($rewindReport.jellyfinRewindReport?.featureDelta
            ?.listeningActivityDifference?.uniquePlays.albums ?? 0) >=
            0}
            <div class="text-center">
              <span
                class="text-lg text-[#00A4DC] font-semibold font-quicksand"
              >{
                showAsNumber(
                  Math.abs(
                    $rewindReport.jellyfinRewindReport
                      ?.featureDelta
                      ?.listeningActivityDifference?.uniquePlays
                      .albums ?? 0,
                  ),
                )
              }</span><br />more albums
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
