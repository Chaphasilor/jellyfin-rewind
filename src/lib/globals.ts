import { writable } from "svelte/store";
import { formatDateToSql } from "./utility";

export const start = new Date(2024, 0, 1);
export const end = new Date(2024, 11, 31);
export const startSql = formatDateToSql(start);
export const endSql = formatDateToSql(end);

export const initTasksTodo = writable(0);
export const initTasksDone = writable(0);
export const processTaskTodo = writable(0);
export const processTaskDone = writable(0);
export const fetchingTaskTodo = writable(0);
export const fetchingTaskDone = writable(0);

export type Result<T> = T extends undefined
    ? { success: true } | { success: false; reason: string }
    : { success: true; data: T } | { success: false; reason: string };

// JellyfinResponse_PATH
export type JellyfinResponse_SystemInfoPublic = {
    LocalAddress: string;
    ServerName: string;
    Version: string;
    ProductName: string;
    OperatingSystem: string;
    Id: string;
    StartupWizardCompleted: boolean;
};
export type JellyfinResponse_UsersAuthenticateByName = {
    AccessToken: string;
    SessionInfo: {
        Id: string;
    };
    User: {
        Id: string;
        Name: string;
        PrimaryImageTag: string;
        Policy: {
            IsAdministrator: boolean;
        };
    };
};
export type JellyfinResponse_UsersMe = {
    Id: string;
    Name: string;
    PrimaryImageTag: string;
    Policy: {
        IsAdministrator: boolean;
    };
};

export type User = {
    id: string;
    name: string;
    PrimaryImageTag: string;
    isAdmin: boolean;
};

export type PlayDuration = {
    plays: number;
    duration: number;
};
export type PlayDurationDict = { [key: string]: PlayDuration };

export type Track = {
    id: string;
    albumId: string | undefined;
    artists: string[];
    name: string;
    duration: number;
    favorite: boolean;
    genres: string[];
    imageTag: string | undefined;
    imageBlur: string | undefined;
};

export type Album = {
    id: string;
    name: string;
    imageTag: string;
    artists: string[];
    artist: string;
};

export type NormalCounters = {
    fullPlays: number;
    listenDuration: number;
    partialSkips: number;
    fullSkips: number;
};
export const normalCountersInit = {
    fullPlays: 0,
    listenDuration: 0,
    partialSkips: 0,
    fullSkips: 0,
} as NormalCounters;
