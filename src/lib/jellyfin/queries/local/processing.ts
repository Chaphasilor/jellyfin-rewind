import { dev } from "$app/environment";
import {
    type Album,
    fetchingTaskDone,
    fetchingTaskTodo,
    initTasksDone,
    initTasksTodo,
    type NormalCounters,
    normalCountersInit,
    processTaskDone,
    processTaskTodo,
    type Result,
    type Track,
} from "$lib/globals";
import jellyfin from "$lib/jellyfin";
import { Cache, getDayOfYear, logAndReturn } from "$lib/utility";
import allListens from "../api/allListens";

// these are global because the helper functions right below
const tracksCache = new Cache<Track, NormalCounters>(normalCountersInit);
const albumsCache = new Cache<Album, NormalCounters>(normalCountersInit);
const artistCache = new Cache<string, NormalCounters>(normalCountersInit);
const genresCache = new Cache<null, NormalCounters>(normalCountersInit);
const deviceCache = new Cache<null, NormalCounters>(normalCountersInit);
const clientCache = new Cache<null, NormalCounters>(normalCountersInit);

function processArtists(track: any): string[] {
    if (track.ArtistItems == undefined) return [];

    const items = track.ArtistItems ?? [];
    return items
        .map((artist: any) =>
            artistCache
                .setAndGetKey(artist.Id, () => (artist.Name))
        );
}

function processAlbum(track: any): string | undefined {
    if (track.AlbumId == undefined) return undefined;

    return albumsCache.setAndGetKey(
        track.AlbumId,
        () => ({
            id: track.AlbumId,
            name: track.Album,
            artist: track.AlbumArtist,
            artists: processArtists(track.AlbumArtists),
            imageTag: track.AlbumPrimaryImageTag,
        }),
    );
}

function processGenres(track: any): string[] {
    track.Genres.forEach((genre: string) =>
        genresCache.setAndGetKey(genre, () => null)
    );

    return track.Genres ?? [];
}

function trackToItemName(t: Track) {
    const artist = t.artists.length == 0 ? "Not Known" : t.artists
        .map((id) => artistCache.get(id))
        .filter((a) => a != undefined)
        .join(",");

    const album = albumsCache.get(t.albumId) ?? "Not Known";

    // the format of ItemName in Playback Reporting
    return `${artist} - ${t.name} (${album})`;
}

function getTrackFromItem(item: any) {
    const idMatch = tracksCache.get(item.ItemId);
    if (idMatch != undefined) return idMatch;
    return tracksCache.find((track) => trackToItemName(track) == item.ItemName);
}

export default async (): Promise<Result<any>> => {
    fetchingTaskTodo.set(2); // Queue Updates Ui

    const listens = await allListens();
    if (!listens.success || listens.data.length == 0) {
        return logAndReturn("processing", {
            success: false,
            reason: !listens.success
                ? listens.reason
                : "You didnt Listen to anything",
        });
    }
    fetchingTaskDone.set(1); // Queue Updates Ui

    const query =
        "includeItemType=Audio&recursive=true&fields=Genres,ParentId&enableImageTypes=Primary";
    const library = await jellyfin.getData(
        `Users/${jellyfin.user?.id}/Items?${query}`,
    ) as Result<{ Items: any[] }>;
    if (!library.success || library.data.Items.length == 0) {
        return logAndReturn("processing", {
            success: false,
            reason: !library.success ? library.reason : "Your Library is empty",
        });
    }
    fetchingTaskDone.set(2); // Queue Updates Ui

    let favorites = 0;

    initTasksTodo.set(library.data.Items.length);
    processTaskTodo.set(listens.data.length);

    let i = 0;
    for (const track of library.data.Items) {
        i++;
        if (track.UserData.IsFavorite) favorites++;
        const artists = processArtists(track);
        const album = processAlbum(track);
        const genres = processGenres(track);
        tracksCache.setAndGetValue(
            track.Id,
            () => ({
                id: track.Id,
                name: track.Name,
                albumId: album,
                artists: artists,
                duration: Math.ceil(track.RunTimeTicks / 10_000_000),
                favorite: track.UserData.IsFavorite,
                genres: genres,
                imageTag: (track.imageTags ?? { Primary: undefined }).Primary,
                imageBlur: track.imageTags
                    ? track.ImageBlurHashes.Primary[track.imageTags.Primary]
                    : undefined,
            }),
        );
        initTasksDone.set(i); // Queue Updates Ui
        if (Math.random() > 0.95) await new Promise((r) => setTimeout(r, 0)); // Give UI time to actually update
    }

    const dayOfMonth: NormalCounters[] = Array
        .from({ length: 32 })
        .map(() => ({ ...normalCountersInit }));
    const monthOfYear: NormalCounters[] = Array
        .from({ length: 13 })
        .map(() => ({ ...normalCountersInit }));
    const dayOfWeek: NormalCounters[] = Array
        .from({ length: 8 })
        .map(() => ({ ...normalCountersInit }));
    const hourOfDay: NormalCounters[] = Array
        .from({ length: 25 })
        .map(() => ({ ...normalCountersInit }));
    const dayOfYear: NormalCounters[] = Array
        .from({ length: 366 })
        .map(() => ({ ...normalCountersInit }));

    let generalCounter = { ...normalCountersInit };

    let skipped = 0;

    i = 0;
    for (const listen of listens.data) {
        i++;
        processTaskDone.set(i); // Queue Updates Ui

        const track = getTrackFromItem(listen);
        if (!track) {
            skipped++;
            continue;
        }

        const isPartialSkip = listen.PlayDuration < (track.duration) * 0.7;
        const isFullSkip = listen.PlayDuration < (track.duration) * 0.3;

        const increaseCounts = (count: NormalCounters) => {
            if (isFullSkip) count.fullSkips++;
            else if (isPartialSkip) count.partialSkips++;
            else count.fullPlays++;
            count.listenDuration += listen.PlayDuration;
            return count;
        };

        deviceCache.setAndGetKey(listen.DeviceName, () => null);
        deviceCache.count(listen.DeviceName, increaseCounts);
        clientCache.setAndGetKey(listen.ClientName, () => null);
        clientCache.count(listen.ClientName, increaseCounts);

        generalCounter = increaseCounts(generalCounter);
        tracksCache.count(track.id, increaseCounts);

        track.albumId ? albumsCache.count(track.albumId, increaseCounts) : null;

        track.artists.forEach((artist) => {
            artistCache.count(artist, increaseCounts);
        });
        track.genres.forEach((genre) => {
            genresCache.count(genre, increaseCounts);
        });

        const month = listen.DateCreated.getMonth();
        const moday = listen.DateCreated.getDate();
        const weday = listen.DateCreated.getDay();
        const hours = listen.DateCreated.getHours();
        const dYear = getDayOfYear(listen.DateCreated);

        monthOfYear[month] = increaseCounts(monthOfYear[month]);
        dayOfWeek[weday] = increaseCounts(dayOfWeek[weday]);
        dayOfMonth[moday] = increaseCounts(dayOfMonth[moday]);
        hourOfDay[hours] = increaseCounts(hourOfDay[hours]);
        dayOfYear[dYear] = increaseCounts(dayOfYear[dYear]);

        if (Math.random() > 0.95) await new Promise((r) => setTimeout(r, 0)); // give Ui time to update
    }

    return logAndReturn("processing", {
        success: true,
        data: {
            generalCounter,

            dayOfMonth,
            monthOfYear,
            dayOfWeek,
            hourOfDay,
            dayOfYear,

            favorites,
            skipped,

            artist: artistCache.entries,
            tracks: tracksCache.entries,
            albums: albumsCache.entries,
            genres: genresCache.entries,
            device: deviceCache.entries,
            client: clientCache.entries,

            artistCache,
            tracksCache,
            albumsCache,
            genresCache,
            deviceCache,
            clientCache,
        },
    });
};
