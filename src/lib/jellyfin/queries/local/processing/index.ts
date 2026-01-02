import {
  downloadingProgress,
  generatingProgress,
  playbackReportingAvailable,
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
  getAlbumsForLibrary,
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
async function nextProcessing(detail: string) {
  processingProgress.update((state) => ({
    ...state,
    cur: state.cur + 1,
    detail,
  }));
  await waitForUi();
}

const execute = async (): Promise<Result<ProcessingResults>> => {
  await reset();
  downloadingProgress.set({
    cur: 1,
    max: 1,
    detail: "Getting library metadata",
  });

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
  for (let i = 0; i < musicLibraries.length; i++) {
    const library = musicLibraries[i];
    downloadingProgress.set({
      cur: i * 4,
      max: musicLibraries.length * 4,
      detail: `Getting items for '${library.Name}'`,
    });

    const tracksResult = await getTracksForLibrary(library.Id);
    if (!tracksResult.success) {
      console.warn(`No tracks found for library:`, library.Name);
      continue;
    }
    const tracks = tracksResult.data.Items;

    downloadingProgress.set({
      cur: i * 4 + 1,
      max: musicLibraries.length * 4,
      detail: `Getting items for '${library.Name}'`,
    });

    const albumsResult = await getAlbumsForLibrary(library.Id);
    if (!albumsResult.success) {
      console.warn(`No albums found for library:`, library.Name);
    }
    const albums = albumsResult.success ? albumsResult.data?.Items : [];

    downloadingProgress.set({
      cur: i * 4 + 2,
      max: musicLibraries.length * 4,
      detail: `Getting items for '${library.Name}'`,
    });

    const artistsResult = await getArtistsForLibrary(library.Id);
    if (!artistsResult.success) {
      console.warn(`No artists found for library:`, library.Name);
    }
    const artists = artistsResult.success ? artistsResult.data?.Items : [];

    downloadingProgress.set({
      cur: i * 4 + 3,
      max: musicLibraries.length * 4,
      detail: `Getting items for '${library.Name}'`,
    });

    const genresResult = await getGenresForLibrary(library.Id);
    if (!genresResult.success) {
      console.warn(`No genres found for library:`, library.Name);
    }
    const genres = genresResult.success ? genresResult.data?.Items : [];

    downloadingProgress.set({
      cur: i * 4 + 4,
      max: musicLibraries.length * 4,
      detail: `Getting items for '${library.Name}'`,
    });

    libraryData.push({
      id: library.Id,
      name: library.Name,
      tracks: tracks,
      albums: albums,
      artists: artists,
      genres: genres,
    });
  }
  logAndReturn("libraryData", libraryData);

  downloadingProgress.set({
    cur: 2,
    max: 2,
    detail: "Getting Playback Reporting log",
  });
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
  downloadingProgress.set({ cur: 2, max: 2, detail: "" });

  processingProgress.set({
    cur: 0,
    max: libraryData.reduce(
      (sum, lib) =>
        sum + lib.tracks.length + lib.albums.length + lib.artists.length +
        lib.genres.length,
      0,
    ),
    detail: "Preparing...",
  });

  for (const lib of libraryData) {
    //!!! process tracks last so we can increase the counts for all other item types

    // Process Albums
    for (let i = 0; i < lib.albums.length; i++) {
      const album = lib.albums[i];
      await nextProcessing(album.Name);
      const processedAlbum = processAlbum(album);
      updateCountersForAlbum(CounterSources.JELLYFIN, album);
    }

    // Process Artists
    //TODO handle album artists and dedupe
    for (let i = 0; i < lib.artists.length; i++) {
      const artist = lib.artists[i];
      await nextProcessing(artist.Name);
      const processedArtist = processArtist(artist);
      updateCountersForArtist(CounterSources.JELLYFIN, artist);
    }

    console.log(`lib.genres.length:`, lib.genres.length);
    // Process Genres
    for (let i = 0; i < lib.genres.length; i++) {
      const genre = lib.genres[i];
      await nextProcessing(genre.Name);
      const processedGenre = processGenre(genre);
      updateCountersForGenre(CounterSources.JELLYFIN, genre);
    }

    // Process Tracks
    for (let i = 0; i < lib.tracks.length; i++) {
      const track = lib.tracks[i];
      await nextProcessing(track.Name);
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
    generatingProgress.set({ cur: 0, max: listens.length, detail: "" });
    for (let i = 0; i < listens.length; i++) {
      const rawListen = listens[i];
      generatingProgress.update((state) => ({
        ...state,
        cur: i + 1,
        detail: `${rawListen.ItemName}`,
      }));

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
