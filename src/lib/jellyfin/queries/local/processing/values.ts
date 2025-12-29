import {
  type Album,
  type CombinedDeviceClientInfo,
  type Genre,
  type Listen,
  normalCountersInit,
  PlaybackCounter,
  type Track,
} from "$lib/types.ts";
import Cache from "$lib/utility/cache.ts";
import Value from "$lib/utility/value.ts";

export const tracksCache = new Cache<Track>(normalCountersInit);
export const albumsCache = new Cache<Album>(normalCountersInit);
export const artistCache = new Cache<string>(
  normalCountersInit,
);
export const genresCache = new Cache<Genre>(normalCountersInit);

export const listensCache = new Cache<Listen>(normalCountersInit);

export const deviceCache = new Cache<null>(normalCountersInit);
export const clientCache = new Cache<null>(normalCountersInit);
export const combinedDeviceClientCache = new Cache<CombinedDeviceClientInfo>(normalCountersInit);
export const playbackCache = new Cache<null>(
  normalCountersInit,
);

export const dayOfMonthCache = new Cache<null>(normalCountersInit);
export const monthOfYearCache = new Cache<null>(normalCountersInit);
export const dayOfWeekCache = new Cache<null>(normalCountersInit);
export const hourOfDayCache = new Cache<null>(normalCountersInit);
export const dayOfYearCache = new Cache<null>(normalCountersInit);

export const favorites = new Value(0);
export const generalCounter = new Value<PlaybackCounter>(
  new PlaybackCounter(normalCountersInit),
);
export const skipped = new Value(0);
