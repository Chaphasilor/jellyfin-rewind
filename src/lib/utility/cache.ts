import {
  CounterSources,
  type NumericPlaybackCounterKeys,
  PlaybackCounter,
} from "../types.ts";

export default class Cache<D> {
  private data: Record<
    string,
    {
      data: D;
      counters: PlaybackCounter;
    }
  > = {};
  private keys: Set<string> = new Set();
  private defaultCounters: PlaybackCounter["counters"][CounterSources];

  constructor(defaultCounters: PlaybackCounter["counters"][CounterSources]) {
    // copy because else multiple Caches share the same counters
    this.defaultCounters = { ...defaultCounters };
  }

  setIfNotExists(key: string, value: () => D) {
    if (this.hasKey(key)) return;

    const data = value();
    this.data[key] = {
      data,
      counters: new PlaybackCounter(this.defaultCounters), // stop counter sharing
    };
    this.keys.add(key);
  }

  setAndGetValue(key: string, value: () => D) {
    if (this.hasKey(key)) return this.data[key].data;

    const data = value();
    this.data[key] = {
      data,
      counters: new PlaybackCounter(this.defaultCounters), // stop counter sharing
    };
    this.keys.add(key);

    return this.data[key].data;
  }

  setAndGetKey(key: string, value: () => D) {
    if (this.hasKey(key)) return key;

    this.data[key] = {
      data: value(),
      counters: new PlaybackCounter(this.defaultCounters), // stop counter sharing
    };
    this.keys.add(key);

    return key;
  }

  count(
    key: string,
    source: CounterSources,
    delta: Partial<PlaybackCounter["counters"][CounterSources]>,
  ) {
    if (!this.hasKey(key)) return;
    this.data[key].counters.applyDelta(source, delta);
  }

  updateData(
    key: string,
    updater: (data: D) => D,
  ) {
    if (!this.hasKey(key)) return;
    this.data[key].data = updater(this.data[key].data);
  }

  find(fn: (data: D) => boolean) {
    const key = Object.keys(this.data).find((key) => fn(this.data[key].data));

    if (!key) return false;
    return this.data[key].data;
  }

  get(key: string | undefined) {
    if (!key) return undefined;
    if (this.hasKey(key)) return this.data[key].data;
    return undefined;
  }

  getCounters(key: string | undefined) {
    if (!key) return undefined;
    if (this.hasKey(key)) return this.data[key].counters;
    return undefined;
  }

  sorted(
    source: CounterSources,
    counter:
      | NumericPlaybackCounterKeys
      | (NumericPlaybackCounterKeys)[],
    sortDirection: "ASC" | "DESC" = "ASC",
  ) {
    const ascending = sortDirection === "ASC";
    if (typeof counter == "string") {
      return this.entries.sort(
        (a, b) =>
          (ascending ? 1 : -1) *
          //@ts-ignore: TS can't extend enums
          (a[1].counters[source][counter] -
            //@ts-ignore: TS can't extend enums
            b[1].counters[source][counter]),
      );
    }
    return this.entries.sort((a, b) => {
      let aCount = 0;
      let bCount = 0;
      (counter as (NumericPlaybackCounterKeys)[]).forEach(
        (c) => {
          //@ts-ignore: TS can't extend enums
          aCount += a[1].counters[source][c];
          //@ts-ignore: TS can't extend enums
          bCount += b[1].counters[source][c];
        },
      );
      return (ascending ? 1 : -1) * (aCount - bCount);
    });
  }

  flush() {
    this.keys.clear();
    this.data = {};
  }
  hasKey = (key: string) => this.keys.has(key);

  get entries(): [string, { data: D; counters: PlaybackCounter }][] {
    return [...this.keys].map((key) => [key, this.data[key]]);
  }

  get len(): number {
    return this.keys.size;
  }
}
