import { downloadingProgress, generatingProgress, processingProgress } from "$lib/globals.ts";
import jellyfin from "$lib/jellyfin/index.ts";
import {
    type Listen,
    type NormalCounters,
    normalCountersInit,
    type Result,
    type Track,
} from "$lib/types.ts";
import { getDayOfYear } from "$lib/utility/other.ts";
import {
    albumsCache,
    artistCache,
    clientCache,
    dayOfMonth,
    dayOfWeek,
    dayOfYear,
    deviceCache,
    favorites,
    generalCounter,
    genresCache,
    hourOfDay,
    monthOfYear,
    playbackCache,
    skipped,
    tracksCache,
} from "./values.ts";

export function processArtists(track: any): string[] {
    if (track.ArtistItems == undefined) return [];

    const items = track.ArtistItems ?? [];
    return items.map((artist: any) =>
        artistCache.setAndGetKey(artist.Id, () => artist.Name)
    );
}

export function processAlbum(track: any): string | undefined {
    if (track.AlbumId == undefined) return undefined;

    return albumsCache.setAndGetKey(track.AlbumId, () => ({
        id: track.AlbumId,
        name: track.Album,
        artist: track.AlbumArtist,
        artists: processArtists(track.AlbumArtists),
        imageTag: track.AlbumPrimaryImageTag,
    }));
}

export function processGenres(track: any): string[] {
    track.Genres.forEach((genre: string) =>
        genresCache.setAndGetKey(genre, () => null)
    );

    return track.Genres ?? [];
}

export function trackToItemName(t: Track) {
    const artist = t.artists.length == 0 ? "Not Known" : t.artists
        .map((id) => artistCache.get(id))
        .filter((a) => a != undefined)
        .join(",");

    // the format of ItemName in Playback Reporting
    return `${artist} - ${t.name}`;
}

export function getTrackFromItem(item: any) {
    const idMatch = tracksCache.get(item.ItemId);
    if (idMatch != undefined) return idMatch;
    return tracksCache.find((track) =>
        item.ItemName.startsWith(trackToItemName(track))
    );
}

export function increaseTimes(listen: any, fn: any) {
    const month = listen.DateCreated.getMonth().toString();
    const weday = listen.DateCreated.getDate().toString();
    const moday = listen.DateCreated.getDay().toString();
    const hours = listen.DateCreated.getHours().toString();
    const dYear = getDayOfYear(listen.DateCreated).toString();

    monthOfYear.setAndGetKey(month, () => null);
    monthOfYear.count(month, fn);

    dayOfWeek.setAndGetKey(moday, () => null);
    dayOfWeek.count(moday, fn);

    dayOfMonth.setAndGetKey(weday, () => null);
    dayOfMonth.count(weday, fn);

    hourOfDay.setAndGetKey(hours, () => null);
    hourOfDay.count(hours, fn);

    dayOfYear.setAndGetKey(dYear, () => null);
    dayOfYear.count(dYear, fn);
}

export async function getMusicLibrary() {
    let query = "";
    query += "includeItemType=Audio";
    query += "&recursive=true";
    query += "&fields=Genres,ParentId";
    query += "&enableImageTypes=Primary";
    const route = `Users/${jellyfin.user?.id}/Items?${query}`;
    return (await jellyfin.getData(route)) as Result<{ Items: any[] }>;
}

export function compactTrack(track: any): Track {
    const artists = processArtists(track);
    const album = processAlbum(track);
    const genres = processGenres(track);
    return {
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
    };
}

export function increaseCaches(listen: Listen, track: Track, fn: any) {
    deviceCache.setAndGetKey(listen.DeviceName, () => null);
    deviceCache.count(listen.DeviceName, fn);
    clientCache.setAndGetKey(listen.ClientName, () => null);
    clientCache.count(listen.ClientName, fn);
    playbackCache.setAndGetKey(listen.PlaybackMethod, () => null);
    playbackCache.count(listen.PlaybackMethod, fn);

    tracksCache.count(track.id, fn);
    track.albumId ? albumsCache.count(track.albumId, fn) : null;
    track.artists.forEach((artist) => {
        artistCache.count(artist, fn);
    });
    track.genres.forEach((genre) => {
        genresCache.count(genre, fn);
    });
}

export function updateCounters(listen: Listen, track: Track) {
    const isPartialSkip = listen.PlayDuration < track.duration * 0.7;
    const isFullSkip = listen.PlayDuration < track.duration * 0.3;

    const increaseCounts = (count: NormalCounters) => {
        if (isFullSkip) count.fullSkips++;
        else if (isPartialSkip) count.partialSkips++;
        else count.fullPlays++;
        count.listenDuration += listen.PlayDuration;
        return count;
    };

    generalCounter.v = increaseCounts(generalCounter.v);
    increaseCaches(listen, track, increaseCounts);
    increaseTimes(listen, increaseCounts);
}

export function reset() {
    tracksCache.flush();
    albumsCache.flush();
    artistCache.flush();
    genresCache.flush();
    deviceCache.flush();
    clientCache.flush();
    favorites.v = 0;
    generalCounter.v = { ...normalCountersInit };
    skipped.v = 0;

    downloadingProgress.set({cur:0, max: 0, detail: ""})
    processingProgress.set({cur:0, max: 0, detail: ""})
    generatingProgress.set({cur:0, max: 0, detail: ""})
}
