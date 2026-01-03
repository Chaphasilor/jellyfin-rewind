import {
  downloadingProgress,
  generatingProgress,
  playbackReportingAvailable,
  processingListensProgress,
  processingProgress,
} from "$lib/globals.ts";
import {
  CounterSources,
  type LibraryData,
  Listen,
  type ListenQueryRow,
  type ProcessingResults,
  type Result,
} from "$lib/types.ts";
import { logAndReturn } from "$lib/utility/logging.ts";
import { run } from "svelte/legacy";
import allListens from "../../api/playbackReporting.ts";
import {
  compactTrack,
  getAlbumArtistsForLibrary,
  getAlbumsForLibrary,
  getAllArtistsWithProperIdsForLibrary,
  getArtistsForLibrary,
  getGenresForLibrary,
  getMusicLibrary,
  getTrackFromItem,
  getTracksForLibrary,
  processAlbum,
  processArtist,
  processGenre,
  reset,
  updateCountersForAlbum,
  updateCountersForArtist,
  updateCountersForGenre,
  updateCountersForJellyfinTrack,
  updateCountersForPlaybackReportingTrack,
} from "./functions.ts";
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

async function waitForUi() {
  // 20% chance -> 80% speedup
  if (Math.random() > 0.8) {
    await new Promise((r) => setTimeout(r, 1)); // give Ui time to update
  }
}

const execute = async (): Promise<Result<ProcessingResults>> => {
  await reset();

  const libraryResult = await getMusicLibrary();
  if (!libraryResult.success || !libraryResult.data) {
    return logAndReturn("processing", {
      success: false,
      reason: "No libraries found",
    });
  }
  const musicLibraries = libraryResult.data;

  // fetch library items
  const libraryData: LibraryData = [];
  downloadingProgress.setMax(musicLibraries.length * 4)
  for (let i = 0; i < musicLibraries.length; i++) {
    const library = musicLibraries[i];

    const tracksResult = await getTracksForLibrary(library.Id);
    if (!tracksResult.success) {
      console.warn(`No tracks found for library:`, library.Name);
      continue;
    }
    const tracks = tracksResult.data.Items;

    await downloadingProgress.next()

    const albumsResult = await getAlbumsForLibrary(library.Id);
    if (!albumsResult.success) {
      console.warn(`No albums found for library:`, library.Name);
    }
    const albums = albumsResult.success ? albumsResult.data?.Items : [];

    await downloadingProgress.next()

    const artistsResult = await getAllArtistsWithProperIdsForLibrary(
      library.Id,
    );
    if (!artistsResult.success) {
      console.warn(`No artists found for library:`, library.Name);
    }
    const artists = artistsResult.success ? artistsResult.data?.Items : [];

    const performingArtistsResult = await getArtistsForLibrary(library.Id);
    if (!performingArtistsResult.success) {
      console.warn(`No performingArtists found for library:`, library.Name);
    }
    const performingArtists = performingArtistsResult.success
      ? performingArtistsResult.data?.Items
      : [];

    const albumArtistsResult = await getAlbumArtistsForLibrary(library.Id);
    if (!albumArtistsResult.success) {
      console.warn(`No albumArtists found for library:`, library.Name);
    }
    const albumArtists = albumArtistsResult.success
      ? albumArtistsResult.data?.Items
      : [];

    await downloadingProgress.next()

    const genresResult = await getGenresForLibrary(library.Id);
    if (!genresResult.success) {
      console.warn(`No genres found for library:`, library.Name);
    }
    const genres = genresResult.success ? genresResult.data?.Items : [];

    await downloadingProgress.next()

    libraryData.push({
      id: library.Id,
      name: library.Name,
      tracks: tracks,
      albums: albums,
      artists: artists,
      performingArtists: performingArtists,
      albumArtists: albumArtists,
      genres: genres,
    });
  }
  logAndReturn("libraryData", libraryData);

  let listens: ListenQueryRow[] = [];

  try {
    const listensResult = await allListens();
    if (!listensResult.success) {
      throw listensResult.reason;
    } else {
      listens = listensResult.data;
    }
  } catch (error) {
    console.error(`Couldn't get listensResult: ${error}`);
    playbackReportingAvailable.set(false);
  }

  processingProgress.setMax(libraryData.reduce(
      (sum, lib) =>
        sum + lib.tracks.length + lib.albums.length + lib.artists.length +
        +lib.performingArtists.length +
        lib.albumArtists.length +
        lib.genres.length,
      0,
  ));

  for (const lib of libraryData) {
    //!!! process tracks last so we can increase the counts for all other item types

    // Process Albums
    for (let i = 0; i < lib.albums.length; i++) {
      const album = lib.albums[i];
      await processingProgress.next()
      const processedAlbum = processAlbum(album);
      updateCountersForAlbum(CounterSources.JELLYFIN, album);
    }

    // Process Artists
    for (let i = 0; i < lib.artists.length; i++) {
      const artist = lib.artists[i];
      await processingProgress.next()
      const processedArtist = processArtist(artist);
      updateCountersForArtist(CounterSources.JELLYFIN, artist);
    }

    // Process Performing Artists
    for (let i = 0; i < lib.performingArtists.length; i++) {
      const performingArtist = lib.performingArtists[i];
      await processingProgress.next()
      const processedArtist = processArtist(performingArtist);
        updateCountersForArtist(CounterSources.JELLYFIN, performingArtist);
    }

    //processingListensProgressming & album artists explicitly, and dedupe
    for (let i = 0; i < lib.albumArtists.length; i++) {
      const albumArtist = lib.albumArtists[i];
      await processingProgress.next()
      const processedArtist = processArtist(albumArtist);
      updateCountersForArtist(CounterSources.JELLYFIN, albumArtist);
    }

    console.log(`lib.genres.length:`, lib.genres.length);
    // Process Genres
    for (let i = 0; i < lib.genres.length; i++) {
      const genre = lib.genres[i];
      await processingProgress.next()
      const processedGenre = processGenre(genre);
      updateCountersForGenre(CounterSources.JELLYFIN, genre);
    }

    // Process Tracks
    for (let i = 0; i < lib.tracks.length; i++) {
      const track = lib.tracks[i];
      await processingProgress.next()
      if (track.UserData.IsFavorite) favorites.v++;
      const processedTrack = compactTrack(track);
      const processedTrackId = tracksCache.setAndGetValue(
        track.Id,
        () => processedTrack,
      );

      updateCountersForJellyfinTrack(track, processedTrack);
    }
  }

  if (listens.length === 0) {
    playbackReportingAvailable.set(false);
    console.warn(`No listens to process from Playback Reporting.`);
  } else {
    processingListensProgress.setMax(listens.length)
    for (let i = 0; i < listens.length; i++) {
      const rawListen = listens[i];
      await processingListensProgress.next()

      const listen = listensCache.setAndGetValue(rawListen.rowid!, () => {
        return new Listen(rawListen, tracksCache.get(rawListen.ItemId));
      });

      const track = tracksCache.get(rawListen.ItemId);
      if (!track) {
        console.warn(`Track not found for listen:`, rawListen);
        skipped.v++;
        continue;
      }

      updateCountersForPlaybackReportingTrack(listen, track);

      await waitForUi();
    }
  }

  generatingProgress.setMax(1)

  return logAndReturn("processing", {
    success: true,
    data: {
      generalCounter: generalCounter.v,

      dayOfMonth: dayOfMonthCache,
      monthOfYear: monthOfYearCache,
      dayOfWeek: dayOfWeekCache,
      hourOfDay: hourOfDayCache,
      dayOfYear: dayOfYearCache,

      favorites: favorites.v,
      skipped: skipped.v,

      artistCache,
      tracksCache,
      albumsCache,
      genresCache,

      listensCache,

      deviceCache,
      clientCache,
      combinedDeviceClientCache,
      playbackCache,
    },
  });
};

export let running: Promise<Result<ProcessingResults>> | undefined = undefined;
function preventDoubleExecution() {
  console.log("Called!", running);
  if (!running) running = execute();
  return running;
}
export async function killCurrentTask() {
  if (running) {
    await running;
    running = undefined;
  }
}

export default preventDoubleExecution;
