import { writable } from "svelte/store";
import { formatDateToSql } from "./utility/format.ts";
import type { ProcessingResults } from "./types.ts";

export const start = new Date(2024, 0, 1);
export const end = new Date(2024, 11, 31);
export const startSql = formatDateToSql(start);
export const endSql = formatDateToSql(end);

export const downloadingProgress = writable({cur: 0, max: 0, detail: ""})
export const processingProgress = writable({cur: 0, max: 0, detail: ""})
export const generatingProgress = writable({cur: 0, max: 0, detail: ""})

export const processingResult = writable<ProcessingResults>();
