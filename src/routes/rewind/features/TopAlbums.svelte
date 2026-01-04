<script lang="ts">
  import { rewindReport } from "$lib/globals";
  import { onMount } from "svelte";
  import { showPlaying } from "$lib/utility/other";
  import type { FeatureProps } from "$lib/types";
  import { formatArtists, showAsNumber } from "$lib/utility/format";
  import {
    loadImage,
    loadTracksForGroup,
  } from "$lib/utility/jellyfin-helper";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    fadeToNextTrack,
  }: FeatureProps = $props();

  // plays a random track from the top 5 albums (excluding the top album)
  async function playTopAlbums() {
    const topAlbums = $rewindReport.jellyfinRewindReport.albums
      ?.[rankingMetric][informationSource]?.slice(1, 5); // first album excluded
    const randomAlbumId = Math.floor(Math.random() * topAlbums.length);
    const randomAlbum = topAlbums[randomAlbumId];
    console.log(`randomAlbum:`, randomAlbum);
    showPlaying(`#top-albums-visualizer`, randomAlbumId + 1, 5);

    let albumsTracks = await loadTracksForGroup(randomAlbum.id, `album`);
    let randomTrackId = Math.floor(Math.random() * albumsTracks.length);
    let randomTrack = albumsTracks[randomTrackId];
    console.log(`randomTrack:`, randomTrack);

    fadeToNextTrack({ id: randomTrack.Id });
  }

  export function onEnter() {
    playTopAlbums();
  }
  export function onExit() {
  }

  onMount(() => {
    const topAlbums = $rewindReport.jellyfinRewindReport.albums
      ?.[rankingMetric][informationSource]?.slice(0, 5);

    topAlbums.forEach((album, index) => {
      const albumPrimaryImage = document.querySelector(
        `#top-albums-image-${index}`,
      );
      const albumBackgroundImage = document.querySelector(
        `#top-albums-background-image-${index}`,
      );
      console.log(`img:`, albumPrimaryImage);
      loadImage(
        [albumPrimaryImage, albumBackgroundImage],
        album.image,
        `album`,
      );
    });
  });
</script>

<div class="text-center pt-10">
  <h2 class="text-2xl font-medium mt-5">Your Top Albums<br />of the year</h2>
  <ol id="top-albums-main-feature" class="flex flex-col gap-2 p-6">
    {#each       $rewindReport.jellyfinRewindReport.albums
        ?.[rankingMetric][informationSource]
        ?.slice(0, 5) as
      album,
      index
      (album.id)
    }
      <li
        class="relative z-[10] flex flex-row items-center bg-gray-800 gap-4 overflow-hidden px-4 py-2 rounded-xl"
      >
        <div
          class="relative w-[8vh] h-[8vh] flex-shrink-0 rounded-md overflow-hidden"
        >
          <img id={`top-albums-image-${index}`} class="w-full h-full" />
          <div
            id={`top-albums-visualizer-${index}`}
            class="absolute top-0 left-0 w-full h-full grid place-content-center text-white bg-black/30 hidden"
          >
          </div>
        </div>
        <div
          class="flex flex-col gap-1 justify-center bg-black/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md"
        >
          <div class="flex flex-col gap-0.25 items-start">
            <div
              class="flex flex-row w-full justify-start items-center whitespace-nowrap"
            >
              <span class="font-semibold text-base mr-2">{index + 1}.</span>
              <span
                class="font-semibold text-base leading-tight text-ellipsis overflow-hidden"
              >{album.name}</span>
            </div>
            <span
              class="text-sm ml-2 max-h-[2em] w-full text-start whitespace-nowrap text-ellipsis overflow-hidden"
            >{formatArtists(album.artists.map((x) => x.name))}</span>
          </div>
          <div
            class="flex flex-row justify-start font-medium text-gray-300 gap-0.5 items-center text-xs"
          >
            <div>
              <span class="font-semibold text-white">{
                showAsNumber(album.playCount[informationSource])
              }</span>
              streams
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
            <div>
              <span class="font-semibold text-white">{
                showAsNumber(
                  album.totalPlayDuration[informationSource]
                    .toFixed(0),
                )
              }</span>
              minutes
            </div>
          </div>
        </div>
        <div
          class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]"
        >
          <img
            id={`top-albums-background-image-${index}`}
            class="w-full h-full"
          />
        </div>
      </li>
    {/each}
  </ol>
</div>
<!-- continue as simple list -->
<ol
  class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40"
>
  {#each     $rewindReport.jellyfinRewindReport.albums
      ?.[rankingMetric][informationSource]?.slice(
        5,
        20,
      ) as
    album,
    index
    (album.id)
  }
    <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
      <div class="flex flex-col gap-1 w-full">
        <div class="flex flex-col gap-0.25 items-start">
          <div
            class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center"
          >
            <span class="font-semibold mr-2">{index + 1 + 5}.</span>
            <span
              class="font-base leading-tight text-ellipsis overflow-hidden"
            >{album.name}</span>
          </div>
          <div class="ml-6 max-h-[2rem] text-xs">
            <span class="font-semibold">{
              formatArtists(album.artists?.map((x) => x.name))
            }</span>
          </div>
        </div>
      </div>
    </li>
  {/each}
</ol>
