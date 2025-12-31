import { writable } from "svelte/store";
import { formatDateToSql } from "./utility/format.ts";
import type {
  FullRewindReport,
  LightRewindReport,
  ProcessingResults,
} from "./types.ts";

export const year = 2025;
export const start = new Date(year, 0, 1);
export const end = new Date(year, 11, 31);
export const startSql = formatDateToSql(start);
export const endSql = formatDateToSql(end);

export const downloadingProgress = writable({ cur: 0, max: 0, detail: "" });
export const processingProgress = writable({ cur: 0, max: 0, detail: "" });
export const generatingProgress = writable({ cur: 0, max: 0, detail: "" });

export const processingResult = writable<ProcessingResults>();
export const lightRewindReport = writable<LightRewindReport>();
export const oldReport = writable<FullRewindReport>();

export const isAccuracyDisclaimerOpen = writable(false);
