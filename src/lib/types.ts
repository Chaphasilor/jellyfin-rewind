import Cache from "$lib/utility/cache.ts";

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

// old Rewind report format

export type FullRewindReport = {
    jellyfinRewindReport: {
        commit: string;
        year: number;
        timestamp: string;
        user: {
            id: string;
            name: string;
        },
        server: {
            LocalAddress: string;
            ServerName: string;
            Version: string;
            ProductName: string;
            OperatingSystem: string;
            Id: string;
            StartupWizardCompleted: boolean;
            PublicAddress: string;
        },
        type: "full";
        playbackReportAvailable: boolean;
        playbackReportDataMissing: boolean;
        generalStats: {
            totalPlaybackDurationByMonth: {
                0: number;
                1: number;
                2: number;
                3: number;
                4: number;
                5: number;
                6: number;
                7: number;
                8: number;
                9: number;
                10: number;
                11: number;
            },
            totalPlays: {
                playbackReport: number;
                average: number;
                jellyfin: number;
            },
            totalPlaybackDurationMinutes: {
                playbackReport: number;
                average: number;
                jellyfin: number;
            },
            totalPlaybackDurationHours: {
                playbackReport: number;
                average: number;
                jellyfin: number;
            },
            uniqueTracksPlayed: number;
            uniqueAlbumsPlayed: number;
            uniqueArtistsPlayed: number;
            playbackMethods: {
                playCount: {
                    [method: string]: number;
                },
                duration: {
                    [method: string]: number;
                },
            },
            locations: {
                devices: {
                    [device: string]: number;
                },
                clients: {
                    [client: string]: number;
                },
                combinations: {
                    [combination: string]: {
                        device: string;
                        client: string;
                        playCount: number;
                    };
                }
            },
            mostSuccessivePlays: {
                track: OldTrack,
                name: string;
                artists: OldBaseInfo[];
                albumArtist: OldAlbumArtistBaseInfo;
                image: OldImage;
                playCount: number;
                totalDuration: number;
            },
            totalMusicDays: number;
            minutesPerDay: {
                mean: number;
                median: number;
                // min, max?
            }
        },
        tracks: {
            duration: OldTrack[];
            playCount: OldTrack[];
            leastSkipped: OldTrack[];
            mostSkipped: OldTrack[];
            forgottenFavoriteTracks: OldTrack[];
        },
        albums: {
            duration: OldAlbum[];
            playCount: OldAlbum[];
        },
        artists: {
            duration: OldArtist[];
            playCount: OldArtist[];
        },
        genres: {
            duration: OldGenre[];
            playCount: OldGenre[];
        },
        libraryStats: {
            tracks: {
                total: number;
                favorite: number;
            },
            albums: {
                total: number;
            },
            artists: {
                total: number;
            },
            trackLength: {
                mean: number;
                median: number;
                min: number;
                max: number;
            },
            totalRuntime: number;
        },
        playbackReportComplete: false,
    },
    rawData: any;
}
export type LightRewindReport = {
    commit: string;
    year: number;
    timestamp: string;
    user: {
        id: string;
        name: string;
    },
    server: {
        LocalAddress: string;
        ServerName: string;
        Version: string;
        ProductName: string;
        OperatingSystem: string;
        Id: string;
        StartupWizardCompleted: boolean;
        PublicAddress: string;
    },
    type: "light";
    playbackReportAvailable: boolean;
    playbackReportDataMissing: boolean;
    generalStats: {
        totalPlaybackDurationByMonth: {
            0: number;
            1: number;
            2: number;
            3: number;
            4: number;
            5: number;
            6: number;
            7: number;
            8: number;
            9: number;
            10: number;
            11: number;
        },
        totalPlays: {
            playbackReport: number;
            average: number;
            jellyfin: number;
        },
        totalPlaybackDurationMinutes: {
            playbackReport: number;
            average: number;
            jellyfin: number;
        },
        totalPlaybackDurationHours: {
            playbackReport: number;
            average: number;
            jellyfin: number;
        },
        uniqueTracksPlayed: number;
        uniqueAlbumsPlayed: number;
        uniqueArtistsPlayed: number;
        playbackMethods: {
            playCount: {
                [method: string]: number;
            },
            duration: {
                [method: string]: number;
            },
        },
        locations: {
            devices: {
                [device: string]: number;
            },
            clients: {
                [client: string]: number;
            },
            combinations: {
                [combination: string]: {
                    device: string;
                    client: string;
                    playCount: number;
                };
            }
        },
        mostSuccessivePlays: {
            track: OldTrack,
            name: string;
            artists: OldBaseInfo[];
            albumArtist: OldAlbumArtistBaseInfo;
            image: OldImage;
            playCount: number;
            totalDuration: number;
        },
        totalMusicDays: number;
        minutesPerDay: {
            mean: number;
            median: number;
            // min, max?
        }
    },
    tracks: {
        duration: OldTrack[];
        playCount: OldTrack[];
        leastSkipped: OldTrack[];
        mostSkipped: OldTrack[];
        forgottenFavoriteTracks: OldTrack[];
    },
    albums: {
        duration: OldAlbum[];
        playCount: OldAlbum[];
    },
    artists: {
        duration: OldArtist[];
        playCount: OldArtist[];
    },
    genres: {
        duration: OldGenre[];
        playCount: OldGenre[];
    },
    libraryStats: {
        tracks: {
            total: number;
            favorite: number;
        },
        albums: {
            total: number;
        },
        artists: {
            total: number;
        },
        trackLength: {
            mean: number;
            median: number;
            min: number;
            max: number;
        },
        totalRuntime: number;
    },
    playbackReportComplete: false,
}

interface OldBaseInfo {
  id: string;
  name: string;
}

interface OldAlbumArtistBaseInfo {
  id: string;
  name: string;
}

interface OldAlbumBaseInfo {
  id: string;
  name: string;
  albumArtistBaseInfo: OldAlbumArtistBaseInfo;
}

interface OldImage {
  parentItemId: string;
  primaryTag: string;
  blurhash: string;
}

interface OldSkipScore {
  jellyfin: number;
  playbackReport: number;
  average: number;
}

interface OldSkips {
  partial: number;
  full: number;
  total: number;
  score: OldSkipScore;
}

interface OldPlayCount {
  jellyfin: number;
  playbackReport: number;
  average: number;
}

interface OldPlay {
  date: string;
  duration: number;
  wasFullSkip: boolean;
  wasPartialSkip: boolean;
  client: string;
  device: string;
  method: string;
}

interface OldMostSuccessivePlays {
  playCount: number;
  totalDuration: number;
}

interface OldTotalPlayDuration {
  jellyfin: number;
  playbackReport: number;
  average: number;
}

interface OldTrack {
  name: string;
  id: string;
  artistsBaseInfo: OldBaseInfo[];
  albumBaseInfo: OldAlbumBaseInfo;
  genreBaseInfo: OldBaseInfo[];
  image: OldImage;
  year: number;
  duration: number;
  skips: OldSkips;
  playCount: OldPlayCount;
  plays: OldPlay[];
  mostSuccessivePlays: OldMostSuccessivePlays;
  lastPlayed: string;
  totalPlayDuration: OldTotalPlayDuration;
  isFavorite: boolean;
  lastPlay?: string;
}

interface OldAlbum {
  name: string;
  id: string;
  artists: OldBaseInfo[]; // not deduped
  albumArtist: OldAlbumArtistBaseInfo;
  tracks: OldTrack[];
  year: number | string; // ISO string
  image: OldImage;
  playCount: OldPlayCount;
  plays: OldPlay[];
  lastPlayed: string;
  totalPlayDuration: OldTotalPlayDuration;
}

interface OldArtist {
  name: string;
  id: string;
  tracks: OldTrack[];
  images: {
    primary: OldImage;
    backdrop: {
        id: number;
        parentItemId: string;
    };
  };
  playCount: OldPlayCount;
  uniqueTracks: OldBaseInfo[];
  uniquePlayedTracks: {
    jellyfin: OldBaseInfo[];
    playbackReport: OldBaseInfo[];
    average: OldBaseInfo[];
  };
  plays: OldPlay[];
  lastPlayed: string;
  totalPlayDuration: OldTotalPlayDuration;
}

interface OldGenre {
  name: string;
  id: string;
  tracks: OldTrack[];
  playCount: OldPlayCount;
  uniqueTracks: OldBaseInfo[];
  uniquePlayedTracks: {
    jellyfin: OldBaseInfo[];
    playbackReport: OldBaseInfo[];
    average: OldBaseInfo[];
  };
  plays: OldPlay[];
  lastPlayed: string;
  totalPlayDuration: OldTotalPlayDuration;
}
