<script lang="ts">
    // This page is for testing and typescript crys very loud but its okay

    import {
        PUBLIC_JELLYFIN_PASSWORD,
        PUBLIC_JELLYFIN_SERVER_URL,
        PUBLIC_JELLYFIN_USERNAME,
    } from "$env/static/public";
    import {
        fetchingTaskDone,
        fetchingTaskTodo,
        initTasksDone,
        initTasksTodo,
        processTaskDone,
        processTaskTodo,
    } from "$lib/globals";
    import jellyfin from "$lib/jellyfin";
    import processing from "$lib/jellyfin/queries/local/processing";
    import type { ProcessingResults } from "$lib/types";
    import { secondsToTimeStamp } from "$lib/utility/format";

    let data: ProcessingResults;
    let error: string | null = null;
    async function run() {
        const connect = await jellyfin.connectToURL(
            PUBLIC_JELLYFIN_SERVER_URL,
        );
        if (!connect.success) return (error = connect.reason);

        const login = await jellyfin.userLogin(
            PUBLIC_JELLYFIN_USERNAME,
            PUBLIC_JELLYFIN_PASSWORD,
        );
        if (!login.success) return (error = login.reason);

        const result = await processing();
        // @ts-ignore
        if (!result.success) return (error = result.reason);

        data = result.data;
        console.log(data);
    }
</script>

<button on:click={run}>Start Simulating and Dont spam :(</button>
<br /><br />

Fetch <br />
{$fetchingTaskDone} / {$fetchingTaskTodo} ({
    $fetchingTaskDone /
    $fetchingTaskTodo
})
<br />
<br />
Init <br />
{$initTasksDone} / {$initTasksTodo} ({$initTasksDone / $initTasksTodo})
<br />
<br />
Work <br />
{$processTaskDone} / {$processTaskTodo} ({$processTaskDone / $processTaskTodo})
<br />
<br />
{#if data}
    {data.skipped} Listens got skipped while processing because the Track could
    not be identified.<br /><br />
    The library is made out of:<br />
    - {data.tracksCache.len} Tracks ({data.favorites} Favorites)<br />
    - {data.albumsCache.len} Albums<br />
    - {data.artistCache.len} Artists<br />
    - {data.genresCache.len} Genres<br /><br />
    You Listened to {
        data.generalCounter.fullPlays +
        data.generalCounter.partialSkips +
        data.generalCounter.fullSkips
    } Tracks on {data.dayOfYear.len} days<br />
    of which you skipped {data.generalCounter.fullSkips}, partially Skipped {
        data
        .generalCounter.partialSkips
    } and fully listened to {
        data.generalCounter
        .fullPlays
    } Tracks<br />
    This amounts to {secondsToTimeStamp(data.generalCounter.listenDuration)} of
    listening time!<br /><br />
    Your least listened artists is: {
        data.artistCache.sorted(
            "listenDuration",
        )[0][1].data
    }<br />
    Your least played artists is: {
        data.artistCache.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][1].data
    }<br />
    Your least skipped artists is: {
        data.artistCache.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][1].data
    }<br />
    Your least fully skipped artists is: {
        data.artistCache.sorted(
            "fullSkips",
        )[0][1].data
    }<br />
    Your least partially skipped artists is: {
        data.artistCache.sorted(
            "partialSkips",
        )[0][1].data
    }<br /><br />

    Your most listened artists is: {
        data.artistCache
        .sorted("listenDuration")
        .at(-1)[1].data
    }<br />
    Your most played artists is: {
        data.artistCache
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[1].data
    }<br />
    Your most skipped artists is: {
        data.artistCache
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[1].data
    }<br />
    Your most fully skipped artists is: {
        data.artistCache
        .sorted("fullSkips")
        .at(-1)[1].data
    }<br />
    Your most partially skipped artists is: {
        data.artistCache
        .sorted("partialSkips")
        .at(-1)[1].data
    }<br /><br /><br /><br />

    Your least listened genre is: {
        data.genresCache.sorted(
            "listenDuration",
        )[0][0]
    }<br />
    Your least played genre is: {
        data.genresCache.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least skipped genre is: {
        data.genresCache.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least fully skipped genre is: {
        data.genresCache.sorted(
            "fullSkips",
        )[0][0]
    }<br />
    Your least partially skipped genre is: {
        data.genresCache.sorted(
            "partialSkips",
        )[0][0]
    }<br /><br />

    Your most listened genre is: {
        data.genresCache
        .sorted("listenDuration")
        .at(-1)[0]
    }<br />
    Your most played genre is: {
        data.genresCache
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most skipped genre is: {
        data.genresCache
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most fully skipped genre is: {
        data.genresCache
        .sorted("fullSkips")
        .at(-1)[0]
    }<br />
    Your most partially skipped genre is: {
        data.genresCache
        .sorted("partialSkips")
        .at(-1)[0]
    }<br /><br /><br /><br />

    Your least listened track is: {
        data.tracksCache.sorted(
            "listenDuration",
        )[0][1].data.name
    }<br />
    Your least played track is: {
        data.tracksCache.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][1].data.name
    }<br />
    Your least skipped track is: {
        data.tracksCache.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][1].data.name
    }<br />
    Your least fully skipped track is: {
        data.tracksCache.sorted(
            "fullSkips",
        )[0][1].data.name
    }<br />
    Your least partially skipped track is: {
        data.tracksCache.sorted(
            "partialSkips",
        )[0][1].data.name
    }<br /><br />

    Your most listened track is: {
        data.tracksCache
        .sorted("listenDuration")
        .at(-1)[1].data.name
    }<br />
    Your most played track is: {
        data.tracksCache
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[1].data.name
    }<br />
    Your most skipped track is: {
        data.tracksCache
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[1].data.name
    }<br />
    Your most fully skipped track is: {
        data.tracksCache
        .sorted("fullSkips")
        .at(-1)[1].data.name
    }<br />
    Your most partially skipped track is: {
        data.tracksCache
        .sorted("partialSkips")
        .at(-1)[1].data.name
    }<br /><br /><br /><br />

    Your least listened album is: {
        data.albumsCache.sorted(
            "listenDuration",
        )[0][1].data.name
    }<br />
    Your least played album is: {
        data.albumsCache.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][1].data.name
    }<br />
    Your least skipped album is: {
        data.albumsCache.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][1].data.name
    }<br />
    Your least fully skipped album is: {
        data.albumsCache.sorted(
            "fullSkips",
        )[0][1].data.name
    }<br />
    Your least partially skipped album is: {
        data.albumsCache.sorted(
            "partialSkips",
        )[0][1].data.name
    }<br /><br />

    Your most listened album is: {
        data.albumsCache
        .sorted("listenDuration")
        .at(-1)[1].data.name
    }<br />
    Your most played album is: {
        data.albumsCache
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[1].data.name
    }<br />
    Your most skipped album is: {
        data.albumsCache
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[1].data.name
    }<br />
    Your most fully skipped album is: {
        data.albumsCache
        .sorted("fullSkips")
        .at(-1)[1].data.name
    }<br />
    Your most partially skipped album is: {
        data.albumsCache
        .sorted("partialSkips")
        .at(-1)[1].data.name
    }<br /><br /><br /><br />

    Your least listened weekday is: {
        data.dayOfWeek.sorted(
            "listenDuration",
        )[0][0]
    }<br />
    Your least played weekday is: {
        data.dayOfWeek.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least skipped weekday is: {
        data.dayOfWeek.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least fully skipped weekday is: {
        data.dayOfWeek.sorted(
            "fullSkips",
        )[0][0]
    }<br />
    Your least partially skipped weekday is: {
        data.dayOfWeek.sorted(
            "partialSkips",
        )[0][0]
    }<br /><br />

    Your most listened weekday is: {
        data.dayOfWeek
        .sorted("listenDuration")
        .at(-1)[0]
    }<br />
    Your most played weekday is: {
        data.dayOfWeek
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most skipped weekday is: {
        data.dayOfWeek
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most fully skipped weekday is: {
        data.dayOfWeek
        .sorted("fullSkips")
        .at(-1)[0]
    }<br />
    Your most partially skipped weekday is: {
        data.dayOfWeek
        .sorted("partialSkips")
        .at(-1)[0]
    }<br /><br /><br /><br />

    Your least listened month is: {
        data.monthOfYear.sorted(
            "listenDuration",
        )[0][0]
    }<br />
    Your least played month is: {
        data.monthOfYear.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least skipped month is: {
        data.monthOfYear.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least fully skipped month is: {
        data.monthOfYear.sorted(
            "fullSkips",
        )[0][0]
    }<br />
    Your least partially skipped month is: {
        data.monthOfYear.sorted(
            "partialSkips",
        )[0][0]
    }<br /><br />

    Your most listened month is: {
        data.monthOfYear
        .sorted("listenDuration")
        .at(-1)[0]
    }<br />
    Your most played month is: {
        data.monthOfYear
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most skipped month is: {
        data.monthOfYear
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most fully skipped month is: {
        data.monthOfYear
        .sorted("fullSkips")
        .at(-1)[0]
    }<br />
    Your most partially skipped month is: {
        data.monthOfYear
        .sorted("partialSkips")
        .at(-1)[0]
    }<br /><br /><br /><br />

    Your least listened month day is: {
        data.dayOfMonth.sorted(
            "listenDuration",
        )[0][0]
    }<br />
    Your least played month day is: {
        data.dayOfMonth.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least skipped month day is: {
        data.dayOfMonth.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least fully skipped month day is: {
        data.dayOfMonth.sorted(
            "fullSkips",
        )[0][0]
    }<br />
    Your least partially skipped month day is: {
        data.dayOfMonth.sorted(
            "partialSkips",
        )[0][0]
    }<br /><br />

    Your most listened month day is: {
        data.dayOfMonth
        .sorted("listenDuration")
        .at(-1)[0]
    }<br />
    Your most played month day is: {
        data.dayOfMonth
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most skipped month day is: {
        data.dayOfMonth
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most fully skipped month day is: {
        data.dayOfMonth
        .sorted("fullSkips")
        .at(-1)[0]
    }<br />
    Your most partially skipped month day is: {
        data.dayOfMonth
        .sorted("partialSkips")
        .at(-1)[0]
    }<br /><br /><br /><br />

    Your least listened year day is: {
        data.dayOfYear.sorted(
            "listenDuration",
        )[0][0]
    }<br />
    Your least played year day is: {
        data.dayOfYear.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least skipped year day is: {
        data.dayOfYear.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least fully skipped year day is: {
        data.dayOfYear.sorted(
            "fullSkips",
        )[0][0]
    }<br />
    Your least partially skipped year day is: {
        data.dayOfYear.sorted(
            "partialSkips",
        )[0][0]
    }<br /><br />

    Your most listened year day is: {
        data.dayOfYear
        .sorted("listenDuration")
        .at(-1)[0]
    }<br />
    Your most played year day is: {
        data.dayOfYear
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most skipped year day is: {
        data.dayOfYear
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most fully skipped year day is: {
        data.dayOfYear
        .sorted("fullSkips")
        .at(-1)[0]
    }<br />
    Your most partially skipped year day is: {
        data.dayOfYear
        .sorted("partialSkips")
        .at(-1)[0]
    }<br /><br /><br /><br />

    Your least listened hour is: {
        data.hourOfDay.sorted(
            "listenDuration",
        )[0][0]
    }<br />
    Your least played hour is: {
        data.hourOfDay.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least skipped hour is: {
        data.hourOfDay.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least fully skipped hour is: {
        data.hourOfDay.sorted(
            "fullSkips",
        )[0][0]
    }<br />
    Your least partially skipped hour is: {
        data.hourOfDay.sorted(
            "partialSkips",
        )[0][0]
    }<br /><br />

    Your most listened hour is: {
        data.hourOfDay
        .sorted("listenDuration")
        .at(-1)[0]
    }<br />
    Your most played hour is: {
        data.hourOfDay
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most skipped hour is: {
        data.hourOfDay
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most fully skipped hour is: {
        data.hourOfDay
        .sorted("fullSkips")
        .at(-1)[0]
    }<br />
    Your most partially skipped hour is: {
        data.hourOfDay
        .sorted("partialSkips")
        .at(-1)[0]
    }<br /><br /><br /><br />

    Your least listened device is: {
        data.deviceCache.sorted(
            "listenDuration",
        )[0][0]
    }<br />
    Your least played device is: {
        data.deviceCache.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least skipped device is: {
        data.deviceCache.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least fully skipped device is: {
        data.deviceCache.sorted(
            "fullSkips",
        )[0][0]
    }<br />
    Your least partially skipped device is: {
        data.deviceCache.sorted(
            "partialSkips",
        )[0][0]
    }<br /><br />

    Your most listened device is: {
        data.deviceCache
        .sorted("listenDuration")
        .at(-1)[0]
    }<br />
    Your most played device is: {
        data.deviceCache
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most skipped device is: {
        data.deviceCache
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most fully skipped device is: {
        data.deviceCache
        .sorted("fullSkips")
        .at(-1)[0]
    }<br />
    Your most partially skipped device is: {
        data.deviceCache
        .sorted("partialSkips")
        .at(-1)[0]
    }<br /><br /><br /><br />

    Your least listened client is: {
        data.clientCache.sorted(
            "listenDuration",
        )[0][0]
    }<br />
    Your least played client is: {
        data.clientCache.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least skipped client is: {
        data.clientCache.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least fully skipped client is: {
        data.clientCache.sorted(
            "fullSkips",
        )[0][0]
    }<br />
    Your least partially skipped client is: {
        data.clientCache.sorted(
            "partialSkips",
        )[0][0]
    }<br /><br />

    Your most listened client is: {
        data.clientCache
        .sorted("listenDuration")
        .at(-1)[0]
    }<br />
    Your most played client is: {
        data.clientCache
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most skipped client is: {
        data.clientCache
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most fully skipped client is: {
        data.clientCache
        .sorted("fullSkips")
        .at(-1)[0]
    }<br />
    Your most partially skipped client is: {
        data.clientCache
        .sorted("partialSkips")
        .at(-1)[0]
    }<br /><br /><br /><br />

    Your least listened method is: {
        data.playbackCache.sorted(
            "listenDuration",
        )[0][0]
    }<br />
    Your least played method is: {
        data.playbackCache.sorted([
            "fullPlays",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least skipped method is: {
        data.playbackCache.sorted([
            "fullSkips",
            "partialSkips",
        ])[0][0]
    }<br />
    Your least fully skipped method is: {
        data.playbackCache.sorted(
            "fullSkips",
        )[0][0]
    }<br />
    Your least partially skipped method is: {
        data.playbackCache.sorted(
            "partialSkips",
        )[0][0]
    }<br /><br />

    Your most listened method is: {
        data.playbackCache
        .sorted("listenDuration")
        .at(-1)[0]
    }<br />
    Your most played method is: {
        data.playbackCache
        .sorted(["fullPlays", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most skipped method is: {
        data.playbackCache
        .sorted(["fullSkips", "partialSkips"])
        .at(-1)[0]
    }<br />
    Your most fully skipped method is: {
        data.playbackCache
        .sorted("fullSkips")
        .at(-1)[0]
    }<br />
    Your most partially skipped method is: {
        data.playbackCache
        .sorted("partialSkips")
        .at(-1)[0]
    }<br /><br /><br /><br />
{/if}
