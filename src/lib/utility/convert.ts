import {
  type Album,
  CounterSources,
  type LightRewindReport,
  type OldAlbum,
  type OldArtist,
  type OldGenre,
  type OldTrack,
  type PlaybackCounter,
  type ProcessingResults,
  type Track,
} from "../types.ts";
import { end } from "$lib/globals.ts";
import Jellyfin from "$lib/jellyfin/index.ts";

export async function processingResultToRewindReport(
  result: ProcessingResults,
): Promise<LightRewindReport> {
  const serverInfoResult = await Jellyfin.pingServer();
  const serverInfo = serverInfoResult.success ? serverInfoResult.data : null;

  const cacheTrackToOldTrack = (
    [id, value]: [string, { data: Track; counters: PlaybackCounter }],
  ): OldTrack => {
    const playCounts = {
      playbackReport: value.counters.playbackReporting.fullPlays +
        value.counters.playbackReporting.partialSkips,
      jellyfin: value.counters.jellyfin.fullPlays +
        value.counters.jellyfin.partialSkips,
      average: value.counters.average.fullPlays +
        value.counters.average.partialSkips,
    };
    return {
      ...value.data,
      artistsBaseInfo: value.data.artists.map((artistId) => {
        //TODO store the whole baseItem in the cache?
        const artistName = result.artistCache.get(artistId)!;
        return {
          id: artistId,
          name: artistName,
        };
      }),
      albumBaseInfo: (() => {
        const albumId = value.data.albumId;
        if (!albumId) return null;
        const album = result.albumsCache.get(albumId)!;
        const albumName = album.name;
        const albumArtistId = album.artist;
        const albumArtist = {
          id: albumArtistId,
          name: result.artistCache.get(albumArtistId)!,
        };
        return {
          id: albumId,
          name: albumName,
          albumArtistBaseInfo: albumArtist,
        };
      })()!,
      genreBaseInfo: value.data.genres.map((genre) =>
        result.genresCache.get(genre)!
      ),
      image: {
        parentItemId: id,
        primaryTag: value.data.imageTag!,
        blurhash: value.data.imageBlur!,
      },
      year: value.data.year!,
      duration: value.data.duration,
      skips: {
        partial: value.counters.playbackReporting.partialSkips,
        full: value.counters.playbackReporting.fullSkips,
        total: value.counters.playbackReporting.fullSkips +
          value.counters.playbackReporting.partialSkips,
        score: {
          playbackReport: (value.counters.playbackReporting.fullSkips +
            value.counters.playbackReporting.partialSkips + 1) *
            2 / playCounts.playbackReport,
          average: (value.counters.average.fullSkips +
            value.counters.average.partialSkips + 1) * 2 / playCounts.average,
          jellyfin: (value.counters.jellyfin.fullSkips +
            value.counters.jellyfin.partialSkips + 1) *
            2 / playCounts.jellyfin,
        },
      },
      playCount: playCounts,
      //TODO plays:
      //TODO mostSuccessivePlays:
      //TODO lastPlayed:
      totalPlayDuration: {
        playbackReport: value.counters.playbackReporting.listenDuration,
        jellyfin: value.counters.jellyfin.listenDuration,
        average: value.counters.average.listenDuration,
      },
      isFavorite: value.data.favorite,
      //TODO lastPlay:
    };
  };

  const cacheAlbumToOldAlbum = (
    [id, value]: [string, { data: Album; counters: PlaybackCounter }],
  ): OldAlbum => {
    return {
      ...value.data,
      artists: value.data.artists.map((artistId) => {
        //TODO store the whole baseItem in the cache?
        const artistName = result.artistCache.get(artistId)!;
        return {
          id: artistId,
          name: artistName,
        };
      }),
      albumArtist: {
        id: value.data.artist,
        name: result.artistCache.get(value.data.artist)!,
      },
      //TODO tracks:
      image: {
        parentItemId: id,
        primaryTag: value.data.imageTag!,
        blurhash: value.data.imageBlur!,
      },
      //TODO year:
      playCount: {
        playbackReport: value.counters.playbackReporting.fullPlays +
          value.counters.playbackReporting.partialSkips,
        jellyfin: value.counters.jellyfin.fullPlays +
          value.counters.jellyfin.partialSkips,
        average: value.counters.average.fullPlays +
          value.counters.average.partialSkips,
      },
      //TODO plays:
      //TODO lastPlayed:
      totalPlayDuration: {
        playbackReport: value.counters.playbackReporting.listenDuration,
        jellyfin: value.counters.jellyfin.listenDuration,
        average: value.counters.average.listenDuration,
      },
    };
  };

  const cacheArtistToOldArtist = (
    [id, value]: [string, { data: string; counters: PlaybackCounter }],
  ): OldArtist => {
    return {
      id: id,
      name: value.data,
      //TODO tracks:
      images: {
        primary: {
          parentItemId: id,
          //TODO primaryTag:
          //TODO blurhash:
        },
        backdrop: {
          parentItemId: id,
          //TODO id:
        },
      },
      playCount: {
        playbackReport: value.counters.playbackReporting.fullPlays +
          value.counters.playbackReporting.partialSkips,
        jellyfin: value.counters.jellyfin.fullPlays +
          value.counters.jellyfin.partialSkips,
        average: value.counters.average.fullPlays +
          value.counters.average.partialSkips,
      },
      //TODO uniqueTracks:
      uniquePlayedTracks: {
        //TODO playbackReport:
        //TODO jellyfin:
        //TODO average:
      },
      //TODO plays:
      //TODO lastPlayed:
      totalPlayDuration: {
        playbackReport: value.counters.playbackReporting.listenDuration,
        jellyfin: value.counters.jellyfin.listenDuration,
        average: value.counters.average.listenDuration,
      },
    };
  };

  const cacheGenreToOldGenre = (
    [id, value]: [string, { data: null; counters: PlaybackCounter }],
  ): OldGenre => {
    return {
      id: id,
      //TODO name:
      //TODO tracks:
      playCount: {
        playbackReport: value.counters.playbackReporting.fullPlays +
          value.counters.playbackReporting.partialSkips,
        jellyfin: value.counters.jellyfin.fullPlays +
          value.counters.jellyfin.partialSkips,
        average: value.counters.average.fullPlays +
          value.counters.average.partialSkips,
      },
      //TODO uniqueTracks:
      uniquePlayedTracks: {
        //TODO playbackReport: 0,
        //TODO jellyfin: 0,
        //TODO average: 0,
      },
      //TODO plays:
      //TODO lastPlayed:
      totalPlayDuration: {
        playbackReport: value.counters.playbackReporting.listenDuration,
        jellyfin: value.counters.jellyfin.listenDuration,
        average: value.counters.average.listenDuration,
      },
    };
  };

  const userInfo = {
    id: Jellyfin.user!.id,
    name: Jellyfin.user!.name,
  };

  const totalTracksLength = result.tracksCache.entries.reduce(
    (sum, [id, value]) => {
      if (!value.data || !value.data.duration) {
        console.warn("Track with no duration in tracksCache:", id, value);
        return sum;
      }
      return sum + (value.data.duration ?? 0);
    },
    0,
  );

  return {
    //TODO commit:
    year: end.getFullYear(),
    timestamp: new Date().toISOString(),
    user: userInfo,
    server: { ...serverInfo!, PublicAddress: Jellyfin.baseurl! },
    type: "light",
    playbackReportAvailable: result.playbackCache.len > 0,
    playbackReportDataMissing: result.playbackCache.len === 0,
    generalStats: {
      // in minutes
      totalPlaybackDurationByMonth: result.monthOfYear.entries.map((
        [month, value],
      ) => [
        Number(month),
        Math.ceil(value.counters.playbackReporting.listenDuration / 60),
      ])
        .reduce(
          (current, [month, value]) => {
            current[month] = value;
            return current;
          },
          {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
            10: 0,
            11: 0,
          } as Record<number, number>,
        ),
      totalPlays: {
        playbackReport:
          //TODO implement via tracks counter
          result.listensCache.entries.filter(([id, value]) =>
            Math.floor(value.data.playDuration) > 0
          ).length,
        //TODO
        average: -1,
        //TODO
        jellyfin: -1,
      },
      // totalSkips: {
      //   partialSkips:
      //     result.listensCache.entries.filter(([id, value]) =>
      //       value.data.isPartialSkip
      //     ).length,
      //   skips:
      //     result.listensCache.entries.filter(([id, value]) => value.data.isSkip)
      //       .length,
      // },
      totalPlaybackDurationMinutes: {
        //TODO use tracks counter instead
        playbackReport: Math.round(
          result.listensCache.entries.filter(([id, value]) =>
            Math.floor(value.data.playDuration) > 0
          ).reduce(
            (sum, [id, value]) => sum + value.data.playDuration,
            0,
          ) / 60,
        ),
        //TODO
        average: -1,
        //TODO
        jellyfin: -1,
      },
      totalPlaybackDurationHours: {
        playbackReport: Number(
          (result.generalCounter.playbackReporting.listenDuration / 3600)
            .toFixed(1),
        ),
        average: Number(
          (result.generalCounter.average.listenDuration / 3600).toFixed(1),
        ),
        jellyfin: Number(
          (result.generalCounter.jellyfin.listenDuration / 3600).toFixed(1),
        ),
      },
      uniqueTracksPlayed: result.tracksCache.len,
      uniqueAlbumsPlayed: result.albumsCache.len,
      uniqueArtistsPlayed: result.artistCache.len,
      playbackMethods: {
        playCount: result.playbackCache.entries.reduce(
          (current, [method, value]) => {
            current[method] = value.counters.playbackReporting.fullPlays +
              value.counters.playbackReporting.partialSkips +
              value.counters.playbackReporting.fullSkips;
            return current;
          },
          {
            directPlay: 0,
            directStream: 0,
            transcode: 0,
          } as Record<string, number>,
        ),
        duration: result.playbackCache.entries.reduce(
          (current, [method, value]) => {
            current[method] = value.counters.playbackReporting.listenDuration;
            return current;
          },
          {
            directPlay: 0,
            directStream: 0,
            transcode: 0,
          } as Record<string, number>,
        ),
      },
      locations: {
        devices: result.deviceCache.entries.reduce(
          (current, [device, value]) => {
            current[device] = value.counters.playbackReporting.fullPlays +
              value.counters.playbackReporting.partialSkips +
              value.counters.playbackReporting.fullSkips;
            return current;
          },
          {} as Record<string, number>,
        ),
        clients: result.clientCache.entries.reduce(
          (current, [client, value]) => {
            current[client] = value.counters.playbackReporting.fullPlays +
              value.counters.playbackReporting.partialSkips +
              value.counters.playbackReporting.fullSkips;
            return current;
          },
          {} as Record<string, number>,
        ),
        combinations: result.combinedDeviceClientCache.entries.reduce(
          (current, [deviceAndClient, value]) => {
            current[deviceAndClient] = {
              ...value.data,
              playCount: value.counters.playbackReporting.fullPlays +
                value.counters.playbackReporting.partialSkips +
                value.counters.playbackReporting.fullSkips,
            };
            return current;
          },
          {} as Record<string, {
            device: string;
            client: string;
            playCount: number;
          }>,
        ),
      },
      //TODO mostSuccessivePlays:
      totalMusicDays: result.dayOfYear.len,
      minutesPerDay: {
        //TODO we can calculate the mean for jellyfin too
        mean: result.dayOfYear.entries.reduce(
          (sum, [day, value]) =>
            sum + value.counters.playbackReporting.listenDuration / 60,
          0,
        ) / result.dayOfYear.len,
        median: (() => {
          const durations = result.dayOfYear.entries
            .map(([day, value]) =>
              value.counters.playbackReporting.listenDuration / 60
            )
            .sort((a, b) => a - b);
          const mid = Math.floor(durations.length / 2);
          return durations.length % 2 !== 0
            ? durations[mid]
            : (durations[mid - 1] + durations[mid]) / 2;
        })(),
      },
    },
    //TODO this doesn't differentiate between playback reporting and jellyfin data yet
    tracks: {
      duration: result.tracksCache.sorted(
        CounterSources.PLAYBACK_REPORTING,
        "listenDuration",
        "DESC",
      ).slice(0, 10)
        .map(
          cacheTrackToOldTrack,
        ),
      playCount: result.tracksCache.sorted(CounterSources.PLAYBACK_REPORTING, [
        "fullPlays",
        "partialSkips",
      ], "DESC").slice(0, 10).map(
        cacheTrackToOldTrack,
      ),
      mostSkipped: result.tracksCache.sorted(
        CounterSources.PLAYBACK_REPORTING,
        ["partialSkips", "fullSkips"],
        "DESC",
      )
        .slice(0, 10).map(
          cacheTrackToOldTrack,
        ),
      leastSkipped: result.tracksCache.sorted(
        CounterSources.PLAYBACK_REPORTING,
        ["partialSkips", "fullSkips"],
      )
        .slice(0, 10).map(
          cacheTrackToOldTrack,
        ),
      //TODO forgottenFavoriteTracks:
    },
    albums: {
      duration: result.albumsCache.sorted(
        CounterSources.PLAYBACK_REPORTING,
        "listenDuration",
        "DESC",
      ).slice(0, 10)
        .map(
          cacheAlbumToOldAlbum,
        ),
      playCount: result.albumsCache.sorted(CounterSources.PLAYBACK_REPORTING, [
        "fullPlays",
        "partialSkips",
      ], "DESC").slice(
        0,
        10,
      ).map(
        cacheAlbumToOldAlbum,
      ),
    },
    artists: {
      duration: result.artistCache.sorted(
        CounterSources.PLAYBACK_REPORTING,
        "listenDuration",
        "DESC",
      ).slice(0, 10)
        .map(
          cacheArtistToOldArtist,
        ),
      playCount: result.artistCache.sorted(
        CounterSources.PLAYBACK_REPORTING,
        ["fullPlays", "partialSkips"],
        "DESC",
      ).slice(0, 10).map(cacheArtistToOldArtist),
    },
    genres: {
      duration: result.genresCache.sorted(
        CounterSources.PLAYBACK_REPORTING,
        "listenDuration",
        "DESC",
      ).slice(0, 10)
        .map(
          cacheGenreToOldGenre,
        ),
      playCount: result.genresCache.sorted(
        CounterSources.PLAYBACK_REPORTING,
        ["fullPlays", "partialSkips"],
        "DESC",
      ).slice(
        0,
        10,
      ).map(cacheGenreToOldGenre),
    },
    libraryStats: {
      tracks: {
        total: result.tracksCache.len,
        favorite:
          result.tracksCache.entries.filter(([id, value]) =>
            value.data.favorite
          ).length,
      },
      albums: {
        total: result.albumsCache.len,
      },
      artists: {
        total: result.artistCache.len,
      },
      trackLength: {
        mean: totalTracksLength / result.tracksCache.len,
        median: (() => {
          const durations = result.tracksCache.entries
            .map(([id, value]) => value.data.duration)
            .sort((a, b) => a - b);
          const mid = Math.floor(durations.length / 2);
          return durations.length % 2 !== 0
            ? durations[mid]
            : (durations[mid - 1] + durations[mid]) / 2;
        })(),
        min: result.tracksCache.entries.reduce(
          (min, [id, value]) =>
            value.data.duration < min ? value.data.duration : min,
          Infinity,
        ),
        max: result.tracksCache.entries.reduce(
          (max, [id, value]) =>
            value.data.duration > max ? value.data.duration : max,
          0,
        ),
      },
      totalRuntime: totalTracksLength,
    },
    playbackReportComplete: result.monthOfYear.entries.filter(
      ([month, value]) => value.counters.playbackReporting.listenDuration > 0,
    ).length === 12,
  };
}
