import {
  type Album,
  type Artist,
  CounterSources,
  type Genre,
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
    const track = value.data;
    const playCounts = {
      jellyfin: value.counters.jellyfin.fullPlays +
        value.counters.jellyfin.partialSkips,
      playbackReport: value.counters.playbackReporting.fullPlays +
        value.counters.playbackReporting.partialSkips,
      average: value.counters.average.fullPlays +
        value.counters.average.partialSkips,
    };

    const playsSortedOldestToNewest =
      (result.tracksCache.getCounters(track.id)?.playbackReporting?.listens
        ?.values?.()?.map((listenId) => result.listensCache.get(listenId))
        ?.filter?.((listen) => !!listen)?.map?.((listen) => ({
          date: listen.dateCreated,
          duration: listen.playDuration,
          wasFullSkip: listen.isSkip,
          wasPartialSkip: listen.isPartialSkip,
          client: listen.clientName,
          device: listen.deviceName,
          method: listen.playbackMethod,
        })).toArray?.() ?? []).sort((a, b) =>
          a.date.getTime() - b.date.getTime()
        );

    const mostSuccessivePlaysForTrack = [
      result.listensCache.entries.toSorted(
        ([, listenA], [, listenB]) =>
          listenB.data.dateCreated.getTime() -
          listenA.data.dateCreated.getTime(),
      ).reduce(
        (acc, [, listen]) => {
          const player =
            `${listen.data.clientName} - ${listen.data.deviceName}`;
          if (!acc.currentStreaks[player]) {
            acc.currentStreaks[player] = [];
          }
          if (
            listen.data.itemId === track.id
          ) {
            if (
              acc.lastPlayedTracks[player] === track.id &&
              // filter out gaps larger than 24h
              (result.listensCache.get(acc.currentStreaks[player].at(-1))
                  ?.dateCreated.getTime() ?? 0) >=
                (listen.data.dateCreated.getTime() - 1000 * 60 * 60 * 24)
            ) {
              acc.currentStreaks[player].push(listen.data.rowId);
            } else {
              acc.currentStreaks[player] = [listen.data.rowId];
            }
          } else {
            acc.currentStreaks[player] = [];
          }
          for (const playerKey in acc.currentStreaks) {
            if (acc.currentStreaks[playerKey].length > acc.maxStreak.length) {
              acc.maxStreak = acc.currentStreaks[playerKey];
            }
          }
          return acc;
        },
        {
          currentStreaks: {} as Record<string, string[]>,
          lastPlayedTracks: {} as Record<string, string>,
          maxStreak: [] as string[],
        },
      ),
    ].map((streakInfo) => ({
      playCount: streakInfo.maxStreak.length,
      totalDuration: streakInfo.maxStreak.reduce((sum, listenId) => {
        const listen = result.listensCache.get(listenId);
        return sum + (listen ? listen.playDuration : 0);
      }, 0),
    }))[0];

    return {
      id: track.id,
      name: track.name,
      artistsBaseInfo: track.artists.map((artistId) => {
        //TODO store the whole baseItem in the cache?
        const artist = result.artistCache.get(artistId)!;
        return {
          id: artistId,
          name: artist?.name ?? "Unknown Artist",
        };
      }),
      albumBaseInfo: (() => {
        const albumId = track.albumId;
        if (!albumId) return null;
        const album = result.albumsCache.get(albumId)!;
        const albumName = album.name;
        const albumArtistId = album.artists[0];
        const albumArtist = {
          id: albumArtistId,
          name: result.artistCache.get(albumArtistId)?.name ?? "Unknown Artist",
        };
        return {
          id: albumId,
          name: albumName,
          albumArtistBaseInfo: albumArtist,
        };
      })()!,
      genreBaseInfo: track.genres.map((genreId) => {
        const genre = result.genresCache.get(genreId);
        return {
          id: genreId,
          name: genre?.name ?? "Unknown Genre",
        };
      }),
      image: {
        parentItemId: id,
        primaryTag: track.imageTag!,
        blurhash: track.imageBlur!,
      },
      year: track.year!,
      duration: track.duration,
      skips: {
        partial: value.counters.playbackReporting.partialSkips,
        full: value.counters.playbackReporting.fullSkips,
        total: value.counters.playbackReporting.fullSkips +
          value.counters.playbackReporting.partialSkips,
        score: {
          jellyfin: playCounts.jellyfin > 0
            ? (value.counters.jellyfin.fullSkips +
              value.counters.jellyfin.partialSkips + 1) *
              2 / playCounts.jellyfin
            : 0,
          playbackReport: playCounts.playbackReport > 0
            ? (value.counters.playbackReporting.fullSkips +
              value.counters.playbackReporting.partialSkips + 1) *
              2 / playCounts.playbackReport
            : 0,
          average: playCounts.average > 0
            ? (value.counters.average.fullSkips +
              value.counters.average.partialSkips + 1) * 2 / playCounts.average
            : 0,
        },
      },
      playCount: playCounts,
      plays: playsSortedOldestToNewest,
      mostSuccessivePlays: mostSuccessivePlaysForTrack,
      lastPlayed: playsSortedOldestToNewest.at(-1)?.date ?? null,
      totalPlayDuration: {
        jellyfin: value.counters.jellyfin.listenDuration / 60,
        playbackReport: value.counters.playbackReporting.listenDuration / 60,
        average: value.counters.average.listenDuration / 60,
      },
      isFavorite: track.favorite,
      lastPlay: playsSortedOldestToNewest.at(-1)?.date ?? null,
    };
  };

  const cacheAlbumToOldAlbum = (
    [id, value]: [string, { data: Album; counters: PlaybackCounter }],
  ): OldAlbum => {
    const album = value.data;

    const playsSortedOldestToNewest =
      (result.albumsCache.getCounters(album.id)?.playbackReporting?.listens
        ?.values?.()?.map((listenId) => result.listensCache.get(listenId))
        ?.filter?.((listen) => !!listen)?.map?.((listen) => ({
          date: listen.dateCreated,
          duration: listen.playDuration,
          wasFullSkip: listen.isSkip,
          wasPartialSkip: listen.isPartialSkip,
          client: listen.clientName,
          device: listen.deviceName,
          method: listen.playbackMethod,
        })).toArray?.() ?? []).sort((a, b) =>
          a.date.getTime() - b.date.getTime()
        );

    return {
      id: album.id,
      name: album.name,
      artists: album.artists.map((artistId) => {
        const artist = result.artistCache.get(artistId)!;
        return {
          id: artistId,
          name: artist?.name!,
        };
      }),
      albumArtist: {
        id: album.albumArtists[0],
        name: result.artistCache.get(album.albumArtists[0])?.name!,
      },
      //TODO tracks:
      year: album.year!,
      image: {
        parentItemId: id,
        primaryTag: album.imageTag!,
        blurhash: album.imageBlur!,
      },
      playCount: {
        jellyfin: value.counters.jellyfin.fullPlays +
          value.counters.jellyfin.partialSkips,
        playbackReport: value.counters.playbackReporting.fullPlays +
          value.counters.playbackReporting.partialSkips,
        average: value.counters.average.fullPlays +
          value.counters.average.partialSkips,
      },
      plays: playsSortedOldestToNewest,
      lastPlayed: playsSortedOldestToNewest.at(-1)?.date ?? null,
      totalPlayDuration: {
        jellyfin: value.counters.jellyfin.listenDuration / 60,
        playbackReport: value.counters.playbackReporting.listenDuration / 60,
        average: value.counters.average.listenDuration / 60,
      },
      lastPlay: playsSortedOldestToNewest.at(-1)?.date ?? null,
    };
  };

  const cacheArtistToOldArtist = (
    [id, value]: [string, { data: Artist; counters: PlaybackCounter }],
  ): OldArtist => {
    const artist = value.data;

    const artistTracks = result.tracksCache.entries.filter((
      [, trackValue],
    ) =>
      trackValue.data.artists.find((artistId) => artistId === artist.id) ||
      trackValue.data.albumArtists.find((artistId) => artistId === artist.id)
    );

    const jellyfinPlayCount = artistTracks.filter((
      [, trackValue],
    ) => trackValue.counters.jellyfin.listenDuration > 0).reduce(
      (sum, [, trackValue]) =>
        sum + trackValue.counters.jellyfin.fullPlays +
        trackValue.counters.jellyfin.partialSkips,
      0,
    );
    const playbackReportPlayCount = value.counters.playbackReporting.fullPlays +
      value.counters.playbackReporting.partialSkips;
    const playCount = {
      jellyfin: jellyfinPlayCount,
      playbackReport: playbackReportPlayCount,
      average: (jellyfinPlayCount + playbackReportPlayCount) / 2,
    };

    const playsSortedOldestToNewest =
      (result.artistCache.getCounters(artist.id)?.playbackReporting?.listens
        ?.values?.()?.map((listenId) => result.listensCache.get(listenId))
        ?.filter?.((listen) => !!listen)?.map?.((listen) => ({
          date: listen.dateCreated,
          duration: listen.playDuration,
          wasFullSkip: listen.isSkip,
          wasPartialSkip: listen.isPartialSkip,
          client: listen.clientName,
          device: listen.deviceName,
          method: listen.playbackMethod,
        })).toArray?.() ?? []).sort((a, b) =>
          a.date.getTime() - b.date.getTime()
        );

    return {
      id: id,
      name: artist.name,
      tracks: artistTracks.length,
      images: {
        primary: {
          parentItemId: id,
          primaryTag: artist.imageTag,
          blurhash: artist.imageBlur!,
        },
        backdrop: {
          parentItemId: id,
          id: 0,
        },
      },
      playCount: playCount,
      uniqueTracks: artistTracks.length,
      uniquePlayedTracks: {
        jellyfin:
          result.tracksCache.entries.filter(([, trackValue]) =>
            (trackValue.data.artists.find((artistId) =>
              artistId === artist.id
            ) || trackValue.data.albumArtists.find((artistId) =>
              artistId === artist.id
            )) && trackValue.counters.jellyfin.listenDuration > 0
          ).length,
        playbackReport:
          result.tracksCache.entries.filter(([, trackValue]) =>
            (trackValue.data.artists.find((artistId) =>
              artistId === artist.id
            ) || trackValue.data.albumArtists.find((artistId) =>
              artistId === artist.id
            )) && trackValue.counters.playbackReporting.listenDuration > 0
          ).length,
        average:
          result.tracksCache.entries.filter(([, trackValue]) =>
            (trackValue.data.artists.find((artistId) =>
              artistId === artist.id
            ) || trackValue.data.albumArtists.find((artistId) =>
              artistId === artist.id
            )) && trackValue.counters.average.listenDuration > 0
          ).length,
      },
      plays: playsSortedOldestToNewest,
      lastPlayed: playsSortedOldestToNewest.at(-1)?.date ?? null,
      totalPlayDuration: {
        jellyfin: value.counters.jellyfin.listenDuration / 60,
        playbackReport: value.counters.playbackReporting.listenDuration / 60,
        average: value.counters.average.listenDuration / 60,
      },
    };
  };

  const cacheGenreToOldGenre = (
    [id, value]: [string, { data: Genre; counters: PlaybackCounter }],
  ): OldGenre => {
    const genre = value.data;
    return {
      id: id,
      name: genre.name,
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
        // playbackReport:
        playbackReport: result.tracksCache.entries.reduce(
          (sum, [id, value]) =>
            sum +
            value.counters.playbackReporting.fullPlays +
            value.counters.playbackReporting.partialSkips +
            value.counters.playbackReporting.fullSkips, //TODO change this to exclude full skips at the end, that seems more correct than the old behavior
          0,
        ),
        average: result.tracksCache.entries.reduce(
          (sum, [id, value]) =>
            sum +
            value.counters.average.fullPlays +
            value.counters.average.partialSkips +
            value.counters.average.fullSkips,
          0,
        ),
        jellyfin: result.tracksCache.entries.reduce(
          (sum, [id, value]) =>
            sum +
            value.counters.jellyfin.fullPlays +
            value.counters.jellyfin.partialSkips +
            value.counters.jellyfin.fullSkips,
          0,
        ),
      },
      totalPlaybackDurationMinutes: {
        playbackReport: Number((result.tracksCache.entries.reduce(
          (sum, [id, value]) =>
            sum +
            value.counters.playbackReporting.listenDuration,
          0,
        ) / 60).toFixed(1)),
        average: Number((result.tracksCache.entries.reduce(
          (sum, [id, value]) => sum + value.counters.average.listenDuration,
          0,
        ) / 60).toFixed(1)),
        jellyfin: Number((result.tracksCache.entries.reduce(
          (sum, [id, value]) => sum + value.counters.jellyfin.listenDuration,
          0,
        ) / 60).toFixed(1)),
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
            current[method] = value.counters.playbackReporting.listenDuration /
              60.0;
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
      //!!! this is correct, the old Report didn't sort the durations before calculating the median
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
