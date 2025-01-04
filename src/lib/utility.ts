import type { Result } from "./globals";

export const formatDateToSql = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${
        d.getDate().toString().padStart(2, "0")
    }`;

export function stringToUrl(url: string): Result<URL> {
    let success = true;
    let data: URL | null = null;
    try {
        data = new URL(url);
    } catch {
        success = false;
    }

    if (success) {
        return {
            success,
            data: data as URL,
        };
    }
    return {
        success,
        reason: "The Given URL is invalid",
    };
}
export function log(id: string, data: any) {
    console.log(
        `%c[${id}]%c logged:`,
        "color:cyan",
        "color:pink",
        data,
    );
}

export function logAndReturn<R>(id: string, result: R): R {
    // @ts-ignore
    const isResult = typeof (result.success) == "boolean";
    if (!isResult) {
        console.log(
            `%c[${id}]%c returned:`,
            "color:gray",
            "color:pink",
            result,
        );
    } else if ((result as Result<any>).success) {
        console.log(
            `%c[${id}]%c success:`,
            "color:gray",
            "color:green",
            // @ts-ignore
            result.data,
        );
    } else {
        console.log(
            `%c[${id}]%c failed:`,
            "color:gray",
            "color:red",
            // @ts-ignore
            result.reason,
        );
    }

    return result;
}
export function test(id: string, value: Result<any>) {
    if (value.success) {
        console.log(
            `%c{${id}}%c success`,
            "color:yellow",
            "color:green",
        );
        return true;
    }
    console.log(
        `%c{${id}}%c failed: ${value.reason}`,
        "color:yellow",
        "color:darkred",
    );
    return false;
}

export class Cache<D, C> {
    private data: Record<string, {
        data: D;
        counters: C;
    }> = {};
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
            fn(this.data[key].data)
        );
        if (!key) return false;
        return this.data[key].data;
    }
    get(key: string | undefined) {
        if (!key) return undefined;
        if (this.hasKey(key)) return this.data[key].data;
        return undefined;
    }
    get entries() {
        return [...this.keys].map((key) => [key, this.data[key]]);
    }
    hasKey = (key: string) => this.keys.has(key);
    get len(): number {
        return this.keys.size;
    }
}

export function getDayOfYear(date: Date) {
    const firstDay = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - firstDay.getTime(); // ms
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day;
}
