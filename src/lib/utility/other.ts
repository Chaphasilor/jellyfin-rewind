import type { Result } from "$lib/types.ts";

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

export function getDayOfYear(date: Date) {
    const firstDay = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - firstDay.getTime(); // ms
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day;
}


export function indexOfMax(arr: any[]) {
    return arr.indexOf(Math.max(...arr))
}
export function indexOfMin(arr: any[]) {
    let min = Infinity
    let index = 0
    arr.forEach((v, i) => {
        if (v != 0 && v < min) {
            min = v
            index = i
        }
    })
    return index;
}
