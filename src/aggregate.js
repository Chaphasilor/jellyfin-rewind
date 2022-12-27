import { PrimaryImage, BackdropImage, Artist, Album, Track } from './types.js'

export function generateTopTrackInfo(itemInfo, playbackReportJSON) {
  const topTrackInfo = Object.values(itemInfo).map(item => {

    const playbackReportItem = playbackReportJSON[item.Id]
    const adjustedPlaybackReportPlayCount = playbackReportItem?.Plays?.filter(x => Math.floor(Number(x.duration)) > 0)?.length

    if (item.ArtistItems.find(artist => artist.Name === `ACRAZE`)) {
      console.log(`item.ArtistItems:`, item.ArtistItems)
      // TODO figure out how to consolidate artists with the same name but different IDs
    }
    const track = new Track({
      name: item.Name,
      id: item.Id,
      artistsBaseInfo: item.ArtistItems.map(artist => ({id: artist.Id, name: artist.Name})),
      albumBaseInfo: {
        id: item.AlbumId, 
        name: item.Album,
        albumArtistBaseInfo: {
          id: item.AlbumArtists?.[0]?.Id || ``,
          name: item.AlbumArtists?.[0]?.Name || `Unknown Artist`,
        },
      },
      genreBaseInfo: item.GenreItems?.map(genre => ({id: genre.Id, name: genre.Name})) || [],
      image: new PrimaryImage({
        parentItemId: item.Id,
        primaryTag: item.ImageTags?.Primary,
        blurhash: item.ImageBlurHashes?.Primary?.[item.ImageTags?.Primary],
      }),
      year: item.PremiereDate ? new Date(item.PremiereDate).getFullYear() : null,
      duration: Math.round(item.RunTimeTicks / 10000000),
      playCount: {
        jellyfin: item.UserData?.PlayCount || 0,
        // playbackReport: Number(playbackReportItem?.TotalPlayCount) || 0,
        playbackReport: adjustedPlaybackReportPlayCount || 0,
        average: Math.ceil(((item.UserData?.PlayCount || 0) + Number(adjustedPlaybackReportPlayCount || 0))/2),
      },
      plays: playbackReportItem?.Plays || [],
      lastPlayed: item.UserData?.LastPlayedDate ? new Date(item.UserData.LastPlayedDate) : new Date(0),
      totalPlayDuration: {
        jellyfin: Number(item.UserData?.PlayCount) * (Number(item.RunTimeTicks) / (10000000 * 60)), // convert jellyfin's runtime ticks to minutes (https://learn.microsoft.com/en-us/dotnet/api/system.datetime.ticks?view=net-7.0)
        playbackReport: Number(playbackReportItem?.TotalDuration) / 60 || -1, // convert to minutes
        average: Math.ceil(((Number(item.UserData?.PlayCount) * (Number(item.RunTimeTicks) / (10000000 * 60))) + (Number(playbackReportItem?.TotalDuration) / 60 || 0))/2),
      },
      isFavorite: item.UserData?.IsFavorite,
    })

    return track

  })
  
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
        year: currentAlbumInfo?.PremiereDate ? new Date (currentAlbumInfo.PremiereDate) : cur.year,
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
        totalPlayDuration: cur.totalPlayDuration,
      })
    } else {
      acc[albumId].tracks.push(cur)
      cur.artistsBaseInfo.forEach(artistInfo => acc[albumId].artists.add(artistInfo))
      acc[albumId].playCount.jellyfin += cur.playCount?.jellyfin
      acc[albumId].playCount.playbackReport += cur.playCount?.playbackReport
      acc[albumId].playCount.average = Math.ceil(((acc[albumId]?.playCount?.jellyfin || 0) + (acc[albumId]?.playCount?.playbackReport || 0))/2)
      acc[albumId].plays.concat(cur.plays)
      acc[albumId].lastPlayed = (acc[albumId]?.lastPlayed || 0) > cur.lastPlayed ? (acc[albumId]?.lastPlayed || 0) : cur.lastPlayed
      acc[albumId].totalPlayDuration.jellyfin += cur.totalPlayDuration.jellyfin
      acc[albumId].totalPlayDuration.playbackReport += cur.totalPlayDuration.playbackReport
      acc[albumId].totalPlayDuration.average = Math.ceil(((acc[albumId]?.totalPlayDuration?.jellyfin || 0) + (acc[albumId]?.totalPlayDuration?.playbackReport || 0))/2)
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
          uniqueTracks: new Set([{id: cur.id, name: cur.name}]),
          plays: cur.plays,
          lastPlayed: cur.lastPlayed,
          totalPlayDuration: cur.totalPlayDuration,
        })
      } else {
        acc[artistId].tracks.push(cur)
        acc[artistId].playCount.jellyfin += cur.playCount?.jellyfin
        acc[artistId].playCount.playbackReport += cur.playCount?.playbackReport
        acc[artistId].playCount.average = Math.ceil(((acc[artistId]?.playCount?.jellyfin || 0) + (acc[artistId]?.playCount?.playbackReport || 0))/2)
        acc[artistId].uniqueTracks.add({id: cur.id, name: cur.name})
        acc[artistId].plays.concat(cur.plays)
        acc[artistId].lastPlayed = (acc[artistId]?.lastPlayed || 0) > cur.lastPlayed ? (acc[artistId]?.lastPlayed || 0) : cur.lastPlayed
        acc[artistId].totalPlayDuration.jellyfin += cur.totalPlayDuration.jellyfin
        acc[artistId].totalPlayDuration.playbackReport += cur.totalPlayDuration.playbackReport
        acc[artistId].totalPlayDuration.average = Math.ceil(((acc[artistId]?.totalPlayDuration?.jellyfin || 0) + (acc[artistId]?.totalPlayDuration?.playbackReport || 0))/2)
      }
    })
    return acc
  }, {})

  Object.entries(topArtistInfo).forEach(([artistId, artist]) => {
    artist.uniqueTracks = Array.from(artist.uniqueTracks)
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
          uniqueTracks: new Set([{id: cur.id, name: cur.name}]),
          plays: cur.plays,
          lastPlayed: cur.lastPlayed,
          totalPlayDuration: cur.totalPlayDuration,
        })
      } else {
        acc[genreId].tracks.push(cur)
        acc[genreId].playCount.jellyfin += cur.playCount?.jellyfin
        acc[genreId].playCount.playbackReport += cur.playCount?.playbackReport
        acc[genreId].playCount.average = Math.ceil(((acc[genreId]?.playCount?.jellyfin || 0) + (acc[genreId]?.playCount?.playbackReport || 0))/2)
        acc[genreId].uniqueTracks.add({id: cur.id, name: cur.name})
        acc[genreId].plays.concat(cur.plays)
        acc[genreId].lastPlayed = (acc[genreId]?.lastPlayed || 0) > cur.lastPlayed ? (acc[genreId]?.lastPlayed || 0) : cur.lastPlayed
        acc[genreId].totalPlayDuration.jellyfin += cur.totalPlayDuration.jellyfin
        acc[genreId].totalPlayDuration.playbackReport += cur.totalPlayDuration.playbackReport
        acc[genreId].totalPlayDuration.average = Math.ceil(((acc[genreId]?.totalPlayDuration?.jellyfin || 0) + (acc[genreId]?.totalPlayDuration?.playbackReport || 0))/2)
      }
    })
    return acc
  }, {})

  Object.entries(topGenreInfo).forEach(([genreId, genre]) => {
    genre.uniqueTracks = Array.from(genre.uniqueTracks)
  })
  
  return topGenreInfo
}

export function generateTotalStats(topTrackInfo, enhancedPlaybackReport) {
  const totalStats = topTrackInfo.reduce((acc, cur) => {
    acc.totalPlayCount.jellyfin += cur.playCount?.jellyfin || 0
    acc.totalPlayCount.playbackReport += cur.playCount?.playbackReport || 0
    acc.totalPlayCount.average = Math.ceil((acc.totalPlayCount.jellyfin + acc.totalPlayCount.playbackReport)/2)
    acc.totalPlayDuration.jellyfin += cur.totalPlayDuration.jellyfin
    acc.totalPlayDuration.playbackReport += cur.totalPlayDuration.playbackReport
    acc.totalPlayDuration.average = Math.ceil((acc.totalPlayDuration.jellyfin + acc.totalPlayDuration.playbackReport)/2)
    acc.uniqueTracks.add(cur.id)
    acc.uniqueAlbums.add(cur.albumBaseInfo?.id)
    acc.uniqueArtists.add(cur.artistsBaseInfo?.[0]?.id)
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
    uniqueTracks: new Set(),
    uniqueAlbums: new Set(),
    uniqueArtists: new Set(),
  })

  console.log(`enhancedPlaybackReport:`, enhancedPlaybackReport)
  console.log(`enhancedPlaybackReport.notFound:`, enhancedPlaybackReport.notFound)
  enhancedPlaybackReport.notFound.forEach((item) => {
    totalStats.totalPlayCount.playbackReport += 1
    totalStats.totalPlayCount.average = Math.ceil((totalStats.totalPlayCount.jellyfin + totalStats.totalPlayCount.playbackReport)/2)
    totalStats.totalPlayDuration.playbackReport += Number(item.PlayDuration) / 60
    totalStats.totalPlayDuration.average = Math.ceil((totalStats.totalPlayDuration.jellyfin + totalStats.totalPlayDuration.playbackReport)/2)
  })
  
  return totalStats
}

export function getTopItems(itemInfo, { by = `duration`, limit = 25, dataSource = `average` }) {
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
        return bDuration - aDuration
      } else if (by === `playCount`) {
        let aPlayCount = 0, bPlayCount = 0;
        aPlayCount = a.playCount[dataSource]
        bPlayCount = b.playCount[dataSource]
        return bPlayCount - aPlayCount
      } else if (by === `lastPlayed`) {
        return b.lastPlayed - a.lastPlayed
      }
    })
  // console.log(`topItems[0]:`, JSON.stringify(topItems[0]))
  return topItems.slice(0, limit)
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
