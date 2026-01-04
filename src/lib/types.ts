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
  PublicAddress: string;
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
export type JellyfinTrack = any;
export type JellyfinAlbum = any;
export type JellyfinArtist = any;
export type JellyfinGenre = any;

export type LibraryData = Array<
  {
    id: string;
    name: string;
    // tracks: Array<{
    //   id: string;
    //   name: string;
    //   albumId: string | undefined;
    // }>;
    // albums: Array<{
    //   id: string;
    //   name: string;
    // }>;
    // artists: Array<{
    //   id: string;
    //   name: string;
    // }>;
    // genres: Array<{
    //   id: string;
    //   name: string;
    // }>;
    tracks: Array<JellyfinTrack>;
    albums: Array<JellyfinAlbum>;
    artists: Array<JellyfinArtist>;
    performingArtists: Array<JellyfinArtist>;
    albumArtists: Array<JellyfinArtist>;
    genres: Array<JellyfinGenre>;
  }
>;

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
  albumArtists: string[];
  name: string;
  year: number | null;
  duration: number;
  favorite: boolean;
  lastPlayed: Date | null;
  genres: string[];
  imageTag: string | undefined;
  imageBlur: string | undefined;
};

export type Album = {
  id: string;
  name: string;
  year: number | null;
  imageTag: string;
  imageBlur: string | undefined;
  lastPlayed: Date | null;
  artists: string[];
  albumArtists: string[];
};

export type Artist = {
  id: string;
  name: string;
  imageTag: string;
  imageBlur: string | undefined;
  backdropTag: string | undefined;
  backdropBlur: string | undefined;
  lastPlayed: Date | null;
};

export type Genre = {
  id: string;
  name: string;
};

export const TrueCounterSources = {
  PLAYBACK_REPORTING: "playbackReporting",
  JELLYFIN: "jellyfin",
};
export type TrueCounterSources =
  typeof TrueCounterSources[keyof typeof TrueCounterSources];
const VirtualCounterSources = {
  AVERAGE: "average",
};
export const CounterSources = {
  ...TrueCounterSources,
  ...VirtualCounterSources,
} as const;

export type CounterSources = typeof CounterSources[keyof typeof CounterSources];

export enum InformationSource {
  PLAYBACK_REPORTING = "playbackReport",
  JELLYFIN = "jellyfin",
  AVERAGE = "average",
}

export class PlaybackCounter {
  counters: {
    [TrueCounterSources.PLAYBACK_REPORTING]: {
      fullPlays: number;
      listenDuration: number;
      partialSkips: number;
      fullSkips: number;
      listens: Set<string>; // references listen IDs
    };
    [TrueCounterSources.JELLYFIN]: {
      fullPlays: number;
      listenDuration: number;
      partialSkips: number;
      fullSkips: number;
      listens: Set<string>; // references listen IDs, not used since Jellyfin doesn't track individual listens with timestamps
    };
  };

  constructor(
    init: PlaybackCounter["counters"][TrueCounterSources] = normalCountersInit,
  ) {
    this.counters = {
      [TrueCounterSources.PLAYBACK_REPORTING]: { ...init },
      [TrueCounterSources.JELLYFIN]: { ...init },
    };
  }

  applyDelta(
    source: TrueCounterSources,
    delta: Partial<PlaybackCounter["counters"][TrueCounterSources]>,
  ) {
    if (delta.fullPlays) this.counters[source].fullPlays += delta.fullPlays;
    if (delta.listenDuration) {
      this.counters[source].listenDuration += delta.listenDuration;
    }
    if (delta.partialSkips) {
      this.counters[source].partialSkips += delta.partialSkips;
    }
    if (delta.fullSkips) this.counters[source].fullSkips += delta.fullSkips;
    if (delta.listens) {
      this.counters[source].listens = this.counters[source].listens.union(
        delta.listens,
      );
    }
  }
  // use getters for less verbose access, while keeping proper typing
  get playbackReporting() {
    return this.counters.playbackReporting;
  }
  get jellyfin() {
    return this.counters.jellyfin;
  }
  get average(): PlaybackCounter["counters"][TrueCounterSources] {
    return {
      fullPlays: Math.floor(
        (this.counters.playbackReporting.fullPlays +
          this.counters.jellyfin.fullPlays) / 2,
      ),
      listenDuration: Math.ceil(
        (this.counters.playbackReporting.listenDuration +
          this.counters.jellyfin.listenDuration) / 2,
      ),
      partialSkips: Math.floor(
        (this.counters.playbackReporting.partialSkips +
          this.counters.jellyfin.partialSkips) / 2,
      ),
      fullSkips: Math.floor(
        (this.counters.playbackReporting.fullSkips +
          this.counters.jellyfin.fullSkips) / 2,
      ),
      listens: new Set(), // not used
    };
  }
}
export const normalCountersInit = {
  fullPlays: 0,
  listenDuration: 0,
  partialSkips: 0,
  fullSkips: 0,
  listens: new Set<string>(),
} as PlaybackCounter["counters"][TrueCounterSources];
export type PlaybackCounterDelta = Partial<
  PlaybackCounter["counters"][TrueCounterSources]
>;
export type NumericPlaybackCounterKeys = keyof Omit<
  PlaybackCounter["counters"][CounterSources],
  "listens"
>;

export type ProcessingResults = {
  generalCounter: PlaybackCounter;

  dayOfMonth: Cache<null>;
  monthOfYear: Cache<null>;
  dayOfWeek: Cache<null>;
  hourOfDay: Cache<null>;
  dayOfYear: Cache<null>;

  favorites: number;
  skipped: number;

  artistCache: Cache<Artist>;
  tracksCache: Cache<Track>;
  albumsCache: Cache<Album>;
  genresCache: Cache<Genre>;

  listensCache: Cache<Listen>;

  deviceCache: Cache<null>;
  clientCache: Cache<null>;
  combinedDeviceClientCache: Cache<CombinedDeviceClientInfo>;
  playbackCache: Cache<null>;
};

export class Listen {
  rowId: string | undefined;
  itemId: string;
  itemName: string;
  dateCreated: Date;
  rawPlayDuration: number;
  playDuration: number;
  deviceName: string;
  clientName: string;
  playbackMethod: string;

  skipType: SkipType;

  constructor(data: ListenQueryRow, track: Track | undefined) {
    if (!track) {
      console.warn("Creating Listen without Track info:", data);
    }

    this.rowId = data.rowid;
    this.itemId = data.ItemId;
    this.itemName = data.ItemName;
    this.dateCreated = new Date(data.DateCreated);
    this.rawPlayDuration = data.PlayDuration;
    this.playDuration = Math.max(
      Math.min(
        track?.duration ?? data.PlayDuration,
        data.PlayDuration,
      ),
      0, // for the rare case when Jellyfin reports negative numbers
    );
    this.deviceName = data.DeviceName;
    this.clientName = data.ClientName;
    this.playbackMethod = data.PlaybackMethod;

    const playPercent = (track?.duration ?? 0) === 0
      ? 0
      : this.playDuration / track!.duration;
    if (playPercent >= 0.7) {
      this.skipType = SkipType.FULL_PLAY;
    } else if (playPercent >= 0.3) {
      this.skipType = SkipType.PARTIAL_SKIP;
    } else {
      this.skipType = SkipType.SKIP;
    }
  }

  get isFullPlay() {
    return this.skipType === SkipType.FULL_PLAY;
  }
  get isPartialSkip() {
    return this.skipType === SkipType.PARTIAL_SKIP;
  }
  get isSkip() {
    return this.skipType === SkipType.SKIP;
  }
}

export enum SkipType {
  FULL_PLAY,
  PARTIAL_SKIP,
  SKIP,
}

export type ListenQueryRow = {
  rowid?: string;
  ItemId: string;
  UserId: string;
  ItemName: string;
  DateCreated: Date;
  PlayDuration: number;
  DeviceName: string;
  ClientName: string;
  PlaybackMethod: string;
};

export type CombinedDeviceClientInfo = {
  device: string;
  client: string;
};

export type FeatureProps = {
  informationSource: InformationSource;
  rankingMetric: "duration" | "playCount";
  extraFeatures: () => {
    totalPlaytimeGraph: boolean;
    totalMusicDays: boolean;
    listeningActivityDifference: boolean;
    leastSkippedTracks: boolean;
    mostSkippedTracks: boolean;
    mostSuccessivePlays: boolean;
    fullReport: boolean;
  };
  onNextFeature: () => void;
  onPreviousFeature: () => void;
  fadeToNextTrack: (trackInfo: { id: any }) => Promise<void>;
  pausePlayback: () => void;
  resumePlayback: () => void;
};

export type FeatureEvents = {
  onEnter: () => void;
  onExit: () => void;
};

export enum PlaybackReportingIssueAction {
  CONFIGURED_CORRECTLY,
  INSTALL_PLUGIN,
  ENABLE_PLUGIN,
  RESTART_SERVER,
  UPDATE_PLUGIN,
  RETENTION_SHORT,
  USER_IGNORED,
}

export type PlaybackReportingSetupCheckResult = {
  checked: boolean;
  issue: PlaybackReportingIssueAction;
  setup?: {
    installed: boolean;
    restartRequired: boolean;
    disabled: boolean;
    id?: string;
    version?: number;
    settings?: {
      raw: any;
      retentionInterval: number;
      MaxDataAge?: string;
    };
    ignoredUsers?: Array<{
      id: string;
      name: string;
    }>;
  };
  offlineImportAvailable?: boolean;
  checkAttempts: number;
};

export type RewindReport = {
  jellyfinRewindReport: {
    commit: string;
    year: number;
    timestamp: string;
    user: {
      id: string;
      name: string;
    };
    server: {
      LocalAddress: string;
      ServerName: string;
      Version: string;
      ProductName: string;
      OperatingSystem: string;
      Id: string;
      StartupWizardCompleted: boolean;
      PublicAddress: string;
    };
    type: "light";
    playbackReportAvailable: boolean;
    playbackReportDataMissing: boolean;
    generalStats: {
      totalPlaybackDurationByMonth: {
        [key: number]: number; // in minutes
      };
      totalPlays: {
        playbackReport: number;
        average: number;
        jellyfin: number;
      };
      totalPlaybackDurationMinutes: {
        playbackReport: number;
        average: number;
        jellyfin: number;
      };
      totalPlaybackDurationHours: {
        playbackReport: number;
        average: number;
        jellyfin: number;
      };
      uniqueTracksPlayed: number;
      uniqueAlbumsPlayed: number;
      uniqueArtistsPlayed: number;
      playbackMethods: {
        playCount: {
          [method: string]: number;
        };
        duration: {
          [method: string]: number;
        };
      };
      locations: {
        devices: {
          [device: string]: number;
        };
        clients: {
          [client: string]: number;
        };
        combinations: {
          [combination: string]: {
            device: string;
            client: string;
            playCount: number;
          };
        };
      };
      mostSuccessivePlays?: {
        track: OldTrack;
        name: string;
        artists: OldBaseInfo[];
        albumArtist: OldAlbumArtistBaseInfo;
        image: OldImage;
        playCount: number;
        totalDuration: number;
      };
      totalMusicDays: number;
      minutesPerDay: {
        mean: number;
        median: number;
        // min, max?
      };
    };
    featureDelta?: {
      listeningActivityDifference: {
        uniquePlays: {
          tracks: number;
          albums: number;
          artists: number;
        };
        totalPlays: {
          average: number;
          jellyfin: number;
          playbackReport: number;
        };
        totalPlaytime: {
          average: number;
          jellyfin: number;
          playbackReport: number;
        };
      };
      favoriteDifference: number;
      year: number;
    };
    tracks: {
      duration: {
        jellyfin: OldTrack[];
        playbackReport: OldTrack[];
        average: OldTrack[];
      };
      playCount: {
        jellyfin: OldTrack[];
        playbackReport: OldTrack[];
        average: OldTrack[];
      };
      leastSkipped: {
        jellyfin: OldTrack[];
        playbackReport: OldTrack[];
        average: OldTrack[];
      };
      mostSkipped: {
        jellyfin: OldTrack[];
        playbackReport: OldTrack[];
        average: OldTrack[];
      };
      forgottenFavoriteTracks: {
        jellyfin: OldTrack[];
        playbackReport: OldTrack[];
        average: OldTrack[];
      };
    };
    albums: {
      duration: {
        jellyfin: OldAlbum[];
        playbackReport: OldAlbum[];
        average: OldAlbum[];
      };
      playCount: {
        jellyfin: OldAlbum[];
        playbackReport: OldAlbum[];
        average: OldAlbum[];
      };
    };
    artists: {
      duration: {
        jellyfin: OldArtist[];
        playbackReport: OldArtist[];
        average: OldArtist[];
      };
      playCount: {
        jellyfin: OldArtist[];
        playbackReport: OldArtist[];
        average: OldArtist[];
      };
    };
    genres: {
      duration: {
        jellyfin: OldGenre[];
        playbackReport: OldGenre[];
        average: OldGenre[];
      };
      playCount: {
        jellyfin: OldGenre[];
        playbackReport: OldGenre[];
        average: OldGenre[];
      };
    };
    libraryStats: {
      tracks: {
        total: number;
        favorite: number;
      };
      albums: {
        total: number;
      };
      artists: {
        total: number;
      };
      trackLength: {
        mean: number;
        median: number;
        min: number;
        max: number;
      };
      totalRuntime: number;
    };
    playbackReportComplete: boolean;
  };
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
    };
    server: {
      LocalAddress: string;
      ServerName: string;
      Version: string;
      ProductName: string;
      OperatingSystem: string;
      Id: string;
      StartupWizardCompleted: boolean;
      PublicAddress: string;
    };
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
      };
      totalPlays: {
        playbackReport: number;
        average: number;
        jellyfin: number;
      };
      totalPlaybackDurationMinutes: {
        playbackReport: number;
        average: number;
        jellyfin: number;
      };
      totalPlaybackDurationHours: {
        playbackReport: number;
        average: number;
        jellyfin: number;
      };
      uniqueTracksPlayed: number;
      uniqueAlbumsPlayed: number;
      uniqueArtistsPlayed: number;
      playbackMethods: {
        playCount: {
          [method: string]: number;
        };
        duration: {
          [method: string]: number;
        };
      };
      locations: {
        devices: {
          [device: string]: number;
        };
        clients: {
          [client: string]: number;
        };
        combinations: {
          [combination: string]: {
            device: string;
            client: string;
            playCount: number;
          };
        };
      };
      mostSuccessivePlays?: {
        track: OldTrack;
        name: string;
        artists: OldBaseInfo[];
        albumArtist: OldAlbumArtistBaseInfo;
        image: OldImage;
        playCount: number;
        totalDuration: number;
      };
      totalMusicDays: number;
      minutesPerDay: {
        mean: number;
        median: number;
        // min, max?
      };
    };
    tracks: {
      duration: OldTrack[];
      playCount: OldTrack[];
      leastSkipped: OldTrack[];
      mostSkipped: OldTrack[];
      forgottenFavoriteTracks: {
        jellyfin: OldTrack[];
        playbackReport: OldTrack[];
        average: OldTrack[];
      };
    };
    albums: {
      duration: OldAlbum[];
      playCount: OldAlbum[];
    };
    artists: {
      duration: OldArtist[];
      playCount: OldArtist[];
    };
    genres: {
      duration: OldGenre[];
      playCount: OldGenre[];
    };
    libraryStats: {
      tracks: {
        total: number;
        favorite: number;
      };
      albums: {
        total: number;
      };
      artists: {
        total: number;
      };
      trackLength: {
        mean: number;
        median: number;
        min: number;
        max: number;
      };
      totalRuntime: number;
    };
    playbackReportComplete: boolean;
  };
  rawData: any;
};

//FIXME the type for some properties like [LightRewindReport.jellyfinRewindReport.tracks] has changed between 2025.0.0 and 2025.0.1
// the new format contains separate lists per source, like it should be
//TODO Rewind reports generated and downloaded before 2025.0.1 also need to be importable in 2026.0.0
export type LightRewindReport = {
  jellyfinRewindReport: {
    commit: string;
    year: number;
    timestamp: string;
    user: {
      id: string;
      name: string;
    };
    server: {
      LocalAddress: string;
      ServerName: string;
      Version: string;
      ProductName: string;
      OperatingSystem: string;
      Id: string;
      StartupWizardCompleted: boolean;
      PublicAddress: string;
    };
    type: "light";
    playbackReportAvailable: boolean;
    playbackReportDataMissing: boolean;
    generalStats: {
      totalPlaybackDurationByMonth: {
        [key: number]: number; // in minutes
      };
      totalPlays: {
        playbackReport: number;
        average: number;
        jellyfin: number;
      };
      totalPlaybackDurationMinutes: {
        playbackReport: number;
        average: number;
        jellyfin: number;
      };
      totalPlaybackDurationHours: {
        playbackReport: number;
        average: number;
        jellyfin: number;
      };
      uniqueTracksPlayed: number;
      uniqueAlbumsPlayed: number;
      uniqueArtistsPlayed: number;
      playbackMethods: {
        playCount: {
          [method: string]: number;
        };
        duration: {
          [method: string]: number;
        };
      };
      locations: {
        devices: {
          [device: string]: number;
        };
        clients: {
          [client: string]: number;
        };
        combinations: {
          [combination: string]: {
            device: string;
            client: string;
            playCount: number;
          };
        };
      };
      mostSuccessivePlays?: {
        track: OldTrack;
        name: string;
        artists: OldBaseInfo[];
        albumArtist: OldAlbumArtistBaseInfo;
        image: OldImage;
        playCount: number;
        totalDuration: number;
      };
      totalMusicDays: number;
      minutesPerDay: {
        mean: number;
        median: number;
        // min, max?
      };
    };
    featureDelta?: {
      listeningActivityDifference: {
        uniquePlays: {
          tracks: number;
          albums: number;
          artists: number;
        };
        totalPlays: {
          average: number;
          jellyfin: number;
          playbackReport: number;
        };
      };
      favoriteDifference: number;
      year: number;
    };
    tracks: {
      duration: OldTrack[];
      playCount: OldTrack[];
      leastSkipped: OldTrack[];
      mostSkipped: OldTrack[];
      forgottenFavoriteTracks: {
        jellyfin: OldTrack[];
        playbackReport: OldTrack[];
        average: OldTrack[];
      };
    };
    albums: {
      duration: OldAlbum[];
      playCount: OldAlbum[];
    };
    artists: {
      duration: OldArtist[];
      playCount: OldArtist[];
    };
    genres: {
      duration: OldGenre[];
      playCount: OldGenre[];
    };
    libraryStats: {
      tracks: {
        total: number;
        favorite: number;
      };
      albums: {
        total: number;
      };
      artists: {
        total: number;
      };
      trackLength: {
        mean: number;
        median: number;
        min: number;
        max: number;
      };
      totalRuntime: number;
    };
    playbackReportComplete: boolean;
  };
};

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
  date: string | Date;
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

export interface OldTrack {
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
  mostSuccessivePlays?: OldMostSuccessivePlays;
  lastPlayed: string | Date | null;
  totalPlayDuration: OldTotalPlayDuration;
  isFavorite: boolean;
  lastPlay: string | Date | null;
}

export interface OldAlbum {
  name: string;
  id: string;
  artists: OldBaseInfo[]; // not deduped
  albumArtist: OldAlbumArtistBaseInfo;
  tracks: number;
  year: number | string; // ISO string
  image: OldImage;
  playCount: OldPlayCount;
  plays: OldPlay[];
  lastPlayed: string | Date | null;
  totalPlayDuration: OldTotalPlayDuration;
  lastPlay: string | Date | null;
}

export interface OldArtist {
  name: string;
  id: string;
  tracks: number;
  images: {
    primary: OldImage;
    backdrop: {
      id: number;
      parentItemId: string;
    };
  };
  playCount: OldPlayCount;
  uniqueTracks: number;
  uniquePlayedTracks: {
    jellyfin: number;
    playbackReport: number;
    average: number;
  };
  plays: OldPlay[];
  lastPlayed: Date | string | null;
  totalPlayDuration: OldTotalPlayDuration;
}

export interface OldGenre {
  name: string;
  id: string;
  tracks: number;
  playCount: OldPlayCount;
  uniqueTracks: number;
  uniquePlayedTracks: {
    jellyfin: number;
    playbackReport: number;
    average: number;
  };
  plays: OldPlay[];
  lastPlayed: Date | string | null;
  totalPlayDuration: OldTotalPlayDuration;
}
