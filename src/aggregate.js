import { PrimaryImage, Artist, Album, Track } from './types.js'

export function generateTopTrackInfo(itemInfo, playbackReportJSON) {
  const topTrackInfo = Object.values(itemInfo).map(item => {

    const playbackReportItem = playbackReportJSON[item.Id]

    const track = new Track({
      name: item.Name,
      id: item.Id,
      artistsBaseInfo: item.ArtistItems.map(artist => ({id: artist.Id, name: artist.Name})),
      albumBaseInfo: {
        id: item.AlbumId, 
        name: item.Album,
        albumArtistBaseInfo: {
          id: item.AlbumArtists[0]?.Id || ``,
          name: item.AlbumArtists[0]?.Name || `Unknown Artist`,
        },
      },
      image: new PrimaryImage({
        parentItemId: item.Id,
        primaryTag: item.ImageTags?.Primary,
        blurhash: item.ImageBlurHashes?.Primary?.[item.ImageTags.Primary],
      }),
      year: item.PremiereDate ? new Date(item.PremiereDate).getFullYear() : null,
      duration: Math.round(item.RunTimeTicks / 10000000),
      playCount: {
        jellyfin: item.UserData?.PlayCount || 0,
        playbackReport: Number(playbackReportItem?.TotalPlayCount || 0),
        average: Math.ceil(((item.UserData?.PlayCount || 0) + Number(playbackReportItem?.TotalPlayCount || 0))/2),
      },
      plays: item.Plays,
      lastPlayed: item.UserData?.LastPlayedDate ? new Date(item.UserData.LastPlayedDate) : new Date(0),
      totalPlayDuration: Number(playbackReportItem?.TotalDuration),
      isFavorite: item.UserData?.IsFavorite,
    })

    return track

  })
  
  return topTrackInfo
}

export function generateTopAlbumInfo(topTrackInfo) {
  const topAlbumInfo = topTrackInfo.reduce((acc, cur) => {
    const albumId = cur.albumBaseInfo?.id
    if (!acc[albumId]) {
      acc[albumId] = new Album({
        id: cur.albumBaseInfo?.id,
        name: cur.albumBaseInfo?.name,
        artists: new Set([cur.artistsBaseInfo?.[0]]),
        albumArtist: cur.albumArtist,
        tracks: [cur],
        year: cur.year, //TODO replace with actual year from jellyfin
        image: new PrimaryImage({
          parentItemId: albumId,
          primaryTag: cur.image?.primaryTag,
          blurhash: cur.image?.blurhash,
        }),
        playCount: {
          jellyfin: cur.playCount.jellyfin,
          playbackReport: cur.playCount.playbackReport,
          average: cur.playCount.average,
        },
        lastPlayed: cur.lastPlayed,
        totalPlayDuration: cur.totalPlayDuration,
      })
    } else {
      acc[albumId].tracks.push(cur)
      acc[albumId].artists.add(cur.artistsBaseInfo?.[0])
      acc[albumId].playCount.jellyfin += cur.playCount.jellyfin
      acc[albumId].playCount.playbackReport += cur.playCount.playbackReport
      acc[albumId].playCount.average = Math.ceil(((acc[albumId]?.playCount?.jellyfin || 0) + (acc[albumId]?.playCount?.playbackReport || 0))/2)
      acc[albumId].lastPlayed = (acc[albumId]?.lastPlayed || 0) > cur.lastPlayed ? (acc[albumId]?.lastPlayed || 0) : cur.lastPlayed
      acc[albumId].totalPlayDuration += cur.totalPlayDuration
    }
    return acc
  }, {})
  return topAlbumInfo
}

export function generateTopArtistInfo(topTrackInfo) {
  const topArtistInfo = topTrackInfo.reduce((acc, cur) => {
    cur.artistsBaseInfo.forEach(artist => {
      const artistId = artist.id
      if (!acc[artistId]) {
        acc[artistId] = new Artist({
          id: artist.id,
          name: artist.name,
          tracks: [cur],
          image: new PrimaryImage({
            parentItemId: artistId,
            primaryTag: null,
            blurhash: null,
          }),
          playCount: {
            jellyfin: cur.playCount.jellyfin,
            playbackReport: cur.playCount.playbackReport,
            average: cur.playCount.average,
          },
          lastPlayed: cur.lastPlayed,
          totalPlayDuration: cur.totalPlayDuration,
        })
      } else {
        acc[artistId].tracks.push(cur)
        acc[artistId].playCount.jellyfin += cur.playCount.jellyfin
        acc[artistId].playCount.playbackReport += cur.playCount.playbackReport
        acc[artistId].playCount.average = Math.ceil(((acc[artistId]?.playCount?.jellyfin || 0) + (acc[artistId]?.playCount?.playbackReport || 0))/2)
        acc[artistId].lastPlayed = (acc[artistId]?.lastPlayed || 0) > cur.lastPlayed ? (acc[artistId]?.lastPlayed || 0) : cur.lastPlayed
        acc[artistId].totalPlayDuration += cur.totalPlayDuration
      }
    })
    return acc
  }, {})
  return topArtistInfo
}

export function generateTotalStats(topTrackInfo) {
  const totalStats = topTrackInfo.reduce((acc, cur) => {
    acc.totalPlayCount.jellyfin += cur.playCount.jellyfin
    acc.totalPlayCount.playbackReport += cur.playCount.playbackReport
    acc.totalPlayCount.average = Math.ceil((acc.totalPlayCount.jellyfin + acc.totalPlayCount.playbackReport)/2)
    acc.totalPlayDuration += cur.totalPlayDuration
    acc.uniqueTracks.add(cur.id)
    acc.uniqueAlbums.add(cur.albumBaseInfo?.id)
    acc.uniqueArtists.add(cur.artistsBaseInfo[0]?.id)
    return acc
  }, {
    totalPlayCount: {
      jellyfin: 0,
      playbackReport: 0,
      average: 0,
    },
    totalPlayDuration: 0,
    uniqueTracks: new Set(),
    uniqueAlbums: new Set(),
    uniqueArtists: new Set(),
  })
  return totalStats
}

export function generateTopTracks(topTrackInfo, { by = `duration`, limit = 25 }) {
  const topTracks = topTrackInfo
    .sort((a, b) => {
      if (by === `duration`) {
        return b.totalPlayDuration - a.totalPlayDuration
      } else if (by === `playCount`) {
        return b.playCount.average - a.playCount.average
      } else if (by === `lastPlayed`) {
        return b.lastPlayed - a.lastPlayed
      }
    })
    .slice(0, limit)
  return topTracks
}

export function generateTopAlbums(topAlbumInfo, { by = `duration`, limit = 25 }) {
  const topAlbums = Object.values(topAlbumInfo)
    .sort((a, b) => {
      if (by === `duration`) {
        return b.totalPlayDuration - a.totalPlayDuration
      } else if (by === `playCount`) {
        return b.playCount.average - a.playCount.average
      } else if (by === `lastPlayed`) {
        return b.lastPlayed - a.lastPlayed
      }
    })
    .slice(0, limit)
  return topAlbums
}

export function generateTopArtists(topArtistInfo, { by = `duration`, limit = 25 }) {
  const topArtists = Object.values(topArtistInfo)
    .sort((a, b) => {
      if (by === `duration`) {
        return b.totalPlayDuration - a.totalPlayDuration
      } else if (by === `playCount`) {
        return b.playCount.average - a.playCount.average
      } else if (by === `lastPlayed`) {
        return b.lastPlayed - a.lastPlayed
      }
    })
    .slice(0, limit)
  return topArtists
}

export function generateTotalPlaybackDurationByMonth(indexedPlaybackReport) {
  const totalPlaybackDurationByMonth = Object.values(indexedPlaybackReport).reduce((acc, cur) => {
    cur.Plays.forEach(play => {
      const month = play.date.getMonth()
      acc[month] += play.duration
    })
    return acc
  }, {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0})
  Object.keys(totalPlaybackDurationByMonth).forEach(month => {
    totalPlaybackDurationByMonth[month] = Math.ceil(totalPlaybackDurationByMonth[month] / 60) // convert to minutes
  })
  return totalPlaybackDurationByMonth
}
