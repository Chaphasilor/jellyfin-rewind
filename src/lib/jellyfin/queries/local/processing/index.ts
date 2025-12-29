import {
  downloadingProgress,
  generatingProgress,
  processingProgress,
} from "$lib/globals.ts";
import {
  CounterSources,
  Listen,
  type ProcessingResults,
  type Result,
} from "$lib/types.ts";
import { logAndReturn } from "$lib/utility/logging.ts";
import allListens from "$lib/jellyfin/queries/api/allListens.ts";
import {
  compactTrack,
  getMusicLibrary,
  getTrackFromItem,
  reset,
  updateCounters,
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

  downloadingProgress.set({ cur: 0, max: 2, detail: "" });
  setTimeout(
    () =>
      downloadingProgress.set({
        cur: 1,
        max: 2,
        detail: "Getting library tracks and metadata",
      }),
    100,
  );

  const library = await getMusicLibrary();
  if (!library.success || library.data.Items.length == 0) {
    return logAndReturn("processing", {
      success: false,
      reason: !library.success ? library.reason : "Your Library is empty",
    });
  }

  downloadingProgress.set({
    cur: 2,
    max: 2,
    detail: "Getting playback reports",
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
    max: library.data.Items.length,
    detail: "",
  });
  for (let i = 0; i < library.data.Items.length; i++) {
    const track = library.data.Items[i];
    processingProgress.update((state) => ({
      ...state,
      cur: i + 1,
      detail: track.Name,
    }));

    if (track.UserData.IsFavorite) favorites.v++;

    tracksCache.setAndGetValue(track.Id, () => compactTrack(track));

    if (Math.random() > 0.8) {
      await new Promise((r) => setTimeout(r, 1)); // give Ui time to update
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

    const track = getTrackFromItem(rawListen);
    if (!track) {
      console.warn(`Track not found for listen:`, rawListen);
      skipped.v++;
      continue;
    }

    updateCounters(CounterSources.PLAYBACK_REPORTING, listen, track);

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
