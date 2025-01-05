export default class Cache<D, C extends { [key: string]: number }> {
    private data: Record<
        string,
        {
            data: D;
            counters: C;
        }
    > = {};
    private keys: Set<string> = new Set();
    private defaultCounters: C;

    constructor(defaultCounters: C) {
        // copy because else multiple Caches share the same counters
        this.defaultCounters = { ...defaultCounters };
    }

    setAndGetValue(key: string, value: () => D) {
        if (this.hasKey(key)) return this.data[key];

        const data = value();
        this.data[key] = {
            data,
            counters: { ...this.defaultCounters }, // stop counter sharing
        };
        this.keys.add(key);

        return data;
    }

    setAndGetKey(key: string, value: () => D) {
        if (this.hasKey(key)) return key;

        this.data[key] = {
            data: value(),
            counters: { ...this.defaultCounters }, // stop counter sharing
        };
        this.keys.add(key);

        return key;
    }

    count(key: string, fn: (counters: C) => C) {
        if (!this.hasKey(key)) return;
        this.data[key].counters = fn(this.data[key].counters);
    }

    find(fn: (data: D) => boolean) {
        const key = Object.keys(this.data).find((key) =>
            fn(this.data[key].data),
        );

        if (!key) return false;
        return this.data[key].data;
    }

    get(key: string | undefined) {
        if (!key) return undefined;
        if (this.hasKey(key)) return this.data[key].data;
        return undefined;
    }

    sorted(counter: keyof C | (keyof C)[]) {
        if (typeof counter == 'string') {
            return this.entries.sort(
                (a, b) => a[1].counters[counter] - b[1].counters[counter],
            );
        }
        return this.entries.sort((a, b) => {
            let aCount = 0;
            let bCount = 0;
            (counter as (keyof C)[]).forEach((c) => {
                aCount += a[1].counters[c];
                bCount += b[1].counters[c];
            });
            return aCount - bCount;
        });
    }

    flush() {
        this.keys.clear();
        this.data = {};
    }
    hasKey = (key: string) => this.keys.has(key);

    get entries(): [string, { data: D; counters: C }][] {
        return [...this.keys].map((key) => [key, this.data[key]]);
    }

    get len(): number {
        return this.keys.size;
    }
}
