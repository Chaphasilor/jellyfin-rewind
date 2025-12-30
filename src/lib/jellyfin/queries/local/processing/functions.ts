import {
  downloadingProgress,
  generatingProgress,
  processingProgress,
} from "$lib/globals.ts";
import jellyfin from "$lib/jellyfin/index.ts";
import {
  type Album,
  CounterSources,
  type Genre,
  type JellyfinAlbum,
  type JellyfinArtist,
  type JellyfinGenre,
  type JellyfinTrack,
  type LibraryData,
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
import { logAndReturn } from "../../../../utility/logging.ts";
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

export function processAlbum(album: JellyfinAlbum): string | undefined {
  if (album.Id == undefined) return undefined;

  return albumsCache.setAndGetKey(album.Id, () => ({
    id: album.Id,
    name: album.Name,
    year: album.PremiereDate
      ? new Date(album.PremiereDate).getFullYear()
      : null,
    lastPlayed: album.UserData?.LastPlayedDate
      ? new Date(album.UserData.LastPlayedDate)
      : null,
    artists: (album.ArtistItems ?? []).map((
      { Id, Name }: { Id: string; Name: string },
    ) => Id),
    albumArtists: (album.AlbumArtists ?? []).map((
      { Id, Name }: { Id: string; Name: string },
    ) => Id),
    imageTag: (album.ImageTags ?? { Primary: undefined }).Primary,
    imageBlur: album.ImageTags && album.ImageBlurHashes.Primary
      ? album.ImageBlurHashes.Primary[album.ImageTags.Primary]
      : undefined,
  }));
}

export function processArtist(artist: JellyfinArtist): string | undefined {
  if (artist.Id == undefined) return undefined;

  return artistCache.setAndGetKey(artist.Id, () => ({
    id: artist.Id,
    name: artist.Name,
    lastPlayed: artist.UserData?.LastPlayedDate
      ? new Date(artist.UserData.LastPlayedDate)
      : null,
    imageTag: (artist.ImageTags ?? { Primary: undefined }).Primary,
    imageBlur: artist.ImageTags && artist.ImageBlurHashes.Primary
      ? artist.ImageBlurHashes.Primary[artist.ImageTags.Primary]
      : undefined,
    backdropTag: artist.BackdropImageTags?.at?.(0),
    backdropBlur: artist.ImageBlurHashes?.Backdrop
      ?.[artist.BackdropImageTags.at(0)],
  }));
}

export function processGenre(genre: JellyfinGenre): string {
  return genresCache.setAndGetKey(genre.Id, () => ({
    id: genre.Id,
    name: genre.Name,
    lastPlayed: genre.UserData?.LastPlayedDate
      ? new Date(genre.UserData.LastPlayedDate)
      : null,
    imageTag: (genre.ImageTags ?? { Primary: undefined }).Primary,
    imageBlur: genre.ImageTags && genre.ImageBlurHashes.Primary
      ? genre.ImageBlurHashes.Primary[genre.ImageTags.Primary]
      : undefined,
  }));
}

export function processGenres(track: JellyfinTrack): string[] {
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

export function increaseTimesForTrack(
  source: CounterSources,
  listen: Listen | null,
  delta: PlaybackCounterDelta,
) {
  if (listen !== null) {
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
  } else {
    // we can't set any of the listen-related caches, since vanilla Jellyfin doesn't provide that data
  }
}

export async function getMusicLibrary(): Promise<Result<any[]>> {
  const allLibraries = await jellyfin.getData(
    `UserViews?userId=${jellyfin.user?.id}`,
  ) as Result<{
    Items: any[];
  }>;
  console.log(`allLibraries:`, allLibraries);
  if (!allLibraries.success) {
    return logAndReturn("processing", {
      success: false,
      reason: !allLibraries.reason ? allLibraries.reason : "No libraries found",
    });
  }
  const musicLibraries = allLibraries.data.Items.filter((lib) =>
    lib.CollectionType === "music"
  );
  console.log(`musicLibraries:`, musicLibraries);
  if (musicLibraries.length === 0) {
    return logAndReturn("processing", {
      success: false,
      reason: "No music libraries found",
    });
  }

  return logAndReturn("musicLibraries", {
    success: true,
    data: musicLibraries,
  });
}

export async function getTracksForLibrary(libraryId: string) {
  const query: string[] = [];
  query.push(`ParentId=${libraryId}`);
  query.push(`includeItemTypes=Audio`);
  query.push(`recursive=true`);
  query.push(`fields=Genres,AudioInfo,ParentId,Ak`);
  query.push(`enableImageTypes=Primary`);
  const route = `Users/${jellyfin.user?.id}/Items?${query.join(`&`)}`;
  return (await jellyfin.getData(route)) as Result<{ Items: JellyfinTrack[] }>;
}

export async function getAlbumsForLibrary(libraryId: string) {
  const query: string[] = [];
  query.push(`ParentId=${libraryId}`);
  query.push(`includeItemTypes=MusicAlbum`);
  query.push(`recursive=true`);
  //TODO match against old queries
  query.push(`fields=Genres,AudioInfo,ParentId,Ak`);
  query.push(`enableImageTypes=Primary`);
  const route = `Users/${jellyfin.user?.id}/Items?${query.join(`&`)}`;
  return (await jellyfin.getData(route)) as Result<{ Items: JellyfinAlbum[] }>;
}

export async function getArtistsForLibrary(libraryId: string) {
  const query: string[] = [];
  query.push(`parentId=${libraryId}`);
  query.push(`userId=${jellyfin.user?.id}`);
  query.push(`fields=BasicSyncInfo,Genres`);
  query.push(`enableImageTypes=Primary,Backdrop,Banner,Thumb`);
  query.push(`recursive=true`);
  query.push(`enableImageTypes=Primary`);
  const route = `Artists?${query.join(`&`)}`;
  return (await jellyfin.getData(route)) as Result<{ Items: JellyfinArtist[] }>;
}

export async function getAlbumArtistsForLibrary(libraryId: string) {
  const query: string[] = [];
  query.push(`parentId=${libraryId}`);
  query.push(`userId=${jellyfin.user?.id}`);
  query.push(`fields=BasicSyncInfo,Genres`);
  query.push(`enableImageTypes=Primary,Backdrop,Banner,Thumb`);
  query.push(`recursive=true`);
  query.push(`enableImageTypes=Primary`);
  const route = `Artists/AlbumArtists?${query.join(`&`)}`;
  return (await jellyfin.getData(route)) as Result<{ Items: JellyfinArtist[] }>;
}

export async function getGenresForLibrary(libraryId: string) {
  const query: string[] = [];
  query.push(`parentId=${libraryId}`);
  query.push(`userId=${jellyfin.user?.id}`);
  query.push(`fields=ItemCounts`);
  query.push(`recursive=true`);
  query.push(`enableImageTypes=Primary`);

  const route = `Genres?${query.join(`&`)}`;
  console.log(`route:`, route);
  return (await jellyfin.getData(route)) as Result<{ Items: JellyfinGenre[] }>;
}

export async function loadItemInfoBatched(itemIds: string[]) {
  let combinedResponse = {
    Items: [] as JellyfinTrack[],
  };
  const batchSize = 200;
  let response;
  for (
    let batchIndex = 0;
    batchIndex < Math.ceil(itemIds.length / batchSize);
    batchIndex++
  ) {
    console.info(`Fetching item batch info`);
    response = await loadItemInfo(
      itemIds.slice(batchSize * batchIndex, batchSize * (batchIndex + 1)),
    );
    if (response.success) {
      if (!combinedResponse) {
        combinedResponse = response.data;
      } else {
        combinedResponse.Items.push(...response.data.Items);
      }
      console.log(
        `combinedResponse.Items.length:`,
        combinedResponse.Items.length,
      );
    }
  }

  return logAndReturn("loadItemInfoBatched", {
    success: true,
    data: combinedResponse,
  });
}

export async function loadItemInfo(
  itemIds: string[],
): Promise<Result<{ Items: JellyfinTrack[] }>> {
  const query: string[] = [];
  query.push(`includeItemTypes=Audio`);
  query.push(`recursive=true`);
  query.push(`fields=Genres,AudioInfo,ParentId,Ak`);
  query.push(`enableImageTypes=Primary`);
  if (itemIds.length > 0) {
    query.push(`ids=${[...new Set(itemIds)].join(",")}`);
  }
  const route = `Users/${jellyfin.user?.id}/Items?${query.join(`&`)}`;
  return (await jellyfin.getData(route)) as Result<{ Items: JellyfinTrack[] }>;
}

export function compactTrack(track: JellyfinTrack): Track {
  if (
    track.GenreItems.length > 0 && (
      track.GenreItems.at(0)?.Id === "b07f6e4dee1b2ef4b4387eedde4f3145"
      // || track.GenreItems.at(0)?.Name === "Dance"
    )
  ) {
    console.log(`track.GenreItems:`, track.GenreItems);
  }
  return {
    id: track.Id,
    name: track.Name,
    //TODO account for other date types
    year: track.PremiereDate
      ? new Date(track.PremiereDate).getFullYear()
      : null,
    albumId: track.AlbumId,
    artists: track.ArtistItems.map((
      { Id, Name }: { Id: string; Name: string },
    ) => Id),
    albumArtists: track.AlbumArtists.map((
      { Id, Name }: { Id: string; Name: string },
    ) => Id),
    duration: Math.ceil(track.RunTimeTicks / 10_000_000),
    favorite: track.UserData.IsFavorite,
    lastPlayed: track.UserData?.LastPlayedDate
      ? new Date(track.UserData.LastPlayedDate)
      : null,
    genres: track.GenreItems.map(({ Id, Name }: { Id: string; Name: string }) =>
      Id
    ),
    imageTag: (track.ImageTags ?? { Primary: undefined }).Primary,
    imageBlur: track.ImageTags && track.ImageBlurHashes.Primary
      ? track.ImageBlurHashes.Primary[track.ImageTags.Primary]
      : undefined,
  };
}

export function increaseCachesForPlaybackReportingTrack(
  listen: Listen,
  track: Track,
  delta: PlaybackCounterDelta,
) {
  const source = CounterSources.PLAYBACK_REPORTING;
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

  listensCache.setAndGetKey(listen.rowId!, () => listen);
  listensCache.count(listen.rowId!, source, {
    ...delta,
    listens: undefined, // avoid double counting
  });
  tracksCache.count(track.id, source, delta);
  track.albumId ? albumsCache.count(track.albumId, source, delta) : null;
  (new Set<string>([...track.artists, ...track.albumArtists])).forEach(
    (artist) => {
      artistCache.count(artist, source, delta);
    },
  );
  track.genres.forEach((genre) => {
    genresCache.count(genre, source, delta);
  });
}

export function increaseCachesForJellyfinTrack(
  track: JellyfinTrack,
  delta: PlaybackCounterDelta,
) {
  const source = CounterSources.JELLYFIN;
  // we can't set any of the listen-related caches, since vanilla Jellyfin doesn't provide that data
  tracksCache.count(track.Id, source, delta);
}

function generateCountsDelta(
  listen: Listen | null,
  item: JellyfinTrack | JellyfinAlbum | JellyfinArtist | JellyfinGenre,
): Partial<PlaybackCounter["counters"][CounterSources]> {
  const jellyfinPlayCount = item?.UserData?.PlayCount ?? 0;
  return listen !== null
    ? {
      fullPlays: listen.isFullPlay ? 1 : 0,
      partialSkips: listen.isPartialSkip ? 1 : 0,
      fullSkips: listen.isSkip ? 1 : 0,
      listenDuration: listen.playDuration,
      listens: new Set([listen.rowId!]),
    }
    : {
      // Jellyfin only counts listens and cannot recognize skips
      fullPlays: jellyfinPlayCount,
      partialSkips: 0,
      fullSkips: 0,
      listenDuration: item.Type === "Audio"
        ? (item.RunTimeTicks / 10_000_000) *
          jellyfinPlayCount
        : 0, // we can't calculate listen duration for non-tracks, since their play count and runtime are not related
      listens: new Set<string>(),
    };
}

export function updateCountersForPlaybackReportingTrack(
  listen: Listen,
  track: Track,
) {
  const delta = generateCountsDelta(listen, track);
  generalCounter.v.applyDelta(CounterSources.PLAYBACK_REPORTING, delta);
  increaseCachesForPlaybackReportingTrack(
    listen,
    track,
    delta,
  );
  increaseTimesForTrack(CounterSources.PLAYBACK_REPORTING, listen, delta);
}

export function updateCountersForJellyfinTrack(
  track: JellyfinTrack,
) {
  const delta = generateCountsDelta(null, track);
  generalCounter.v.applyDelta(CounterSources.JELLYFIN, delta);
  increaseCachesForJellyfinTrack(track, delta);
  increaseTimesForTrack(CounterSources.JELLYFIN, null, delta);
}

export function updateCountersForAlbum(
  source: CounterSources,
  album: JellyfinAlbum,
) {
  const delta = generateCountsDelta(null, album);
  // generalCounter.v.applyDelta(source, delta); //!!! don't double count album plays, generalCounter is only for tracks
  albumsCache.count(album.id, source, delta);
}

export function updateCountersForArtist(
  source: CounterSources,
  artist: JellyfinArtist,
) {
  const delta = generateCountsDelta(null, artist);
  console.log(`delta:`, delta);
  // generalCounter.v.applyDelta(source, delta); //!!! don't double count album plays, generalCounter is only for tracks
  artistCache.count(artist.id, source, delta);
}

export function updateCountersForGenre(
  source: CounterSources,
  genre: JellyfinGenre,
) {
  const delta = generateCountsDelta(null, genre);
  // generalCounter.v.applyDelta(source, delta); //!!! don't double count album plays, generalCounter is only for tracks
  genresCache.count(genre.id, source, delta);
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
