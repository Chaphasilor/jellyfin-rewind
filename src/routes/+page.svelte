<script lang="ts">
    import { processingResult } from "$lib/globals";

    // This page is for testing and typescript crys very loud but its okay
    import type { ProcessingResults } from "$lib/types";
    import { secondsToTimeStamp } from "$lib/utility/format";

    let data: ProcessingResults;
</script>
<br />
<br />
{$processingResult.skipped} Listens got skipped while processing because the Track could
not be identified.<br /><br />
The library is made out of:<br />
- {$processingResult.tracksCache.len} Tracks ({$processingResult.favorites} Favorites)<br />
- {$processingResult.albumsCache.len} Albums<br />
- {$processingResult.artistCache.len} Artists<br />
- {$processingResult.genresCache.len} Genres<br /><br />
You Listened to {
    $processingResult.generalCounter.fullPlays +
    $processingResult.generalCounter.partialSkips +
    $processingResult.generalCounter.fullSkips
} Tracks on {$processingResult.dayOfYear.len} days<br />
of which you skipped {$processingResult.generalCounter.fullSkips}, partially Skipped {
    $processingResult
    .generalCounter.partialSkips
} and fully listened to {
    $processingResult.generalCounter
    .fullPlays
} Tracks<br />
This amounts to {secondsToTimeStamp($processingResult.generalCounter.listenDuration)} of
listening time!<br /><br />
Your least listened artists is: {
    $processingResult.artistCache.sorted(
        "listenDuration",
    )[0][1].data
}<br />
Your least played artists is: {
    $processingResult.artistCache.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][1].data
}<br />
Your least skipped artists is: {
    $processingResult.artistCache.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][1].data
}<br />
Your least fully skipped artists is: {
    $processingResult.artistCache.sorted(
        "fullSkips",
    )[0][1].data
}<br />
Your least partially skipped artists is: {
    $processingResult.artistCache.sorted(
        "partialSkips",
    )[0][1].data
}<br /><br />

Your most listened artists is: {
    $processingResult.artistCache
    .sorted("listenDuration")
    .at(-1)?.[1].data
}<br />
Your most played artists is: {
    $processingResult.artistCache
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[1].data
}<br />
Your most skipped artists is: {
    $processingResult.artistCache
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[1].data
}<br />
Your most fully skipped artists is: {
    $processingResult.artistCache
    .sorted("fullSkips")
    .at(-1)?.[1].data
}<br />
Your most partially skipped artists is: {
    $processingResult.artistCache
    .sorted("partialSkips")
    .at(-1)?.[1].data
}<br /><br /><br /><br />

Your least listened genre is: {
    $processingResult.genresCache.sorted(
        "listenDuration",
    )[0][0]
}<br />
Your least played genre is: {
    $processingResult.genresCache.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][0]
}<br />
Your least skipped genre is: {
    $processingResult.genresCache.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][0]
}<br />
Your least fully skipped genre is: {
    $processingResult.genresCache.sorted(
        "fullSkips",
    )[0][0]
}<br />
Your least partially skipped genre is: {
    $processingResult.genresCache.sorted(
        "partialSkips",
    )[0][0]
}<br /><br />

Your most listened genre is: {
    $processingResult.genresCache
    .sorted("listenDuration")
    .at(-1)?.[0]
}<br />
Your most played genre is: {
    $processingResult.genresCache
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped genre is: {
    $processingResult.genresCache
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped genre is: {
    $processingResult.genresCache
    .sorted("fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped genre is: {
    $processingResult.genresCache
    .sorted("partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened track is: {
    $processingResult.tracksCache.sorted(
        "listenDuration",
    )[0][1].data.name
}<br />
Your least played track is: {
    $processingResult.tracksCache.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][1].data.name
}<br />
Your least skipped track is: {
    $processingResult.tracksCache.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][1].data.name
}<br />
Your least fully skipped track is: {
    $processingResult.tracksCache.sorted(
        "fullSkips",
    )[0][1].data.name
}<br />
Your least partially skipped track is: {
    $processingResult.tracksCache.sorted(
        "partialSkips",
    )[0][1].data.name
}<br /><br />

Your most listened track is: {
    $processingResult.tracksCache
    .sorted("listenDuration")
    .at(-1)?.[1].data.name
}<br />
Your most played track is: {
    $processingResult.tracksCache
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[1].data.name
}<br />
Your most skipped track is: {
    $processingResult.tracksCache
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[1].data.name
}<br />
Your most fully skipped track is: {
    $processingResult.tracksCache
    .sorted("fullSkips")
    .at(-1)?.[1].data.name
}<br />
Your most partially skipped track is: {
    $processingResult.tracksCache
    .sorted("partialSkips")
    .at(-1)?.[1].data.name
}<br /><br /><br /><br />

Your least listened album is: {
    $processingResult.albumsCache.sorted(
        "listenDuration",
    )[0][1].data.name
}<br />
Your least played album is: {
    $processingResult.albumsCache.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][1].data.name
}<br />
Your least skipped album is: {
    $processingResult.albumsCache.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][1].data.name
}<br />
Your least fully skipped album is: {
    $processingResult.albumsCache.sorted(
        "fullSkips",
    )[0][1].data.name
}<br />
Your least partially skipped album is: {
    $processingResult.albumsCache.sorted(
        "partialSkips",
    )[0][1].data.name
}<br /><br />

Your most listened album is: {
    $processingResult.albumsCache
    .sorted("listenDuration")
    .at(-1)?.[1].data.name
}<br />
Your most played album is: {
    $processingResult.albumsCache
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[1].data.name
}<br />
Your most skipped album is: {
    $processingResult.albumsCache
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[1].data.name
}<br />
Your most fully skipped album is: {
    $processingResult.albumsCache
    .sorted("fullSkips")
    .at(-1)?.[1].data.name
}<br />
Your most partially skipped album is: {
    $processingResult.albumsCache
    .sorted("partialSkips")
    .at(-1)?.[1].data.name
}<br /><br /><br /><br />

Your least listened weekday is: {
    $processingResult.dayOfWeek.sorted(
        "listenDuration",
    )[0][0]
}<br />
Your least played weekday is: {
    $processingResult.dayOfWeek.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][0]
}<br />
Your least skipped weekday is: {
    $processingResult.dayOfWeek.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][0]
}<br />
Your least fully skipped weekday is: {
    $processingResult.dayOfWeek.sorted(
        "fullSkips",
    )[0][0]
}<br />
Your least partially skipped weekday is: {
    $processingResult.dayOfWeek.sorted(
        "partialSkips",
    )[0][0]
}<br /><br />

Your most listened weekday is: {
    $processingResult.dayOfWeek
    .sorted("listenDuration")
    .at(-1)?.[0]
}<br />
Your most played weekday is: {
    $processingResult.dayOfWeek
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped weekday is: {
    $processingResult.dayOfWeek
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped weekday is: {
    $processingResult.dayOfWeek
    .sorted("fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped weekday is: {
    $processingResult.dayOfWeek
    .sorted("partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened month is: {
    $processingResult.monthOfYear.sorted(
        "listenDuration",
    )[0][0]
}<br />
Your least played month is: {
    $processingResult.monthOfYear.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][0]
}<br />
Your least skipped month is: {
    $processingResult.monthOfYear.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][0]
}<br />
Your least fully skipped month is: {
    $processingResult.monthOfYear.sorted(
        "fullSkips",
    )[0][0]
}<br />
Your least partially skipped month is: {
    $processingResult.monthOfYear.sorted(
        "partialSkips",
    )[0][0]
}<br /><br />

Your most listened month is: {
    $processingResult.monthOfYear
    .sorted("listenDuration")
    .at(-1)?.[0]
}<br />
Your most played month is: {
    $processingResult.monthOfYear
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped month is: {
    $processingResult.monthOfYear
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped month is: {
    $processingResult.monthOfYear
    .sorted("fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped month is: {
    $processingResult.monthOfYear
    .sorted("partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened month day is: {
    $processingResult.dayOfMonth.sorted(
        "listenDuration",
    )[0][0]
}<br />
Your least played month day is: {
    $processingResult.dayOfMonth.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][0]
}<br />
Your least skipped month day is: {
    $processingResult.dayOfMonth.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][0]
}<br />
Your least fully skipped month day is: {
    $processingResult.dayOfMonth.sorted(
        "fullSkips",
    )[0][0]
}<br />
Your least partially skipped month day is: {
    $processingResult.dayOfMonth.sorted(
        "partialSkips",
    )[0][0]
}<br /><br />

Your most listened month day is: {
    $processingResult.dayOfMonth
    .sorted("listenDuration")
    .at(-1)?.[0]
}<br />
Your most played month day is: {
    $processingResult.dayOfMonth
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped month day is: {
    $processingResult.dayOfMonth
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped month day is: {
    $processingResult.dayOfMonth
    .sorted("fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped month day is: {
    $processingResult.dayOfMonth
    .sorted("partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened year day is: {
    $processingResult.dayOfYear.sorted(
        "listenDuration",
    )[0][0]
}<br />
Your least played year day is: {
    $processingResult.dayOfYear.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][0]
}<br />
Your least skipped year day is: {
    $processingResult.dayOfYear.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][0]
}<br />
Your least fully skipped year day is: {
    $processingResult.dayOfYear.sorted(
        "fullSkips",
    )[0][0]
}<br />
Your least partially skipped year day is: {
    $processingResult.dayOfYear.sorted(
        "partialSkips",
    )[0][0]
}<br /><br />

Your most listened year day is: {
    $processingResult.dayOfYear
    .sorted("listenDuration")
    .at(-1)?.[0]
}<br />
Your most played year day is: {
    $processingResult.dayOfYear
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped year day is: {
    $processingResult.dayOfYear
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped year day is: {
    $processingResult.dayOfYear
    .sorted("fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped year day is: {
    $processingResult.dayOfYear
    .sorted("partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened hour is: {
    $processingResult.hourOfDay.sorted(
        "listenDuration",
    )[0][0]
}<br />
Your least played hour is: {
    $processingResult.hourOfDay.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][0]
}<br />
Your least skipped hour is: {
    $processingResult.hourOfDay.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][0]
}<br />
Your least fully skipped hour is: {
    $processingResult.hourOfDay.sorted(
        "fullSkips",
    )[0][0]
}<br />
Your least partially skipped hour is: {
    $processingResult.hourOfDay.sorted(
        "partialSkips",
    )[0][0]
}<br /><br />

Your most listened hour is: {
    $processingResult.hourOfDay
    .sorted("listenDuration")
    .at(-1)?.[0]
}<br />
Your most played hour is: {
    $processingResult.hourOfDay
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped hour is: {
    $processingResult.hourOfDay
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped hour is: {
    $processingResult.hourOfDay
    .sorted("fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped hour is: {
    $processingResult.hourOfDay
    .sorted("partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened device is: {
    $processingResult.deviceCache.sorted(
        "listenDuration",
    )[0][0]
}<br />
Your least played device is: {
    $processingResult.deviceCache.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][0]
}<br />
Your least skipped device is: {
    $processingResult.deviceCache.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][0]
}<br />
Your least fully skipped device is: {
    $processingResult.deviceCache.sorted(
        "fullSkips",
    )[0][0]
}<br />
Your least partially skipped device is: {
    $processingResult.deviceCache.sorted(
        "partialSkips",
    )[0][0]
}<br /><br />

Your most listened device is: {
    $processingResult.deviceCache
    .sorted("listenDuration")
    .at(-1)?.[0]
}<br />
Your most played device is: {
    $processingResult.deviceCache
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped device is: {
    $processingResult.deviceCache
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped device is: {
    $processingResult.deviceCache
    .sorted("fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped device is: {
    $processingResult.deviceCache
    .sorted("partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened client is: {
    $processingResult.clientCache.sorted(
        "listenDuration",
    )[0][0]
}<br />
Your least played client is: {
    $processingResult.clientCache.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][0]
}<br />
Your least skipped client is: {
    $processingResult.clientCache.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][0]
}<br />
Your least fully skipped client is: {
    $processingResult.clientCache.sorted(
        "fullSkips",
    )[0][0]
}<br />
Your least partially skipped client is: {
    $processingResult.clientCache.sorted(
        "partialSkips",
    )[0][0]
}<br /><br />

Your most listened client is: {
    $processingResult.clientCache
    .sorted("listenDuration")
    .at(-1)?.[0]
}<br />
Your most played client is: {
    $processingResult.clientCache
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped client is: {
    $processingResult.clientCache
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped client is: {
    $processingResult.clientCache
    .sorted("fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped client is: {
    $processingResult.clientCache
    .sorted("partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />

Your least listened method is: {
    $processingResult.playbackCache.sorted(
        "listenDuration",
    )[0][0]
}<br />
Your least played method is: {
    $processingResult.playbackCache.sorted([
        "fullPlays",
        "partialSkips",
    ])[0][0]
}<br />
Your least skipped method is: {
    $processingResult.playbackCache.sorted([
        "fullSkips",
        "partialSkips",
    ])[0][0]
}<br />
Your least fully skipped method is: {
    $processingResult.playbackCache.sorted(
        "fullSkips",
    )[0][0]
}<br />
Your least partially skipped method is: {
    $processingResult.playbackCache.sorted(
        "partialSkips",
    )[0][0]
}<br /><br />

Your most listened method is: {
    $processingResult.playbackCache
    .sorted("listenDuration")
    .at(-1)?.[0]
}<br />
Your most played method is: {
    $processingResult.playbackCache
    .sorted(["fullPlays", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most skipped method is: {
    $processingResult.playbackCache
    .sorted(["fullSkips", "partialSkips"])
    .at(-1)?.[0]
}<br />
Your most fully skipped method is: {
    $processingResult.playbackCache
    .sorted("fullSkips")
    .at(-1)?.[0]
}<br />
Your most partially skipped method is: {
    $processingResult.playbackCache
    .sorted("partialSkips")
    .at(-1)?.[0]
}<br /><br /><br /><br />
