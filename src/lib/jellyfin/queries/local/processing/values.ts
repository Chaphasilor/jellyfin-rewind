import {
    type Album,
    type NormalCounters,
    normalCountersInit,
    type Track,
} from '$lib/types';
import Cache from '$lib/utility/cache';
import Value from '$lib/utility/value';

export const tracksCache = new Cache<Track, NormalCounters>(normalCountersInit);
export const albumsCache = new Cache<Album, NormalCounters>(normalCountersInit);
export const artistCache = new Cache<string, NormalCounters>(
    normalCountersInit,
);
export const genresCache = new Cache<null, NormalCounters>(normalCountersInit);

export const deviceCache = new Cache<null, NormalCounters>(normalCountersInit);
export const clientCache = new Cache<null, NormalCounters>(normalCountersInit);
export const playbackCache = new Cache<null, NormalCounters>(
    normalCountersInit,
);

export const dayOfMonth = new Cache<null, NormalCounters>(normalCountersInit);
export const monthOfYear = new Cache<null, NormalCounters>(normalCountersInit);
export const dayOfWeek = new Cache<null, NormalCounters>(normalCountersInit);
export const hourOfDay = new Cache<null, NormalCounters>(normalCountersInit);
export const dayOfYear = new Cache<null, NormalCounters>(normalCountersInit);

export let favorites = new Value(0);
export let generalCounter = new Value<NormalCounters>({
    ...normalCountersInit,
});
export let skipped = new Value(0);
