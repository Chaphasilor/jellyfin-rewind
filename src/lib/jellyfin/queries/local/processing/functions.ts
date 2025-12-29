import {
  downloadingProgress,
  generatingProgress,
  processingProgress,
} from "$lib/globals.ts";
import jellyfin from "$lib/jellyfin/index.ts";
import {
  CounterSources,
  type Genre,
  Listen,
  type ListenQueryRow,
  normalCountersInit,
  PlaybackCounter,
  type PlaybackCounterDelta,
  type Result,
  SkipType,
  type Track,
} from "$lib/types.ts";
import { getDayOfYear } from "$lib/utility/other.ts";
import {
  albumsCache,
  artistCache,
  clientCache,
  combinedDeviceClientCache,
  dayOfMonthCache,
  dayOfWeekCache,
  dayOfYearCache,
  deviceCache,
  favorites,
  generalCounter,
  genresCache,
  hourOfDayCache,
  listensCache,
  monthOfYearCache,
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
  const genreIds: string[] = [];
  track.GenreItems.forEach((genre: any) => {
    const genreInfo: Genre = {
      id: genre.Id,
      name: genre.Name || `Unknown Genre`,
    };
    genresCache.setAndGetKey(genre.Id, () => genreInfo);
    genreIds.push(genre.Id);
  });

  return genreIds;
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

export function increaseTimes(
  source: CounterSources,
  listen: Listen,
  delta: PlaybackCounterDelta,
) {
  const month = listen.dateCreated.getMonth().toString();
  const dayOfMonth = listen.dateCreated.getDate().toString();
  const dayOfWeek = listen.dateCreated.getDay().toString();
  const hours = listen.dateCreated.getHours().toString();
  const dYear = getDayOfYear(listen.dateCreated).toString();

  monthOfYearCache.setAndGetKey(month, () => null);
  monthOfYearCache.count(month, source, delta);

  dayOfWeekCache.setAndGetKey(dayOfWeek, () => null);
  dayOfWeekCache.count(dayOfWeek, source, delta);

  dayOfMonthCache.setAndGetKey(dayOfMonth, () => null);
  dayOfMonthCache.count(dayOfMonth, source, delta);

  hourOfDayCache.setAndGetKey(hours, () => null);
  hourOfDayCache.count(hours, source, delta);

  dayOfYearCache.setAndGetKey(dYear, () => null);
  dayOfYearCache.count(dYear, source, delta);
}

export async function getMusicLibrary() {
  let query = "";
  query += "includeItemTypes=Audio";
  query += "&recursive=true";
  query += "&fields=Genres,ParentId,AudioInfo,ParentId,Ak";
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
    //TODO account for other date types
    year: track.PremiereDate
      ? new Date(track.PremiereDate).getFullYear()
      : null,
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

export function increaseCaches(
  source: CounterSources,
  listen: Listen,
  track: Track,
  delta: PlaybackCounterDelta,
) {
  deviceCache.setAndGetKey(listen.deviceName, () => null);
  deviceCache.count(listen.deviceName, source, delta);
  clientCache.setAndGetKey(listen.clientName, () => null);
  clientCache.count(listen.clientName, source, delta);

  const combinedDeviceClientKey = `${listen.deviceName} - ${listen.clientName}`;
  combinedDeviceClientCache.setAndGetKey(combinedDeviceClientKey, () => ({
    device: listen.deviceName,
    client: listen.clientName,
  }));
  combinedDeviceClientCache.count(combinedDeviceClientKey, source, delta);

  const playbackMethodKey = listen.playbackMethod === `DirectPlay`
    ? `directPlay`
    : listen.playbackMethod === `Transcode` ||
        listen.playbackMethod.match(/Transcode \(v:[^\s]/)
    ? `transcode`
    : `directStream`;
  playbackCache.setAndGetKey(playbackMethodKey, () => null);
  playbackCache.count(playbackMethodKey, source, delta);

  listensCache.setAndGetKey(listen.rowId, () => listen);
  listensCache.count(listen.rowId, source, delta);

  tracksCache.count(track.id, source, delta);
  track.albumId ? albumsCache.count(track.albumId, source, delta) : null;
  track.artists.forEach((artist) => {
    artistCache.count(artist, source, delta);
  });
  track.genres.forEach((genre) => {
    genresCache.count(genre, source, delta);
  });
}

function generateCountsDelta(listen: Listen) {
  return {
    fullPlays: listen.isFullPlay ? 1 : 0,
    partialSkips: listen.isPartialSkip ? 1 : 0,
    fullSkips: listen.isSkip ? 1 : 0,
    listenDuration: listen.playDuration,
  };
}

export function updateCounters(
  source: CounterSources,
  listen: Listen,
  track: Track,
) {
  const delta = generateCountsDelta(listen);
  console.log(`delta:`, delta);
  generalCounter.v.applyDelta(source, delta);
  increaseCaches(source, listen, track, delta);
  increaseTimes(source, listen, delta);
}

export function reset() {
  tracksCache.flush();
  albumsCache.flush();
  artistCache.flush();
  genresCache.flush();
  listensCache.flush();
  deviceCache.flush();
  clientCache.flush();
  combinedDeviceClientCache.flush();
  favorites.v = 0;
  generalCounter.v = new PlaybackCounter(normalCountersInit);
  skipped.v = 0;

  downloadingProgress.set({ cur: 0, max: 0, detail: "" });
  processingProgress.set({ cur: 0, max: 0, detail: "" });
  generatingProgress.set({ cur: 0, max: 0, detail: "" });
}
