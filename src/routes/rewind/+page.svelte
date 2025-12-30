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

  if (!$lightRewindReport) {
    goto("/login");
  }

  let informationSource: FeatureProps["informationSource"] = $state(
    "playbackReport",
  );

  let rankingMetric: FeatureProps["rankingMetric"] = $state("playCount");

  let extraFeatures: FeatureProps["extraFeatures"] = $derived(() => {
    return {
      //@ts-ignore: compatibility with the full report
      fullReport: $lightRewindReport.type === `full`,
      totalPlaytimeGraph: $lightRewindReport.playbackReportAvailable &&
        !$lightRewindReport.playbackReportDataMissing,
      leastSkippedTracks: $lightRewindReport.playbackReportAvailable &&
        !$lightRewindReport.playbackReportDataMissing,
      mostSkippedTracks: $lightRewindReport.playbackReportAvailable &&
        !$lightRewindReport.playbackReportDataMissing,
      totalMusicDays: $lightRewindReport.playbackReportAvailable &&
        !$lightRewindReport.playbackReportDataMissing,
      mostSuccessivePlays: !!$lightRewindReport.generalStats
        .mostSuccessivePlays,
      listeningActivityDifference: false, //TODO implement delta
    };
  });

  let page = $state(0);
  let features = [
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
    //TODO feature delta
    //TODO forgotten favorites
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
  const DEBOUNCE_DELAY = 1000;

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
  function nextFeature() {
    if (page < features.length - 1) page += 1;
  }
  function prevFeature() {
    if (page > 0) page -= 1;
  }
</script>

<svelte:document on:wheel={handleWheel} />

{#snippet renderFeature(Feature: Component<FeatureProps>)}
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
  />
{/snippet}

<PageTransition path={page}>
  {@render renderFeature(features[page].component)}
</PageTransition>
