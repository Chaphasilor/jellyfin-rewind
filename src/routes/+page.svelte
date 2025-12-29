<script lang="ts">
  import { processingResult } from "$lib/globals";

  // This page is for testing and typescript crys very loud but its okay
  import { CounterSources, type ProcessingResults } from "$lib/types";
  import { processingResultToRewindReport } from "$lib/utility/convert";
  import { secondsToTimeStamp } from "$lib/utility/format";
  import { log, logAndReturn } from "$lib/utility/logging";

  let data: ProcessingResults;

  let informationSource: CounterSources = $state(
    CounterSources.PLAYBACK_REPORTING,
  );
</script>

<br />
<br />
{$processingResult.skipped} Listens got skipped while processing because the
Track could not be identified.<br /><br />
The library is made out of:<br />
- {$processingResult.tracksCache.len} Tracks ({$processingResult.favorites}
Favorites)<br />
- {$processingResult.albumsCache.len} Albums<br />
- {$processingResult.artistCache.len} Artists<br />
- {$processingResult.genresCache.len} Genres<br /><br />
You Listened to {
  $processingResult.generalCounter[informationSource].fullPlays +
    $processingResult.generalCounter[informationSource].partialSkips +
    $processingResult.generalCounter[informationSource].fullSkips
} Tracks on {
  $processingResult
    .dayOfYear.len
} days<br />
of which you skipped {
  $processingResult.generalCounter[informationSource]
    .fullSkips
}, partially Skipped {
  $processingResult.generalCounter[
    informationSource
  ].partialSkips
} and fully listened to {
  $processingResult.generalCounter[
    informationSource
  ].fullPlays
} Tracks<br />
This amounts to {
  secondsToTimeStamp(
    $processingResult.generalCounter[informationSource].listenDuration,
  )
} of listening time!<br /><br />
Your least listened artists is: {
  $processingResult.artistCache.sorted(
    informationSource,
    "listenDuration",
  )[0][1].data
}<br />
Your least played artists is: {
  $processingResult.artistCache.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][1].data
}<br />
Your least skipped artists is: {
  $processingResult.artistCache.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][1].data
}<br />
Your least fully skipped artists is: {
  $processingResult.artistCache.sorted(
    informationSource,
    "fullSkips",
  )[0][1].data
}<br />
Your least partially skipped artists is: {
  $processingResult.artistCache.sorted(
    informationSource,
    "partialSkips",
  )[0][1].data
}<br /><br />

Your most listened artists is: {
  $processingResult.artistCache
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[1].data
}<br />
Your most played artists is: {
  $processingResult.artistCache
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[1].data
}<br />
Your most skipped artists is: {
  $processingResult.artistCache
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[1].data
}<br />
Your most fully skipped artists is: {
  $processingResult.artistCache
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[1].data
}<br />
Your most partially skipped artists is: {
  $processingResult.artistCache
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[1].data
}<br /><br /><br /><br />

Your least listened genre is: {
  $processingResult.genresCache.sorted(
    informationSource,
    "listenDuration",
  )[0][0]
}<br />
Your least played genre is: {
  $processingResult.genresCache.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][0]
}<br />
Your least skipped genre is: {
  $processingResult.genresCache.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][0]
}<br />
Your least fully skipped genre is: {
  $processingResult.genresCache.sorted(
    informationSource,
    "fullSkips",
  )[0][0]
}<br />
Your least partially skipped genre is: {
  $processingResult.genresCache.sorted(
    informationSource,
    "partialSkips",
  )[0][0]
}<br /><br />

Your most listened genre is: {
  $processingResult.genresCache
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[0]
}<br />
Your most played genre is: {
  $processingResult.genresCache
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped genre is: {
  $processingResult.genresCache
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped genre is: {
  $processingResult.genresCache
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped genre is: {
  $processingResult.genresCache
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened track is: {
  $processingResult.tracksCache.sorted(
    informationSource,
    "listenDuration",
  )[0][1].data.name
}<br />
Your least played track is: {
  $processingResult.tracksCache.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][1].data.name
}<br />
Your least skipped track is: {
  $processingResult.tracksCache.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][1].data.name
}<br />
Your least fully skipped track is: {
  $processingResult.tracksCache.sorted(
    informationSource,
    "fullSkips",
  )[0][1].data.name
}<br />
Your least partially skipped track is: {
  $processingResult.tracksCache.sorted(
    informationSource,
    "partialSkips",
  )[0][1].data.name
}<br /><br />

Your most listened track is: {
  $processingResult.tracksCache
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[1].data.name
}<br />
Your most played track is: {
  $processingResult.tracksCache
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[1].data.name
}<br />
Your most skipped track is: {
  $processingResult.tracksCache
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[1].data.name
}<br />
Your most fully skipped track is: {
  $processingResult.tracksCache
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[1].data.name
}<br />
Your most partially skipped track is: {
  $processingResult.tracksCache
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[1].data.name
}<br /><br /><br /><br />

Your least listened album is: {
  $processingResult.albumsCache.sorted(
    informationSource,
    "listenDuration",
  )[0][1].data.name
}<br />
Your least played album is: {
  $processingResult.albumsCache.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][1].data.name
}<br />
Your least skipped album is: {
  $processingResult.albumsCache.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][1].data.name
}<br />
Your least fully skipped album is: {
  $processingResult.albumsCache.sorted(
    informationSource,
    "fullSkips",
  )[0][1].data.name
}<br />
Your least partially skipped album is: {
  $processingResult.albumsCache.sorted(
    informationSource,
    "partialSkips",
  )[0][1].data.name
}<br /><br />

Your most listened album is: {
  $processingResult.albumsCache
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[1].data.name
}<br />
Your most played album is: {
  $processingResult.albumsCache
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[1].data.name
}<br />
Your most skipped album is: {
  $processingResult.albumsCache
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[1].data.name
}<br />
Your most fully skipped album is: {
  $processingResult.albumsCache
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[1].data.name
}<br />
Your most partially skipped album is: {
  $processingResult.albumsCache
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[1].data.name
}<br /><br /><br /><br />

Your least listened weekday is: {
  $processingResult.dayOfWeek.sorted(
    informationSource,
    "listenDuration",
  )[0][0]
}<br />
Your least played weekday is: {
  $processingResult.dayOfWeek.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][0]
}<br />
Your least skipped weekday is: {
  $processingResult.dayOfWeek.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][0]
}<br />
Your least fully skipped weekday is: {
  $processingResult.dayOfWeek.sorted(
    informationSource,
    "fullSkips",
  )[0][0]
}<br />
Your least partially skipped weekday is: {
  $processingResult.dayOfWeek.sorted(
    informationSource,
    "partialSkips",
  )[0][0]
}<br /><br />

Your most listened weekday is: {
  $processingResult.dayOfWeek
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[0]
}<br />
Your most played weekday is: {
  $processingResult.dayOfWeek
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped weekday is: {
  $processingResult.dayOfWeek
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped weekday is: {
  $processingResult.dayOfWeek
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped weekday is: {
  $processingResult.dayOfWeek
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened month is: {
  $processingResult.monthOfYear.sorted(
    informationSource,
    "listenDuration",
  )[0][0]
}<br />
Your least played month is: {
  $processingResult.monthOfYear.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][0]
}<br />
Your least skipped month is: {
  $processingResult.monthOfYear.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][0]
}<br />
Your least fully skipped month is: {
  $processingResult.monthOfYear.sorted(
    informationSource,
    "fullSkips",
  )[0][0]
}<br />
Your least partially skipped month is: {
  $processingResult.monthOfYear.sorted(
    informationSource,
    "partialSkips",
  )[0][0]
}<br /><br />

Your most listened month is: {
  $processingResult.monthOfYear
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[0]
}<br />
Your most played month is: {
  $processingResult.monthOfYear
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped month is: {
  $processingResult.monthOfYear
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped month is: {
  $processingResult.monthOfYear
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped month is: {
  $processingResult.monthOfYear
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened month day is: {
  $processingResult.dayOfMonth.sorted(
    informationSource,
    "listenDuration",
  )[0][0]
}<br />
Your least played month day is: {
  $processingResult.dayOfMonth.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][0]
}<br />
Your least skipped month day is: {
  $processingResult.dayOfMonth.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][0]
}<br />
Your least fully skipped month day is: {
  $processingResult.dayOfMonth.sorted(
    informationSource,
    "fullSkips",
  )[0][0]
}<br />
Your least partially skipped month day is: {
  $processingResult.dayOfMonth.sorted(
    informationSource,
    "partialSkips",
  )[0][0]
}<br /><br />

Your most listened month day is: {
  $processingResult.dayOfMonth
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[0]
}<br />
Your most played month day is: {
  $processingResult.dayOfMonth
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped month day is: {
  $processingResult.dayOfMonth
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped month day is: {
  $processingResult.dayOfMonth
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped month day is: {
  $processingResult.dayOfMonth
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened year day is: {
  $processingResult.dayOfYear.sorted(
    informationSource,
    "listenDuration",
  )[0][0]
}<br />
Your least played year day is: {
  $processingResult.dayOfYear.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][0]
}<br />
Your least skipped year day is: {
  $processingResult.dayOfYear.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][0]
}<br />
Your least fully skipped year day is: {
  $processingResult.dayOfYear.sorted(
    informationSource,
    "fullSkips",
  )[0][0]
}<br />
Your least partially skipped year day is: {
  $processingResult.dayOfYear.sorted(
    informationSource,
    "partialSkips",
  )[0][0]
}<br /><br />

Your most listened year day is: {
  $processingResult.dayOfYear
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[0]
}<br />
Your most played year day is: {
  $processingResult.dayOfYear
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped year day is: {
  $processingResult.dayOfYear
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped year day is: {
  $processingResult.dayOfYear
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped year day is: {
  $processingResult.dayOfYear
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened hour is: {
  $processingResult.hourOfDay.sorted(
    informationSource,
    "listenDuration",
  )[0][0]
}<br />
Your least played hour is: {
  $processingResult.hourOfDay.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][0]
}<br />
Your least skipped hour is: {
  $processingResult.hourOfDay.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][0]
}<br />
Your least fully skipped hour is: {
  $processingResult.hourOfDay.sorted(
    informationSource,
    "fullSkips",
  )[0][0]
}<br />
Your least partially skipped hour is: {
  $processingResult.hourOfDay.sorted(
    informationSource,
    "partialSkips",
  )[0][0]
}<br /><br />

Your most listened hour is: {
  $processingResult.hourOfDay
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[0]
}<br />
Your most played hour is: {
  $processingResult.hourOfDay
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped hour is: {
  $processingResult.hourOfDay
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped hour is: {
  $processingResult.hourOfDay
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped hour is: {
  $processingResult.hourOfDay
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened device is: {
  $processingResult.deviceCache.sorted(
    informationSource,
    "listenDuration",
  )[0][0]
}<br />
Your least played device is: {
  $processingResult.deviceCache.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][0]
}<br />
Your least skipped device is: {
  $processingResult.deviceCache.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][0]
}<br />
Your least fully skipped device is: {
  $processingResult.deviceCache.sorted(
    informationSource,
    "fullSkips",
  )[0][0]
}<br />
Your least partially skipped device is: {
  $processingResult.deviceCache.sorted(
    informationSource,
    "partialSkips",
  )[0][0]
}<br /><br />

Your most listened device is: {
  $processingResult.deviceCache
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[0]
}<br />
Your most played device is: {
  $processingResult.deviceCache
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped device is: {
  $processingResult.deviceCache
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped device is: {
  $processingResult.deviceCache
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped device is: {
  $processingResult.deviceCache
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened client is: {
  $processingResult.clientCache.sorted(
    informationSource,
    "listenDuration",
  )[0][0]
}<br />
Your least played client is: {
  $processingResult.clientCache.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][0]
}<br />
Your least skipped client is: {
  $processingResult.clientCache.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][0]
}<br />
Your least fully skipped client is: {
  $processingResult.clientCache.sorted(
    informationSource,
    "fullSkips",
  )[0][0]
}<br />
Your least partially skipped client is: {
  $processingResult.clientCache.sorted(
    informationSource,
    "partialSkips",
  )[0][0]
}<br /><br />

Your most listened client is: {
  $processingResult.clientCache
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[0]
}<br />
Your most played client is: {
  $processingResult.clientCache
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped client is: {
  $processingResult.clientCache
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped client is: {
  $processingResult.clientCache
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped client is: {
  $processingResult.clientCache
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened method is: {
  $processingResult.playbackCache.sorted(
    informationSource,
    "listenDuration",
  )[0][0]
}<br />
Your least played method is: {
  $processingResult.playbackCache.sorted(
    informationSource,
    ["fullPlays", "partialSkips"],
  )[0][0]
}<br />
Your least skipped method is: {
  $processingResult.playbackCache.sorted(
    informationSource,
    ["fullSkips", "partialSkips"],
  )[0][0]
}<br />
Your least fully skipped method is: {
  $processingResult.playbackCache.sorted(
    informationSource,
    "fullSkips",
  )[0][0]
}<br />
Your least partially skipped method is: {
  $processingResult.playbackCache.sorted(
    informationSource,
    "partialSkips",
  )[0][0]
}<br /><br />

Your most listened method is: {
  $processingResult.playbackCache
    .sorted(informationSource, "listenDuration")
    .at(-1)?.[0]
}<br />
Your most played method is: {
  $processingResult.playbackCache
    .sorted(informationSource, ["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped method is: {
  $processingResult.playbackCache
    .sorted(informationSource, ["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped method is: {
  $processingResult.playbackCache
    .sorted(informationSource, "fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped method is: {
  $processingResult.playbackCache
    .sorted(informationSource, "partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />
