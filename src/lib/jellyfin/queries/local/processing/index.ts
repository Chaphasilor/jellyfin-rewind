import {
  downloadingProgress,
  generatingProgress,
  processingProgress,
} from "$lib/globals.ts";
import {
  CounterSources,
  type LibraryData,
  Listen,
  type ProcessingResults,
  type Result,
} from "$lib/types.ts";
import { logAndReturn } from "$lib/utility/logging.ts";
import allListens from "$lib/jellyfin/queries/api/allListens.ts";
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

const execute = async (): Promise<Result<ProcessingResults>> => {
  reset();

  downloadingProgress.set({ cur: 0, max: 1, detail: "" });
  setTimeout(
    () =>
      downloadingProgress.set({
        cur: 1,
        max: 1,
        detail: "Getting library metadata",
      }),
    100,
  );

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

  const totalItemCount = libraryData.reduce(
    (sum, lib) =>
      sum + lib.tracks.length + lib.albums.length + lib.artists.length +
      lib.genres.length,
    0,
  );

  //TODO update downloadingProgress in getMusicLibrary
  downloadingProgress.set({
    cur: 2,
    max: 2,
    detail: "Getting Playback Reporting log",
  });
  const listens = await allListens();
  if (!listens.success || listens.data.length == 0) {
    return logAndReturn("processing", {
      success: false,
      reason: !listens.success
        ? listens.reason
        : "You didnt Listen to anything",
    });
  }
  downloadingProgress.set({ cur: 2, max: 2, detail: "" });

  processingProgress.set({
    cur: 0,
    max: totalItemCount,
    detail: "",
  });

  for (const lib of libraryData) {
    // Process Tracks
    for (let i = 0; i < lib.tracks.length; i++) {
      const track = lib.tracks[i];
      processingProgress.update((state) => ({
        ...state,
        cur: i + 1,
        detail: track.Name,
      }));

      if (track.UserData.IsFavorite) favorites.v++;

      const processedTrack = tracksCache.setAndGetValue(
        track.Id,
        () => compactTrack(track),
      );

      if (Math.random() > 0.8) {
        await new Promise((r) => setTimeout(r, 1)); // give Ui time to update
      }

      updateCountersForJellyfinTrack(track);
    }

    // Process Albums
    for (let i = 0; i < lib.albums.length; i++) {
      const album = lib.albums[i];
      processingProgress.update((state) => ({
        ...state,
        cur: lib.tracks.length + i + 1,
        detail: album.Name,
      }));
      const processedAlbum = processAlbum(album);
      updateCountersForAlbum(CounterSources.JELLYFIN, album);
    }

    // Process Artists
    //TODO handle album artists and dedupe
    for (let i = 0; i < lib.artists.length; i++) {
      const artist = lib.artists[i];
      processingProgress.update((state) => ({
        ...state,
        cur: lib.tracks.length + lib.albums.length + i + 1,
        detail: artist.Name,
      }));
      const processedArtist = processArtist(artist);
      updateCountersForArtist(CounterSources.JELLYFIN, artist);
    }

    console.log(`lib.genres.length:`, lib.genres.length);
    // Process Genres
    for (let i = 0; i < lib.genres.length; i++) {
      const genre = lib.genres[i];
      processingProgress.update((state) => ({
        ...state,
        cur: lib.tracks.length + lib.albums.length + lib.artists.length + i +
          1,
        detail: genre.Name,
      }));
      const processedGenre = processGenre(genre);
      if (genre.Name === `Dance`) {
        console.log(
          `genre, processedGenre, genresCache.get(processedGenre):`,
          genre,
          processedGenre,
          genresCache.get(processedGenre),
        );
      }
      updateCountersForGenre(CounterSources.JELLYFIN, genre);
    }
  }

  generatingProgress.set({ cur: 0, max: listens.data.length, detail: "" });
  for (let i = 0; i < listens.data.length; i++) {
    const rawListen = listens.data[i];
    generatingProgress.update((state) => ({
      ...state,
      cur: i + 1,
      detail: rawListen.ItemId,
    }));

    const listen = listensCache.setAndGetValue(rawListen.rowid, () => {
      return new Listen(rawListen, tracksCache.get(rawListen.ItemId));
    });

    const track = tracksCache.get(rawListen.ItemId);
    if (!track) {
      console.warn(`Track not found for listen:`, rawListen);
      skipped.v++;
      continue;
    }

    updateCountersForPlaybackReportingTrack(listen, track);

    if (Math.random() > 0.8) {
      await new Promise((r) => setTimeout(r, 1)); // give Ui time to update
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

let running: Promise<Result<ProcessingResults>> | undefined = undefined;
function preventDoubleExecution() {
  console.log("Called!", running);
  if (!running) running = execute();
  return running;
}

export default preventDoubleExecution;
