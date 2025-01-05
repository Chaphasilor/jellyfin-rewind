import Cache from '$lib/utility/cache';

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

export type ProcessingResults = {
    generalCounter: NormalCounters;

    dayOfMonth: Cache<null, NormalCounters>;
    monthOfYear: Cache<null, NormalCounters>;
    dayOfWeek: Cache<null, NormalCounters>;
    hourOfDay: Cache<null, NormalCounters>;
    dayOfYear: Cache<null, NormalCounters>;

    favorites: number;
    skipped: number;

    artistCache: Cache<string, NormalCounters>;
    tracksCache: Cache<Track, NormalCounters>;
    albumsCache: Cache<Album, NormalCounters>;
    genresCache: Cache<null, NormalCounters>;

    deviceCache: Cache<null, NormalCounters>;
    clientCache: Cache<null, NormalCounters>;
    playbackCache: Cache<null, NormalCounters>;
};

export type Listen = {
    ItemId: string;
    ItemName: string;
    DateCreated: Date;
    PlayDuration: number;
    DeviceName: string;
    ClientName: string;
    PlaybackMethod: string;
};
