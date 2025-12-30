<script lang="ts">
  import { goto } from "$app/navigation";
  import { lightRewindReport, processingResult } from "$lib/globals";
  import type { FeatureProps } from "$lib/types";
  import { processingResultToRewindReport } from "$lib/utility/convert";
  import { logAndReturn } from "$lib/utility/logging";
  import type { Component } from "svelte";
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
  import { loadAudio } from "$lib/utility/jellyfin-helper";

  if (!$lightRewindReport?.jellyfinRewindReport) {
    goto("/login");
  }

  let informationSource: FeatureProps["informationSource"] =
    $state("playbackReport");

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
      mostSuccessivePlays:
        !!$lightRewindReport.jellyfinRewindReport.generalStats
          .mostSuccessivePlays,
      listeningActivityDifference:
        !!$lightRewindReport.jellyfinRewindReport.featureDelta,
    };
  });

  let page = $state(0);
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
  function scrollToActive() {
    const element = document.getElementById(`feature-${page}`);
    element?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "start",
    });
  }

  function nextFeature() {
    if (page < features().length - 1) {
      if (features()[page + 1].skip) {
        if (page + 2 < features().length) {
          page += 2;
        } else {
          // nop
        }
      } else {
        page += 1;
      }
    }
    scrollToActive();
  }
  function prevFeature() {
    if (page > 0) {
      if (features()[page - 1].skip) {
        if (page - 2 >= 0) {
          page -= 2;
        } else {
          // nop
        }
      } else {
        page -= 1;
      }
    }
    scrollToActive();
  }

  // fade between two tracks over 1000ms
  async function fadeToNextTrack(trackInfo: { id: any }) {
    const player1: HTMLAudioElement | null =
      document.querySelector(`#audio-player-1`);
    const player2: HTMLAudioElement | null =
      document.querySelector(`#audio-player-2`);
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

    //TODO add mute button
    // if (state.settings.sound) {
    if (true) {
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
    const player1: HTMLAudioElement | null =
      document.querySelector(`#audio-player-1`);
    const player2: HTMLAudioElement | null =
      document.querySelector(`#audio-player-2`);
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
          setTimeout(doFade(stepIndex + 1), fadeDuration / fadeSteps.length);
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
    const player1: HTMLAudioElement | null =
      document.querySelector(`#audio-player-1`);
    const player2: HTMLAudioElement | null =
      document.querySelector(`#audio-player-2`);
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
          setTimeout(doFade(stepIndex + 1), fadeDuration / fadeSteps.length);
        }
      } catch (err) {
        console.error(`Error while fading tracks:`, err);
        activePlayer.volume = 1;
      }
    };

    // fade
    doFade(0)();
  }
</script>

<svelte:document on:wheel={handleWheel} />

{#snippet renderFeature(index, Feature: Component<FeatureProps>)}
  <div class="h-screen" id="feature-{index}">
    <Feature
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

{#each features() as feat, index}
  {#if !feat.skip}
    {@render renderFeature(index, feat.component)}
  {/if}
{/each}

<audio id="audio-player-1" loop></audio>
<audio id="audio-player-2" loop></audio>
