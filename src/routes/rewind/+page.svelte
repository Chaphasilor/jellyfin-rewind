<script lang="ts">
  import { goto } from "$app/navigation";
  import { rewindReport } from "$lib/globals";
  import {
    type FeatureEvents,
    type FeatureProps,
    InformationSource,
  } from "$lib/types";
  import { type Component, onMount } from "svelte";
  import TotalPlaytime from "./features/TotalPlaytime.svelte";
  import TopTrack from "./features/TopTrack.svelte";
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
  import { loadAudio } from "$lib/utility/jellyfin-helper";
  import JellyfinSourceDisclaimer from "./features/JellyfinSourceDisclaimer.svelte";
  import MuteVolumeIcon from "$lib/components/icons/MuteVolumeIcon.svelte";
  import OnVolumeIcon from "$lib/components/icons/OnVolumeIcon.svelte";

  if (!$rewindReport?.jellyfinRewindReport) {
    console.warn(`No $rewindReport found, redirecting to /welcome...`);
    goto("/welcome");
  }

  let optimalDataSource: InformationSource = $derived.by(() => {
    if ($rewindReport?.jellyfinRewindReport?.playbackReportAvailable) {
      if (!$rewindReport?.jellyfinRewindReport?.playbackReportDataMissing) {
        if ($rewindReport?.jellyfinRewindReport?.playbackReportComplete) {
          return InformationSource.PLAYBACK_REPORTING;
        } else {
          return InformationSource.AVERAGE;
        }
      } else {
        return InformationSource.JELLYFIN;
      }
    } else {
      return InformationSource.JELLYFIN;
    }
  });
  // svelte-ignore state_referenced_locally
  console.log(`optimalDataSource:`, optimalDataSource);

  let informationSource: FeatureProps["informationSource"] =
    // svelte-ignore state_referenced_locally
    $state(optimalDataSource);
  console.log(`informationSource:`, informationSource);

  let rankingMetric: FeatureProps["rankingMetric"] = $state("playCount");

  let extraFeatures: FeatureProps["extraFeatures"] = $derived(() => {
    if (!$rewindReport?.jellyfinRewindReport) {
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
      fullReport: $rewindReport?.jellyfinRewindReport?.type === `full`,
      totalPlaytimeGraph:
        $rewindReport?.jellyfinRewindReport?.playbackReportAvailable &&
        !$rewindReport?.jellyfinRewindReport?.playbackReportDataMissing,
      leastSkippedTracks:
        $rewindReport?.jellyfinRewindReport?.playbackReportAvailable &&
        !$rewindReport?.jellyfinRewindReport?.playbackReportDataMissing,
      mostSkippedTracks:
        $rewindReport?.jellyfinRewindReport?.playbackReportAvailable &&
        !$rewindReport?.jellyfinRewindReport?.playbackReportDataMissing,
      totalMusicDays:
        $rewindReport?.jellyfinRewindReport?.playbackReportAvailable &&
        !$rewindReport?.jellyfinRewindReport?.playbackReportDataMissing,
      mostSuccessivePlays: !!$rewindReport?.jellyfinRewindReport
        ?.generalStats.mostSuccessivePlays,
      listeningActivityDifference: !!$rewindReport?.jellyfinRewindReport
        ?.featureDelta,
    };
  });

  let currentFeatureIndex = $state(0);
  let features: () => {
    component: Component<FeatureProps, FeatureEvents>;
    skip?: boolean;
  }[] = () => [
    {
      component: Intro,
    },
    {
      component: JellyfinSourceDisclaimer,
      skip: informationSource !== InformationSource.JELLYFIN,
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
      skip: !$rewindReport?.jellyfinRewindReport?.tracks
        ?.forgottenFavoriteTracks[informationSource]?.length,
      component: ForgottenFavorites,
    },
    {
      component: TopGenres,
    },
    {
      skip: !$rewindReport?.jellyfinRewindReport?.tracks?.leastSkipped[
        informationSource
      ]?.length,
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
      component: Outro,
    },
  ];

  let lastScrollTime = 0;
  const DEBOUNCE_DELAY = 0;

  // Touch gesture handling
  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartTime = 0;
  const SWIPE_THRESHOLD = 50; // minimum distance for a swipe
  const SWIPE_MAX_TIME = 500; // maximum time for a swipe gesture
  const SWIPE_MAX_HORIZONTAL_DRIFT = 100; // maximum horizontal movement allowed

  function handleTouchStart(event: TouchEvent) {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
    touchStartTime = Date.now();
  }

  function handleTouchMove(event: TouchEvent) {
    // Prevent default scrolling behavior during swipe
    event.preventDefault();
  }

  function handleTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndTime = Date.now();

    const deltaY = touchStartY - touchEndY;
    const deltaX = Math.abs(touchStartX - touchEndX);
    const deltaTime = touchEndTime - touchStartTime;

    // Check if it's a valid swipe gesture (vertical, within time limit, minimal horizontal drift)
    if (
      deltaTime < SWIPE_MAX_TIME &&
      Math.abs(deltaY) > SWIPE_THRESHOLD &&
      deltaX < SWIPE_MAX_HORIZONTAL_DRIFT
    ) {
      if (deltaY > 0) {
        // Swiped up - go to next feature
        nextFeature();
      } else {
        // Swiped down - go to previous feature
        prevFeature();
      }
    }
  }

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
  on:touchstart={handleTouchStart}
  on:touchmove|passive={handleTouchMove}
  on:touchend={handleTouchEnd}
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
  <div class="relative h-screen" id="feature-{index}">
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
      <MuteVolumeIcon />
    {:else}
      <OnVolumeIcon />
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
