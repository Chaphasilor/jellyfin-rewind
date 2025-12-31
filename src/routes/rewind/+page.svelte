<script lang="ts">
  import { goto } from "$app/navigation";
  import { lightRewindReport, processingResult } from "$lib/globals";
  import type { FeatureEvents, FeatureProps } from "$lib/types";
  import { processingResultToRewindReport } from "$lib/utility/convert";
  import { logAndReturn } from "$lib/utility/logging";
  import { type Component, onMount } from "svelte";
  import Monthly from "./features/Monthly.svelte";
  import TotalPlaytime from "./features/TotalPlaytime.svelte";
  import TopTrack from "./features/TopTrack.svelte";
  import { on } from "svelte/events";
  import PageTransition from "$lib/components/PageTransition.svelte";
  import TopTracks from "./features/TopTracks.svelte";
  import DaysListened from "./features/DaysListened.svelte";
  import TopArtist from "./features/TopArtist.svelte";
  import TopArtists from "./features/TopArtists.svelte";
  import LibraryStats from "./features/LibraryStats.svelte";
  import TopAlbum from "./features/TopAlbum.svelte";
  import TopAlbums from "./features/TopAlbums.svelte";
  import TopGenres from "./features/TopGenres.svelte";
  import LeastSkipped from "./features/LeastSkipped.svelte";
  import MostSkipped from "./features/MostSkipped.svelte";
  import Summary from "./features/Summary.svelte";
  import Outro from "./features/Outro.svelte";
  import Intro from "./features/Intro.svelte";
  import FeatureDelta from "./features/FeatureDelta.svelte";
  import ForgottenFavorites from "./features/ForgottenFavorites.svelte";
  import {
    checkPlaybackReportingSetup,
    loadAudio,
  } from "$lib/utility/jellyfin-helper";
  import type { Features } from "tailwindcss";
  import type { Point } from "chart.js";
  import { page } from "$app/state";

  if (!$lightRewindReport?.jellyfinRewindReport) {
    goto("/welcome");
  }

  let optimalDataSource: `jellyfin` | `playbackReport` | `average` =
    $derived.by(() => {
      if ($lightRewindReport.jellyfinRewindReport.playbackReportAvailable) {
        if (
          !$lightRewindReport.jellyfinRewindReport.playbackReportDataMissing
        ) {
          if (
            $lightRewindReport.jellyfinRewindReport.playbackReportComplete
          ) {
            return `playbackReport`;
          } else {
            return `average`;
          }
        } else {
          return `jellyfin`;
        }
      } else {
        return `jellyfin`;
      }
    });

  let informationSource: FeatureProps["informationSource"] =
    // svelte-ignore state_referenced_locally
    $state(optimalDataSource);

  let rankingMetric: FeatureProps["rankingMetric"] = $state("playCount");

  let extraFeatures: FeatureProps["extraFeatures"] = $derived(() => {
    if (!$lightRewindReport?.jellyfinRewindReport) {
      return {
        fullReport: false,
        totalPlaytimeGraph: false,
        leastSkippedTracks: false,
        mostSkippedTracks: false,
        totalMusicDays: false,
        mostSuccessivePlays: false,
        listeningActivityDifference: false,
      };
    }
    return {
      //@ts-ignore: compatibility with the full report
      fullReport: $lightRewindReport.jellyfinRewindReport.type === `full`,
      totalPlaytimeGraph:
        $lightRewindReport.jellyfinRewindReport.playbackReportAvailable &&
        !$lightRewindReport.jellyfinRewindReport.playbackReportDataMissing,
      leastSkippedTracks:
        $lightRewindReport.jellyfinRewindReport.playbackReportAvailable &&
        !$lightRewindReport.jellyfinRewindReport.playbackReportDataMissing,
      mostSkippedTracks:
        $lightRewindReport.jellyfinRewindReport.playbackReportAvailable &&
        !$lightRewindReport.jellyfinRewindReport.playbackReportDataMissing,
      totalMusicDays:
        $lightRewindReport.jellyfinRewindReport.playbackReportAvailable &&
        !$lightRewindReport.jellyfinRewindReport.playbackReportDataMissing,
      mostSuccessivePlays: !!$lightRewindReport.jellyfinRewindReport
        .generalStats
        .mostSuccessivePlays,
      listeningActivityDifference: !!$lightRewindReport.jellyfinRewindReport
        .featureDelta,
    };
  });

  let currentFeatureIndex = $state(0);
  let features = () => [
    {
      component: Intro,
    },
    {
      component: TotalPlaytime,
    },
    {
      component: TopTrack,
    },
    {
      component: TopTracks,
    },
    {
      component: DaysListened,
    },
    {
      component: TopArtist,
    },
    {
      component: TopArtists,
    },
    {
      component: LibraryStats,
    },
    {
      component: TopAlbum,
    },
    {
      component: TopAlbums,
    },
    {
      component: FeatureDelta,
    },
    {
      skip: !$lightRewindReport.jellyfinRewindReport.tracks
        ?.forgottenFavoriteTracks[informationSource]?.length,
      component: ForgottenFavorites,
    },
    {
      component: TopGenres,
    },
    {
      component: LeastSkipped,
    },
    {
      component: MostSkipped,
    },
    //TODO most successive streams
    {
      component: Summary,
    },
    {
      component: Monthly,
    },
    {
      component: Outro,
    },
  ];

  let lastScrollTime = 0;
  const DEBOUNCE_DELAY = 0;

  function handleClick(event: MouseEvent) {
    if (event.clientY < window.innerHeight / 3) {
      prevFeature();
    } else {
      nextFeature();
    }
  }

  function handleWheel(event: WheelEvent) {
    const now = Date.now();
    if (now - lastScrollTime < DEBOUNCE_DELAY) return;
    lastScrollTime = now;

    if (event.deltaY > 0) {
      nextFeature();
    } else if (event.deltaY < 0) {
      prevFeature();
    }
  }

  let featureInstances: Record<number, FeatureEvents> = {};

  function scrollToActive() {
    const element = document.getElementById(
      `feature-${currentFeatureIndex}`,
    );
    element?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "start",
    });
  }

  function nextFeature() {
    const oldPage = currentFeatureIndex;
    if (currentFeatureIndex < features().length - 1) {
      if (features()[currentFeatureIndex + 1].skip) {
        if (currentFeatureIndex + 2 < features().length) {
          currentFeatureIndex += 2;
        } else {
          // nop
        }
      } else {
        currentFeatureIndex += 1;
      }
    }
    featureInstances[currentFeatureIndex]?.onEnter?.();
    featureInstances[oldPage]?.onExit?.();
    scrollToActive();
  }
  function prevFeature() {
    const oldPage = currentFeatureIndex;
    if (currentFeatureIndex > 0) {
      if (features()[currentFeatureIndex - 1].skip) {
        if (currentFeatureIndex - 2 >= 0) {
          currentFeatureIndex -= 2;
        } else {
          // nop
        }
      } else {
        currentFeatureIndex -= 1;
      }
    }
    featureInstances[currentFeatureIndex]?.onEnter?.();
    featureInstances[oldPage]?.onExit?.();
    scrollToActive();
  }

  // fade between two tracks over 1000ms
  async function fadeToNextTrack(trackInfo: { id: any }) {
    const player1: HTMLAudioElement | null = document.querySelector(
      `#audio-player-1`,
    );
    const player2: HTMLAudioElement | null = document.querySelector(
      `#audio-player-2`,
    );
    console.log(`player1:`, player1);
    console.log(`player2:`, player2);

    if (!player1 || !player2) {
      return;
    }

    // mark the currently active player as inactive, and the other as active
    let activePlayer, inactivePlayer;
    if (player1.paused) {
      activePlayer = player2;
      inactivePlayer = player1;
    } else {
      activePlayer = player1;
      inactivePlayer = player2;
    }
    activePlayer.setAttribute(`data-active`, `false`);
    inactivePlayer.setAttribute(`data-active`, `true`);
    await loadAudio(inactivePlayer, trackInfo);

    if (!soundMuted) {
      inactivePlayer.volume = 0;
      activePlayer.volume = 1;
      inactivePlayer.play();
      inactivePlayer.volume = 0;

      // I hate Safari

      const fadePerStep = 0.05;
      const fadeDuration = 1000;
      const fadeStepsOut = Array(1 / fadePerStep)
        .fill(1)
        .map((_, i) => Number((1 - i * fadePerStep).toFixed(2)));
      const fadeStepsIn = Array(1 / fadePerStep)
        .fill(1)
        .map((_, i) => Number((i * fadePerStep).toFixed(2)));
      fadeStepsIn.unshift(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

      const doFade = (stepIndex: number) => () => {
        try {
          inactivePlayer.volume = fadeStepsIn[stepIndex];
          activePlayer.volume = fadeStepsOut[stepIndex] || 0;
          if (stepIndex === fadeStepsIn.length - 1) {
            // stop the active player
            activePlayer.pause();
            activePlayer.currentTime = 0;
            //!!! don't reset currentTime, otherwise the track will start from the beginning when resuming playback
          } else {
            setTimeout(
              doFade(stepIndex + 1),
              fadeDuration / fadeStepsIn.length,
            );
          }
        } catch (err) {
          console.error(`Error while fading tracks:`, err);
          inactivePlayer.volume = 1;
          activePlayer.volume = 0;
          activePlayer.pause();
        }
      };

      // fade
      doFade(0)();
    }
  }

  // fade both tracks out over 1000ms
  function pausePlayback() {
    const player1: HTMLAudioElement | null = document.querySelector(
      `#audio-player-1`,
    );
    const player2: HTMLAudioElement | null = document.querySelector(
      `#audio-player-2`,
    );
    console.log(`player1:`, player1);
    console.log(`player2:`, player2);

    if (!player1 || !player2) {
      return;
    }

    // mark the currently active player for later
    let activePlayer, inactivePlayer;
    if (player1.paused) {
      activePlayer = player2;
      inactivePlayer = player1;
    } else {
      activePlayer = player1;
      inactivePlayer = player2;
    }
    activePlayer.setAttribute(`data-active`, `true`);
    inactivePlayer.setAttribute(`data-active`, `false`);

    player1.volume = 1;
    player2.volume = 1;

    const fadePerStep = 0.05;
    const fadeDuration = 750;
    const fadeSteps = Array(1 / fadePerStep)
      .fill(1)
      .map((_, i) => Number((1 - i * fadePerStep).toFixed(2)));

    const doFade = (stepIndex: number) => () => {
      try {
        player1.volume = fadeSteps[stepIndex];
        player2.volume = fadeSteps[stepIndex];
        if (stepIndex === fadeSteps.length - 1) {
          // stop the active player
          player1.pause();
          player2.pause();
          //!!! don't reset currentTime, otherwise the track will start from the beginning when resuming playback
        } else {
          setTimeout(
            doFade(stepIndex + 1),
            fadeDuration / fadeSteps.length,
          );
        }
      } catch (err) {
        console.error(`Error while fading tracks:`, err);
        player1.volume = 0;
        player2.volume = 0;
        player1.pause();
        player2.pause();
      }
    };

    // fade
    doFade(0)();
  }

  // uses the tag data to determine the previously active player and resumes playback by fading it in
  function resumePlayback() {
    const player1: HTMLAudioElement | null = document.querySelector(
      `#audio-player-1`,
    );
    const player2: HTMLAudioElement | null = document.querySelector(
      `#audio-player-2`,
    );
    console.log(`player1:`, player1);
    console.log(`player2:`, player2);

    if (!player1 || !player2) {
      return;
    }

    let activePlayer;
    if (player1.getAttribute(`data-active`) === `true`) {
      activePlayer = player1;
    } else {
      activePlayer = player2;
    }

    activePlayer.volume = 0;
    activePlayer.play();

    const fadePerStep = 0.05;
    const fadeDuration = 750;
    const fadeSteps = Array(1 / fadePerStep)
      .fill(1)
      .map((_, i) => Number((i * fadePerStep).toFixed(2)));

    const doFade = (stepIndex: number) => () => {
      try {
        activePlayer.volume = fadeSteps[stepIndex];

        if (stepIndex !== fadeSteps.length - 1) {
          setTimeout(
            doFade(stepIndex + 1),
            fadeDuration / fadeSteps.length,
          );
        }
      } catch (err) {
        console.error(`Error while fading tracks:`, err);
        activePlayer.volume = 1;
      }
    };

    // fade
    doFade(0)();
  }

  let soundMuted = $state(false);
</script>

<svelte:body class:noScrollBar={true} />
<svelte:document
  on:click={handleClick}
  on:wheel={handleWheel}
  on:scroll|preventDefault
/>
<svelte:window
  on:resize={scrollToActive}
  on:focus={scrollToActive}
  on:blur={scrollToActive}
  on:scroll={scrollToActive}
/>

{#snippet renderFeature(
  index: number,
  Feature: Component<FeatureProps, FeatureEvents>,
)}
  <div class="relative h-screen pt-10" id="feature-{index}">
    <Feature
      bind:this={featureInstances[index]}
      {informationSource}
      {rankingMetric}
      {extraFeatures}
      onNextFeature={() => {
        nextFeature();
      }}
      onPreviousFeature={() => {
        prevFeature();
      }}
      {fadeToNextTrack}
      {pausePlayback}
      {resumePlayback}
    />
  </div>
{/snippet}

<div>
  {#each features() as feat, index}
    {#if !feat.skip}
      {@render renderFeature(index, feat.component)}
    {/if}
  {/each}
</div>

<audio id="audio-player-1" loop></audio>
<audio id="audio-player-2" loop></audio>

<!-- <div class="volumeBox">
  <div>
    <input
      type="range"
      min="0"
      max="100"
      on:click|stopPropagation
      on:change|stopPropagation|preventDefault={(e) => {
        const value = Number(e.currentTarget.value);
        console.log({ newVolume: value }); // TODO: Change volume
      }}
    />
    92%
  </div>
</div> -->
<div id="volumeToggle" class="fixed top-0 right-0 z-10 px-6 py-5">
  <!-- svelte-ignore event_directive_deprecated -->
  <button
    class="px-1 z-[150]"
    on:click|stopPropagation={() => {
      soundMuted ? resumePlayback() : pausePlayback();
      soundMuted = !soundMuted;
    }}
    type="button"
  >
    {#if soundMuted}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-7 h-7 text-white icon icon-tabler icon-tabler-volume-off"
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
        <path
          d="M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5.001 5.001 0 0 1 -.535 .464"
        >
        </path>
        <path
          d="M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9.005 9.005 0 0 1 -.686 .615"
        >
        </path>
        <path
          d="M9.069 5.054l.431 -.554a0.8 .8 0 0 1 1.5 .5v2m0 4v8a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664"
        >
        </path>
        <path d="M3 3l18 18"></path>
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-7 h-7 text-white icon icon-tabler icon-tabler-volume"
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
        <path d="M15 8a5 5 0 0 1 0 8"></path>
        <path d="M17.7 5a9 9 0 0 1 0 14"></path>
        <path
          d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a0.8 .8 0 0 1 1.5 .5v14a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"
        >
        </path>
      </svg>
    {/if}
  </button>
</div>

<style lang="scss">
  .volumeBox {
    position: fixed;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    translate: 0 25%;
    opacity: 0.5;
    transition: 250ms ease-out;
    &:hover {
      translate: 0 -10%;
      opacity: 1;
    }
    div {
      background-color: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(60px);
      padding-right: 1.7rem;
      padding-left: 1.7rem;
      padding-top: 0.8rem;
      padding-bottom: 0.5rem;
      border-top-left-radius: 1.5rem;
      border-top-right-radius: 1.5rem;
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
      display: flex;
      align-items: center;
      column-gap: 1rem;
      input {
        $accent: rgb(241, 181, 57);
        accent-color: $accent;
        padding: 0;
      }
    }
  }
</style>
