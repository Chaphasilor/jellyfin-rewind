// deno-lint-ignore-file no-explicit-any
import type { Result } from "$lib/types.ts";

export function log(id: string, data: any) {
    console.log(`%c[${id}]%c logged:`, "color:cyan", "color:pink", data);
}

export function logAndReturn<R>(id: string, result: R): R {
    // @ts-ignore: generics
    const isResult = typeof result.success == "boolean";
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
            // @ts-ignore: generics
            result.data,
        );
    } else {
        console.log(
            `%c[${id}]%c failed:`,
            "color:gray",
            "color:red",
            // @ts-ignore: generics
            result.reason,
        );
    }

    return result;
}
export function test(id: string, value: Result<any>) {
    if (value.success) {
        console.log(`%c{${id}}%c success`, "color:yellow", "color:green");
        return true;
    }
    console.log(
        `%c{${id}}%c failed: ${value.reason}`,
        "color:yellow",
        "color:darkred",
    );
    return false;
}
