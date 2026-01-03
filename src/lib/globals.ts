import { writable } from "svelte/store";
import { formatDateToSql } from "./utility/format.ts";
import type {
  FullRewindReport,
  LightRewindReport,
  PlaybackReportingSetupCheckResult,
  ProcessingResults,
  RewindReport,
} from "./types.ts";
import { Progress } from "./utility/Progress.ts";

export const year = 2025;
export const start = new Date(year, 0, 1);
export const end = new Date(year + 1, 0, 1);
export const startSql = formatDateToSql(start);
export const endSql = formatDateToSql(end);

export const downloadingProgress = new Progress("Fetching Library Data");
export const processingProgress = new Progress("Preparing Library Data");
export const processingListensProgress = new Progress("Processing Listening Data");
export const generatingProgress = new Progress("Generating your Personal Rewind Report");

export const playbackReportingAvailable = writable<boolean>(true);
export const processingResult = writable<ProcessingResults>();
export const rewindReport = writable<RewindReport>();
export const oldReport = writable<FullRewindReport | LightRewindReport>();

export const isAccuracyDisclaimerOpen = writable(false);
export const playbackReportingInspectionResult = writable<
  PlaybackReportingSetupCheckResult
>();
