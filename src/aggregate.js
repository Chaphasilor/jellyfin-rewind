import { PrimaryImage, BackdropImage, Artist, Album, Track } from './types.js'

export function generateTopTrackInfo(itemInfo, playbackReportJSON) {
  let missingPlaybackReportItems = 0
  const topTrackInfo = Object.values(itemInfo).map(item => {

    try {

      const playbackReportItem = playbackReportJSON[item.Id]
      const adjustedPlaybackReportPlayCount = playbackReportItem?.Plays?.filter(x => Math.floor(Number(x.duration)) > 0)?.length

      if (!playbackReportItem) {
        missingPlaybackReportItems += 1
      }

      const track = new Track({
        name: item.Name || `Unknown Track`,
        id: item.Id,
        artistsBaseInfo: item.ArtistItems.map(artist => ({ id: artist.Id, name: artist.Name || `Unknown Artist` })),
        albumBaseInfo: {
          id: item.AlbumId,
          name: item.Album || `Unknown Album`,
          albumArtistBaseInfo: {
            id: item.AlbumArtists?.[0]?.Id || ``,
            name: item.AlbumArtists?.[0]?.Name || `Unknown Artist`,
          },
        },
        genreBaseInfo: item.GenreItems?.map(genre => ({ id: genre.Id, name: genre.Name || `Unknown Genre` })) || [],
        image: new PrimaryImage({
          parentItemId: item.ImageTags?.Primary ? item.Id : item.AlbumId,
          primaryTag: item.ImageTags?.Primary ? item.ImageTags.Primary : item.AlbumPrimaryImageTag,
          blurhash: item.ImageBlurHashes?.Primary?.[item.ImageTags?.Primary],
        }),
        year: item.PremiereDate ? new Date(item.PremiereDate).getFullYear() : null,
        duration: !isNaN(Math.round(item.RunTimeTicks / 10000000)) ? Math.round(item.RunTimeTicks / 10000000) : 0,
        skips: {
          partial: playbackReportItem?.PartialSkips || 0,
          full: playbackReportItem?.FullSkips || 0,
          total: (playbackReportItem?.PartialSkips || 0) + (playbackReportItem?.FullSkips || 0),
          //TODO compare amount of skips with amount of plays for better data
          score: {
            jellyfin: 0,
            playbackReport: 0,
            average: 0,
          },
        },
        playCount: {
          jellyfin: item.UserData?.PlayCount || 0,
          // playbackReport: Number(playbackReportItem?.TotalPlayCount) || 0,
          playbackReport: adjustedPlaybackReportPlayCount || 0,
          average: Math.ceil(((item.UserData?.PlayCount || 0) + Number(adjustedPlaybackReportPlayCount || 0)) / 2),
        },
        plays: playbackReportItem?.Plays || [],
        mostSuccessivePlays: playbackReportItem?.MostSuccessivePlays || null,
        lastPlayed: item.UserData?.LastPlayedDate ? new Date(item.UserData.LastPlayedDate) : new Date(0),
        totalPlayDuration: {
          jellyfin: !isNaN(Number(item.UserData?.PlayCount) * (Number(item.RunTimeTicks) / (10000000 * 60))) ? Number(item.UserData?.PlayCount) * (Number(item.RunTimeTicks) / (10000000 * 60)) : 0, // convert jellyfin's runtime ticks to minutes (https://learn.microsoft.com/en-us/dotnet/api/system.datetime.ticks?view=net-7.0)
          playbackReport: !isNaN(Number(playbackReportItem?.TotalDuration) / 60) ? (Number(playbackReportItem?.TotalDuration) / 60 || 0) : 0, // convert to minutes
          average: !isNaN(Math.ceil(((Number(item.UserData?.PlayCount) * (Number(item.RunTimeTicks) / (10000000 * 60))) + (Number(playbackReportItem?.TotalDuration) / 60 || 0)) / 2)) ? Math.ceil(((Number(item.UserData?.PlayCount) * (Number(item.RunTimeTicks) / (10000000 * 60))) + (Number(playbackReportItem?.TotalDuration) / 60 || 0)) / 2) : 0,
        },
        isFavorite: item.UserData?.IsFavorite,
        lastPlay: playbackReportItem?.LastPlay,
      })

      track.skips.score.jellyfin = (track.skips.total + 1) * 2 / track.playCount.jellyfin
      track.skips.score.playbackReport = (track.skips.total + 1) * 2 / track.playCount.playbackReport
      track.skips.score.average = (track.skips.total + 1) * 2 / track.playCount.average

      return track

    } catch (err) {

      console.error(`Error while generating track info:`, err)
      throw new Error(`Error while generating track info:`, err)

    }

  })

  console.log(`missingPlaybackReportItems:`, missingPlaybackReportItems)
  return topTrackInfo
}

export function generateAlbumInfo(topTrackInfo, albumInfo) {
  const topAlbumInfo = topTrackInfo.reduce((acc, cur) => {
    const albumId = cur.albumBaseInfo?.id
    const currentAlbumInfo = albumInfo[albumId]
    if (!acc[albumId]) {
      acc[albumId] = new Album({
        id: cur.albumBaseInfo?.id,
        name: cur.albumBaseInfo?.name,
        artists: new Set(cur.artistsBaseInfo),
        albumArtist: cur.albumArtist,
        tracks: [cur],
        year: currentAlbumInfo?.PremiereDate ? new Date(currentAlbumInfo.PremiereDate) : cur.year,
        image: new PrimaryImage({
          parentItemId: albumId,
          primaryTag: currentAlbumInfo?.ImageTags?.Primary,
          blurhash: currentAlbumInfo?.ImageBlurHashes?.Primary?.[currentAlbumInfo?.ImageTags?.Primary],
        }),
        playCount: {
          jellyfin: cur.playCount?.jellyfin,
          playbackReport: cur.playCount?.playbackReport,
          average: cur.playCount?.average,
        },
        plays: cur.plays,
        lastPlayed: cur.lastPlayed,
        totalPlayDuration: {
          jellyfin: Number(cur.totalPlayDuration.jellyfin),
          playbackReport: Number(cur.totalPlayDuration.playbackReport),
          average: Number(cur.totalPlayDuration.average),
        },
      })
    } else {
      acc[albumId].tracks.push(cur)
      cur.artistsBaseInfo.forEach(artistInfo => acc[albumId].artists.add(artistInfo))
      acc[albumId].playCount.jellyfin += Number(cur.playCount?.jellyfin)
      acc[albumId].playCount.playbackReport += Number(cur.playCount?.playbackReport)
      acc[albumId].playCount.average = Math.ceil(((acc[albumId]?.playCount?.jellyfin || 0) + (acc[albumId]?.playCount?.playbackReport || 0)) / 2)
      acc[albumId].plays.concat(cur.plays)
      acc[albumId].lastPlayed = (acc[albumId]?.lastPlayed || 0) > cur.lastPlayed ? (acc[albumId]?.lastPlayed || 0) : cur.lastPlayed
      acc[albumId].totalPlayDuration.jellyfin += Number(cur.totalPlayDuration.jellyfin)
      acc[albumId].totalPlayDuration.playbackReport += Number(cur.totalPlayDuration.playbackReport)
      acc[albumId].totalPlayDuration.average = Math.ceil(((acc[albumId]?.totalPlayDuration?.jellyfin || 0) + (acc[albumId]?.totalPlayDuration?.playbackReport || 0)) / 2)
    }
    return acc
  }, {})
  Object.entries(topAlbumInfo).forEach(([albumId, album]) => {
    album.artists = Array.from(album.artists)
  })
  return topAlbumInfo
}

export function generateArtistInfo(topTrackInfo, artistInfo) {
  const topArtistInfo = topTrackInfo.reduce((acc, cur) => {
    cur.artistsBaseInfo.forEach(artist => {
      const artistId = artist.id
      const currentArtistInfo = artistInfo[artistId]
      if (!acc[artistId]) {
        acc[artistId] = new Artist({
          id: artist.id,
          name: artist.name,
          tracks: [cur],
          images: {
            primary: new PrimaryImage({
              parentItemId: artistId,
              primaryTag: currentArtistInfo?.ImageTags?.Primary,
              blurhash: currentArtistInfo?.ImageBlurHashes?.Primary?.[currentArtistInfo.ImageTags.Primary],
            }),
            backdrop: new BackdropImage({
              id: 0,
              parentItemId: artistId,
              backgroundTag: currentArtistInfo?.BackdropImageTags?.[0],
              blurhash: currentArtistInfo?.ImageBlurHashes?.Backdrop?.[currentArtistInfo.BackdropImageTags?.[0]],
            }),
          },
          playCount: {
            jellyfin: cur.playCount?.jellyfin,
            playbackReport: cur.playCount?.playbackReport,
            average: cur.playCount?.average,
          },
          uniqueTracks: new Set([{ id: cur.id, name: cur.name }]),
          uniquePlayedTracks: {
            jellyfin: new Set(cur.playCount?.jellyfin > 0 ? [{ id: cur.id, name: cur.name }] : []),
            playbackReport: new Set(cur.playCount?.playbackReport > 0 ? [{ id: cur.id, name: cur.name }] : []),
            average: new Set(cur.playCount?.average > 0 ? [{ id: cur.id, name: cur.name }] : []),
          },
          plays: cur.plays,
          lastPlayed: cur.lastPlayed,
          totalPlayDuration: {
            jellyfin: Number(cur.totalPlayDuration.jellyfin),
            playbackReport: Number(cur.totalPlayDuration.playbackReport),
            average: Number(cur.totalPlayDuration.average),
          },
        })

      } else {
        acc[artistId].tracks.push(cur)
        acc[artistId].playCount.jellyfin += Number(cur.playCount?.jellyfin)
        acc[artistId].playCount.playbackReport += Number(cur.playCount?.playbackReport)
        acc[artistId].playCount.average = Math.ceil(((acc[artistId]?.playCount?.jellyfin || 0) + (acc[artistId]?.playCount?.playbackReport || 0)) / 2)
        acc[artistId].uniqueTracks.add({ id: cur.id, name: cur.name })
        if (cur.playCount?.jellyfin > 0) {
          acc[artistId].uniquePlayedTracks.jellyfin.add({ id: cur.id, name: cur.name })
        }
        if (cur.playCount?.playbackReport > 0) {
          acc[artistId].uniquePlayedTracks.playbackReport.add({ id: cur.id, name: cur.name })
        }
        if (cur.playCount?.average > 0) {
          acc[artistId].uniquePlayedTracks.average.add({ id: cur.id, name: cur.name })
        }
        acc[artistId].plays.concat(cur.plays)
        acc[artistId].lastPlayed = (acc[artistId]?.lastPlayed || 0) > cur.lastPlayed ? (acc[artistId]?.lastPlayed || 0) : cur.lastPlayed
        acc[artistId].totalPlayDuration.jellyfin += Number(cur.totalPlayDuration.jellyfin)
        acc[artistId].totalPlayDuration.playbackReport += Number(cur.totalPlayDuration.playbackReport)
        acc[artistId].totalPlayDuration.average = Math.ceil(((acc[artistId]?.totalPlayDuration?.jellyfin || 0) + (acc[artistId]?.totalPlayDuration?.playbackReport || 0)) / 2)
      }
    })
    return acc
  }, {})

  Object.entries(topArtistInfo).forEach(([artistId, artist]) => {
    artist.uniqueTracks = Array.from(artist.uniqueTracks)
    artist.uniquePlayedTracks = {
      jellyfin: Array.from(artist.uniquePlayedTracks.jellyfin),
      playbackReport: Array.from(artist.uniquePlayedTracks.playbackReport),
      average: Array.from(artist.uniquePlayedTracks.average),
    }
  })

  return topArtistInfo
}

export function generateGenreInfo(topTrackInfo) {
  const topGenreInfo = topTrackInfo.reduce((acc, cur) => {
    cur.genreBaseInfo.forEach(genre => {
      const genreId = genre.id
      if (!acc[genreId]) {
        acc[genreId] = new Artist({
          id: genre.id,
          name: genre.name,
          tracks: [cur],
          image: null,
          playCount: {
            jellyfin: cur.playCount?.jellyfin,
            playbackReport: cur.playCount?.playbackReport,
            average: cur.playCount?.average,
          },
          uniqueTracks: new Set([{ id: cur.id, name: cur.name }]),
          uniquePlayedTracks: {
            jellyfin: new Set(cur.playCount?.jellyfin > 0 ? [{ id: cur.id, name: cur.name }] : []),
            playbackReport: new Set(cur.playCount?.playbackReport > 0 ? [{ id: cur.id, name: cur.name }] : []),
            average: new Set(cur.playCount?.average > 0 ? [{ id: cur.id, name: cur.name }] : []),
          },
          plays: cur.plays,
          lastPlayed: cur.lastPlayed,
          totalPlayDuration: {
            jellyfin: Number(cur.totalPlayDuration.jellyfin),
            playbackReport: Number(cur.totalPlayDuration.playbackReport),
            average: Number(cur.totalPlayDuration.average),
          },
        })
      } else {
        acc[genreId].tracks.push(cur)
        acc[genreId].playCount.jellyfin += Number(cur.playCount?.jellyfin)
        acc[genreId].playCount.playbackReport += Number(cur.playCount?.playbackReport)
        acc[genreId].playCount.average = Math.ceil(((acc[genreId]?.playCount?.jellyfin || 0) + (acc[genreId]?.playCount?.playbackReport || 0)) / 2)
        acc[genreId].uniqueTracks.add({ id: cur.id, name: cur.name })
        if (cur.playCount?.jellyfin > 0) {
          acc[genreId].uniquePlayedTracks.jellyfin.add({ id: cur.id, name: cur.name })
        }
        if (cur.playCount?.playbackReport > 0) {
          acc[genreId].uniquePlayedTracks.playbackReport.add({ id: cur.id, name: cur.name })
        }
        if (cur.playCount?.average > 0) {
          acc[genreId].uniquePlayedTracks.average.add({ id: cur.id, name: cur.name })
        }
        acc[genreId].plays.concat(cur.plays)
        acc[genreId].lastPlayed = (acc[genreId]?.lastPlayed || 0) > cur.lastPlayed ? (acc[genreId]?.lastPlayed || 0) : cur.lastPlayed
        acc[genreId].totalPlayDuration.jellyfin += Number(cur.totalPlayDuration.jellyfin)
        acc[genreId].totalPlayDuration.playbackReport += Number(cur.totalPlayDuration.playbackReport)
        acc[genreId].totalPlayDuration.average = Math.ceil(((acc[genreId]?.totalPlayDuration?.jellyfin || 0) + (acc[genreId]?.totalPlayDuration?.playbackReport || 0)) / 2)
      }
    })
    return acc
  }, {})

  Object.entries(topGenreInfo).forEach(([genreId, genre]) => {
    genre.uniqueTracks = Array.from(genre.uniqueTracks)
    genre.uniquePlayedTracks = {
      jellyfin: Array.from(genre.uniquePlayedTracks.jellyfin),
      playbackReport: Array.from(genre.uniquePlayedTracks.playbackReport),
      average: Array.from(genre.uniquePlayedTracks.average),
    }
  })

  return topGenreInfo
}

export function generateTotalStats(topTrackInfo, enhancedPlaybackReport) {
  const totalStats = topTrackInfo.reduce((acc, cur) => {
    acc.totalPlayCount.jellyfin += Number(cur.playCount?.jellyfin) || 0
    acc.totalPlayCount.playbackReport += Number(cur.playCount?.playbackReport) || 0
    acc.totalPlayCount.average = Math.ceil((acc.totalPlayCount.jellyfin + acc.totalPlayCount.playbackReport) / 2)
    acc.totalPlayDuration.jellyfin += Number(cur.totalPlayDuration.jellyfin)
    acc.totalPlayDuration.playbackReport += Number(cur.totalPlayDuration.playbackReport)
    acc.totalPlayDuration.average = Math.ceil((acc.totalPlayDuration.jellyfin + acc.totalPlayDuration.playbackReport) / 2)
    acc.totalSkips.partial += Number(cur.skips?.partial) || 0
    acc.totalSkips.full += Number(cur.skips?.full) || 0
    acc.totalSkips.total += Number(cur.skips?.total) || 0
    acc.uniqueTracks.add(cur.id)
    acc.uniqueAlbums.add(cur.albumBaseInfo?.id)
    cur.artistsBaseInfo.forEach(artist =>
      acc.uniqueArtists.add(artist.id)
    )

    cur.plays.forEach(play => {
      acc.playbackMethods.playCount[play.method] += 1
      acc.playbackMethods.duration[play.method] += Number(play.duration) / 60 // convert to minutes

      acc.locations.devices[play.device] = acc.locations.devices[play.device] ? acc.locations.devices[play.device] + 1 : 1
      acc.locations.clients[play.client] = acc.locations.clients[play.client] ? acc.locations.clients[play.client] + 1 : 1
      if (!acc.locations.combinations[`${play.device} - ${play.client}`]) {
        acc.locations.combinations[`${play.device} - ${play.client}`] = {
          device: play.device,
          client: play.client,
          playCount: 1,
        }
      } else {
        acc.locations.combinations[`${play.device} - ${play.client}`].playCount += 1
      }

      acc.totalMusicDays.add(play.date?.toLocaleDateString())

      if (!acc.minutesPerDay[play.date?.toLocaleDateString()]) {
        acc.minutesPerDay[play.date?.toLocaleDateString()] = Number(play.duration) / 60.0 // convert to minutes
      } else {
        acc.minutesPerDay[play.date?.toLocaleDateString()] += Number(play.duration) / 60.0 // convert to minutes
      }
    })

    if (cur.mostSuccessivePlays && (!acc.mostSuccessivePlays || cur.mostSuccessivePlays.playCount > acc.mostSuccessivePlays.playCount)) {
      acc.mostSuccessivePlays = {
        track: cur,
        name: cur.name,
        artists: cur.artistsBaseInfo,
        albumArtist: cur.albumBaseInfo?.albumArtistBaseInfo,
        image: cur.image,
        playCount: cur.mostSuccessivePlays.playCount,
        totalDuration: cur.mostSuccessivePlays.totalDuration / 60, // convert to minutes
      }
    }

    if (cur.isFavorite) {
      acc.libraryStats.tracks.favorite += 1
    }
    acc.libraryStats.trackLength.lengths[cur.id] = cur.duration
    acc.libraryStats.totalRuntime += Number(cur.duration)

    return acc
  }, {
    totalPlayCount: {
      jellyfin: 0,
      playbackReport: 0,
      average: 0,
    },
    totalPlayDuration: {
      jellyfin: 0,
      playbackReport: 0,
    },
    totalSkips: {
      partial: 0,
      full: 0,
      total: 0,
    },
    uniqueTracks: new Set(),
    uniqueAlbums: new Set(),
    uniqueArtists: new Set(),
    playbackMethods: {
      playCount: {
        directPlay: 0,
        directStream: 0,
        transcode: 0,
      },
      duration: {
        directPlay: 0,
        directStream: 0,
        transcode: 0,
      },
    },
    locations: {
      devices: {},
      clients: {},
      combinations: {},
    },
    mostSuccessivePlays: null,
    totalMusicDays: new Set(),
    minutesPerDay: {},
    libraryStats: {
      tracks: {
        total: 0,
        favorite: 0,
      },
      albums: {
        total: 0,
      },
      artists: {
        total: 0,
      },
      trackLength: {
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        lengths: {},
      },
      totalRuntime: 0,
    },
  })

  console.log(`enhancedPlaybackReport:`, enhancedPlaybackReport)
  console.log(`enhancedPlaybackReport.notFound:`, enhancedPlaybackReport.notFound)
  enhancedPlaybackReport.notFound.forEach((item) => {
    totalStats.totalPlayCount.playbackReport += 1
    totalStats.totalPlayCount.average = Math.ceil((totalStats.totalPlayCount.jellyfin + totalStats.totalPlayCount.playbackReport) / 2)
    totalStats.totalPlayDuration.playbackReport += Number(item.PlayDuration) / 60
    totalStats.totalPlayDuration.average = Math.ceil((totalStats.totalPlayDuration.jellyfin + totalStats.totalPlayDuration.playbackReport) / 2)
  })

  totalStats.uniqueTracks = totalStats.uniqueTracks.size
  totalStats.uniqueAlbums = totalStats.uniqueAlbums.size
  totalStats.uniqueArtists = totalStats.uniqueArtists.size

  totalStats.totalMusicDays = totalStats.totalMusicDays.size

  totalStats.minutesPerDay = {
    mean: Object.values(totalStats.minutesPerDay).reduce((acc, cur) => acc + cur, 0) / Object.values(totalStats.minutesPerDay).length,
    median: Object.values(totalStats.minutesPerDay).length % 2 === 0 ? (Object.values(totalStats.minutesPerDay)[Object.values(totalStats.minutesPerDay).length / 2] + Object.values(totalStats.minutesPerDay)[Object.values(totalStats.minutesPerDay).length / 2 - 1]) / 2 : Object.values(totalStats.minutesPerDay)[Math.floor(Object.values(totalStats.minutesPerDay).length / 2)],
  }

  totalStats.libraryStats.tracks.total = totalStats.uniqueTracks
  totalStats.libraryStats.albums.total = totalStats.uniqueAlbums
  totalStats.libraryStats.artists.total = totalStats.uniqueArtists
  totalStats.libraryStats.trackLength.mean = totalStats.libraryStats.totalRuntime / totalStats.libraryStats.tracks.total
  const sortedTrackLengths = Object.keys(totalStats.libraryStats.trackLength.lengths).sort((a, b) => totalStats.libraryStats.trackLength.lengths[a] - totalStats.libraryStats.trackLength.lengths[b])
  totalStats.libraryStats.trackLength.median = sortedTrackLengths.length % 2 === 0 ? (totalStats.libraryStats.trackLength.lengths[sortedTrackLengths[sortedTrackLengths.length / 2]] + totalStats.libraryStats.trackLength.lengths[sortedTrackLengths[sortedTrackLengths.length / 2 - 1]]) / 2 : totalStats.libraryStats.trackLength.lengths[sortedTrackLengths[Math.floor(sortedTrackLengths.length / 2)]]
  totalStats.libraryStats.trackLength.min = totalStats.libraryStats.trackLength.lengths[sortedTrackLengths[0]]
  totalStats.libraryStats.trackLength.max = totalStats.libraryStats.trackLength.lengths[sortedTrackLengths[sortedTrackLengths.length - 1]]

  delete totalStats.libraryStats.trackLength.lengths

  return totalStats
}

export function getforgottenFavoriteTracks(itemInfo, { dataSource = `average` }) {
  const minimumLastPlayAge = 120 // in days
  const numberOfTracksToReturn = 20
  const trackList = Array.isArray(itemInfo) ? [...itemInfo] : Object.values(itemInfo)

  // Only look at songs that were played
  let playedSongs = trackList.filter(x => x.playCount[dataSource] > 0)

  const today = new Date()
  const millisecondsPerDay = 86400000
  const playCountWeight = 20

  // Weighted sort using days since last play and total number of plays
  playedSongs.sort((a, b) => {
    let daysSinceLastPlayA = (today - a.lastPlay) / millisecondsPerDay
    let daysSinceLastPlayB = (today - b.lastPlay) / millisecondsPerDay
    let weightedPlayCountA = a.playCount[dataSource] * playCountWeight
    let weightedPlayCountB = b.playCount[dataSource] * playCountWeight

    return (daysSinceLastPlayB + weightedPlayCountB) - (daysSinceLastPlayA + weightedPlayCountA)
  })

  let forgottenFavoriteTracks = []

  // Loop through sorted track list and get top tracks that are older than age threshold
  for (let i = 0; i < playedSongs.length; i++) {
    if ((today - playedSongs[i].lastPlay) / millisecondsPerDay > minimumLastPlayAge) {
      forgottenFavoriteTracks.push(playedSongs[i])

      // Exit once we hit the needed number of tracks
      if (forgottenFavoriteTracks.length === numberOfTracksToReturn) break
    }
  }

  return forgottenFavoriteTracks
}

export function getTopItems(itemInfo, { by = `duration`, lowToHigh = false, limit = 25, dataSource = `average` }) {
  console.log(`itemInfo:`, itemInfo)
  let topItems
  if (!Array.isArray(itemInfo)) {
    topItems = Object.values(itemInfo)
  } else {
    topItems = [...itemInfo]
  }
  // console.log(`topItems[0]:`, JSON.stringify(topItems[0]))

  topItems.sort((a, b) => {
    if (by === `duration`) {
      let aDuration = 0, bDuration = 0;
      aDuration = a.totalPlayDuration[dataSource]
      bDuration = b.totalPlayDuration[dataSource]
      const result = bDuration - aDuration
      if (lowToHigh) {
        return result * -1
      }
      return result
    } else if (by === `playCount`) {
      let aPlayCount = 0, bPlayCount = 0;
      aPlayCount = a.playCount[dataSource]
      bPlayCount = b.playCount[dataSource]
      const result = bPlayCount - aPlayCount
      if (lowToHigh) {
        return result * -1
      }
      return result
    } else if (by === `lastPlayed`) {
      const result = b.lastPlayed - a.lastPlayed
      if (lowToHigh) {
        return result * -1
      }
      return result
    } else if (by === `skips`) {
      let result = b.playCount[dataSource] <= 2 ?
        (a.playCount[dataSource] <= 2 ?
          0 :
          -1
        ) :
        (a.playCount[dataSource] <= 2 ?
          1 :
          lowToHigh ? (a.skips.score[dataSource] - b.skips.score[dataSource]) : (b.skips.score[dataSource] - a.skips.score[dataSource]))
      return result
    } else if (by === `skips.partial`) {
      const result = b.skips.partial - a.skips.partial
      if (lowToHigh) {
        return result * -1
      }
      return result
    } else if (by === `skips.full`) {
      const result = b.skips.full - a.skips.full
      if (lowToHigh) {
        return result * -1
      }
      return result
    }
  })
  // console.log(`topItems[0]:`, JSON.stringify(topItems[0]))
  return topItems.slice(0, limit)
}

export function generateTotalPlaybackDurationByMonth(indexedPlaybackReport) {
  const totalPlaybackDurationByMonth = Object.values(indexedPlaybackReport).reduce((acc, cur) => {
    cur.Plays.forEach(play => {
      const month = play.date?.getMonth()
      acc[month] += Number(play.duration)
    })
    return acc
  }, { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 })
  Object.keys(totalPlaybackDurationByMonth).forEach(month => {
    totalPlaybackDurationByMonth[month] = Math.ceil(totalPlaybackDurationByMonth[month] / 60) // convert to minutes
  })
  return totalPlaybackDurationByMonth
}
