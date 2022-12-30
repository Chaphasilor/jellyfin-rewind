// import fetch from 'node-fetch'

import Auth from './auth.js'
import * as aggregate from './aggregate.js'

let rewindReport = null

const auth = new Auth()

const playbackReportQuery = (year) => {
  return `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE ItemType="Audio"
    AND datetime(DateCreated) >= datetime('${year}-01-01') AND datetime(DateCreated) <= datetime('${year}-12-31')
    AND UserId="${auth.config.user.id}"
  ORDER BY DateCreated ASC
`
}
  // GROUP BY ItemId -- don't group so that we can filter out wrong durations
  // LIMIT 200

//TODO implement batched requests to not exceed maximum URL length

async function loadPlaybackReport(year) {

  const response = await fetch(`${auth.config.baseUrl}/user_usage_stats/submit_custom_query?stamp=${Date.now()}`, {
    method: 'POST',
    headers: {
      ...auth.config.defaultHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "CustomQueryString": playbackReportQuery(year),
    })
  })
  const json = await response.json()
  return json

}

function generateJSONFromPlaybackReport(playbackReportInfo) {

  if (!playbackReportInfo || !playbackReportInfo.results || !playbackReportInfo.colums) {
    return {
      items: [],
    }
  }

  const columns = playbackReportInfo.colums // intentional typo
  const items = []
  playbackReportInfo.results.forEach(x => {
    const item = {}
    columns.forEach((column, index) => {
      item[column] = x[index]
    })
    items.push(item)
  })

  return {
    items: items,
  }

}

function adjustPlaybackReportJSON(playbackReportJSON, indexedItemInfo) {

  playbackReportJSON.notFound = [] // deleted or otherwise not found items that should still contribute to the general stats
  for (const index in playbackReportJSON.items) {
    const item = playbackReportJSON.items[index] //!!! don't use this as a left-hand expression
    const itemInfo = indexedItemInfo[item.ItemId]
    if (!itemInfo) {
      console.warn(`Item info not found: ${item.ItemId} (${item.ItemName})`)
      //TODO try to find a replacement item based on name and artist (case-insensitive, maybe even using a fuzzy score) (not album!)
      playbackReportJSON.notFound.push(item)
      continue
    }

    // adjust playback duration if necessary

    const playbackReportDuration = Number(item.PlayDuration)
    const jellyfinItemDuration = Math.ceil(itemInfo.RunTimeTicks / 10000000)
    
    if (playbackReportDuration > jellyfinItemDuration) {
      console.debug(`Wrong duration for ${item.ItemId} (${item.ItemName}), adjusting from ${playbackReportDuration} to ${jellyfinItemDuration}`)
      playbackReportJSON.items[index].PlayDuration = jellyfinItemDuration
    }

  }

  return playbackReportJSON

}

function indexPlaybackReport(playbackReportJSON) {

  const convertPlaybackMethod = (playbackMethod) => {
    switch (playbackMethod) {
      case `DirectPlay`:
        return `directPlay`
      case `Transcode`:
        return `transcode`
      case `DirectStream`:
        return `directStream`
      default:
        return playbackMethod
    }
  }
  
  let currentSuccessivePlays = {
    count: 0,
    totalDuration: 0,
    itemId: null,
  }
  
  const items = {}
  for (const item of playbackReportJSON.items) {
    const isoDate = item.DateCreated.replace(` `, `T`) + `Z` // Safari doesn't seem to support parsing the raw dates from playback reporting (RFC 3339)
    const playInfo = {
      date: new Date(isoDate),
      duration: Number(item.PlayDuration),
      client: item.ClientName,
      device: item.DeviceName,
      method: convertPlaybackMethod(item.PlaybackMethod),
    }
    if (!items[item.ItemId]) {
      items[item.ItemId] = {
        ...item,
        TotalDuration: Number(item.PlayDuration),
        TotalPlayCount: 1,
        Plays: [playInfo],
      }

    } else {
      items[item.ItemId].TotalDuration += Number(item.PlayDuration)
      items[item.ItemId].TotalPlayCount += 1
      items[item.ItemId].Plays.push(playInfo)
    }

    if (!currentSuccessivePlays.itemId || currentSuccessivePlays.itemId !== item.ItemId) {
      if (currentSuccessivePlays.itemId) {
        items[currentSuccessivePlays.itemId].MostSuccessivePlays = {
          playCount: currentSuccessivePlays.count,
          totalDuration: currentSuccessivePlays.totalDuration,
        }
      }
      currentSuccessivePlays.itemId = item.ItemId
      currentSuccessivePlays.count = 1
      currentSuccessivePlays.totalDuration = Number(item.PlayDuration)
    } else {
      currentSuccessivePlays.count += 1
      currentSuccessivePlays.totalDuration += Number(item.PlayDuration)
    }
      
  }

  return items
}

function indexArtists(artistInfoJSON) {
  const items = {}
  for (const item of artistInfoJSON.Items) {
    if (!items[item.Id]) {
      items[item.Id] = {
        ...item,
      }

    } else {
    }
      
  }
  return items
}

function indexAlbums(albumInfoJSON) {
  const items = {}
  for (const item of albumInfoJSON.Items) {
    if (!items[item.Id]) {
      items[item.Id] = {
        ...item,
      }

    } else {
    }
      
  }
  return items
}

async function loadItemInfo(items) {

  const params = {
    // 'SortBy': `Album,SortName`,
    // 'SortOrder': `Ascending`,
    'IncludeItemTypes': `Audio`,
    'Recursive': `true`,
    'Fields': `AudioInfo,ParentId,Ak,Genres`,
    'EnableImageTypes': `Primary`,
    // 'Ids': [...new Set(items.map(item => item.ItemId))].join(','),
  }

  const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')

  const response = await fetch(`${auth.config.baseUrl}/Users/${auth.config.user.id}/Items?${queryParams}`, {
    method: 'GET',
    headers: {
      ...auth.config.defaultHeaders,
      'Content-Type': 'application/json',
    },
  })

  const json = await response.json()
  return json

}

async function loadArtistInfo(items) {

  const params = {
    // 'SortBy': `Album,SortName`,
    // 'SortOrder': `Ascending`,
    // 'IncludeItemTypes': `Audio`,
    'Recursive': `true`,
    'Fields': `PrimaryImageAspectRatio,SortName,BasicSyncInfo,Genres`,
    'EnableImageTypes': `Primary,Backdrop,Banner,Thumb`,
    'userId': auth.config.user.id,
    // 'Ids': items.map(item => item.id).join(','),
  }

  const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')

  let response = await fetch(`${auth.config.baseUrl}/Artists?${queryParams}`, {
    method: 'GET',
    headers: {
      ...auth.config.defaultHeaders,
      'Content-Type': 'application/json',
    },
  })

  let artistResponse = await response.json()

  response = await fetch(`${auth.config.baseUrl}/Artists/AlbumArtists?${queryParams}`, {
    method: 'GET',
    headers: {
      ...auth.config.defaultHeaders,
      'Content-Type': 'application/json',
    },
  })

  let albumArtistResponse = await response.json()
  artistResponse.Items = artistResponse.Items.concat(albumArtistResponse.Items)
  return artistResponse

}

async function loadAlbumInfo() {

  const params = {
    // 'SortBy': `Album,SortName`,
    // 'SortOrder': `Ascending`,
    'IncludeItemTypes': `MusicAlbum`,
    'Recursive': `true`,
    'Fields': `PrimaryImageAspectRatio,SortName,BasicSyncInfo,Genres`,
    'EnableImageTypes': `Primary,Backdrop,Banner,Thumb`,
    'userId': auth.config.user.id,
    // 'Ids': items.map(item => item.id).join(','),
  }

  const queryParams = Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')

  let response = await fetch(`${auth.config.baseUrl}/Users/${auth.config.user.id}/Items?${queryParams}`, {
    method: 'GET',
    headers: {
      ...auth.config.defaultHeaders,
      'Content-Type': 'application/json',
    },
  })

  let responseJSON = await response.json()

  return responseJSON

}

function indexItemInfo(itemInfo) {
  const items = {}
  itemInfo.forEach(item => {
    items[item.Id] = item
  })
  return items
}

function chunkedArray(array, chunkSize) {
  const chunks = []
  const originalLength = array.length
  for (let i = 0; i < originalLength; i += chunkSize) {
    chunks.push(array.splice(0, chunkSize))
  }
  return chunks
}

async function generateRewindReport(year) {

  console.info(`Generating Rewind Report for ${year}...`)

  let playbackReportAvailable = true
  let playbackReportComplete = true
  let playbackReportDataMissing = false

  let playbackReportInfo
  try {
    playbackReportInfo = await loadPlaybackReport(year)
  } catch (err) {
    console.warn(`Playback Reporting not available!`)
    playbackReportInfo = null
    playbackReportAvailable = false
  }

  const playbackReportJSON = generateJSONFromPlaybackReport(playbackReportInfo)
  console.log(`playbackReportJSON:`, playbackReportJSON)
  if (playbackReportJSON.items.length === 0) {
    playbackReportDataMissing = true
  }

  // const allItemInfo = []

  
  // for (const items of chunkedArray(Object.values(playbackReportJSON.items), 200)) {
  //   const itemInfo = await loadItemInfo(items)
  //   allItemInfo.push(...itemInfo.Items)
  // }

  const allItemInfo = (await loadItemInfo()).Items;
  
  console.log(`allItemInfo:`, allItemInfo)
  
  const allItemInfoIndexed = indexItemInfo(allItemInfo)
  
  const enhancedPlaybackReportJSON = adjustPlaybackReportJSON(playbackReportJSON, allItemInfoIndexed)
  const indexedPlaybackReport = indexPlaybackReport(enhancedPlaybackReportJSON)
  console.log(`indexedPlaybackReport:`, indexedPlaybackReport)

  console.log(`Object.keys(allItemInfoIndexed).length:`, Object.keys(allItemInfoIndexed).length)
  const allTopTrackInfo = aggregate.generateTopTrackInfo(allItemInfoIndexed, indexedPlaybackReport)

  const artistInfo = indexArtists(await loadArtistInfo())
  console.log(`artistInfo:`, artistInfo)

  const albumInfo = indexAlbums(await loadAlbumInfo())
  console.log(`albumInfo:`, albumInfo)

  const totalStats = aggregate.generateTotalStats(allTopTrackInfo, enhancedPlaybackReportJSON)

  const jellyfinRewindReport = {
    commit: __COMMITHASH__,
    year,
    timestamp: new Date().toISOString(),
    type: `full`,
    playbackReportAvailable,
    playbackReportDataMissing,
    generalStats: {},
    tracks: {},
    albums: {},
    artists: {},
    genres: {},
  }

  // check if at least 3 months of playback report data is available
  jellyfinRewindReport.generalStats[`totalPlaybackDurationByMonth`] = aggregate.generateTotalPlaybackDurationByMonth(indexedPlaybackReport)
  if (!Object.values(jellyfinRewindReport.generalStats[`totalPlaybackDurationByMonth`]).reduce((acc, cur) => {
    if (cur > 0) {
      return acc + 1
    }
    return acc
  }, 0) < 12) {
    playbackReportComplete = false
  }
  console.log(`jellyfinRewindReport.generalStats['totalPlaybackDurationByMonth']:`, jellyfinRewindReport.generalStats[`totalPlaybackDurationByMonth`])

  console.log(`playbackReportAvailable:`, playbackReportAvailable)
  console.log(`playbackReportComplete:`, playbackReportComplete)
  const dataSource = playbackReportAvailable ? (playbackReportComplete ? `playbackReport` : `average`) : `jellyfin`

  jellyfinRewindReport.generalStats[`totalPlays`] = {
    playbackReport: totalStats.totalPlayCount[`playbackReport`],
    average: totalStats.totalPlayCount[`average`],
    jellyfin: totalStats.totalPlayCount[`jellyfin`],
  }
  jellyfinRewindReport.generalStats[`totalPlaybackDurationMinutes`] = {
    playbackReport: Number((totalStats.totalPlayDuration[`playbackReport`]).toFixed(1)),
    average: Number((totalStats.totalPlayDuration[`average`]).toFixed(1)),
    jellyfin: Number((totalStats.totalPlayDuration[`jellyfin`]).toFixed(1)),
  }
  jellyfinRewindReport.generalStats[`totalPlaybackDurationHours`] = {
    playbackReport: Number((totalStats.totalPlayDuration[`playbackReport`] / 60).toFixed(1)),
    average: Number((totalStats.totalPlayDuration[`average`] / 60).toFixed(1)),
    jellyfin: Number((totalStats.totalPlayDuration[`jellyfin`] / 60).toFixed(1)),
  }
  jellyfinRewindReport.generalStats[`uniqueTracksPlayed`] = totalStats.uniqueTracks.size
  jellyfinRewindReport.generalStats[`uniqueAlbumsPlayed`] = totalStats.uniqueAlbums.size
  jellyfinRewindReport.generalStats[`uniqueArtistsPlayed`] = totalStats.uniqueArtists.size

  jellyfinRewindReport.generalStats[`playbackMethods`] = totalStats.playbackMethods
  jellyfinRewindReport.generalStats[`locations`] = totalStats.locations

  jellyfinRewindReport.generalStats[`mostSuccessivePlays`] = totalStats.mostSuccessivePlays

  const topTracksByDuration = aggregate.getTopItems(allTopTrackInfo, { by: `duration`, limit: 20, dataSource: dataSource })
  const topTracksByPlayCount = aggregate.getTopItems(allTopTrackInfo, { by: `playCount`, limit: 20, dataSource: dataSource })
  // const topTracksByLastPlayed = aggregate.getTopItems(allTopTrackInfo, { by: `lastPlayed`, limit: 20, dataSource: dataSource })
  
  jellyfinRewindReport.tracks[`duration`] = topTracksByDuration
  // .map(x => `${x.name} by ${x.artistsBaseInfo[0].name}: ${Number((x.totalPlayDuration / 60).toFixed(1))} minutes`).join(`\n`)
  jellyfinRewindReport.tracks[`playCount`] = topTracksByPlayCount
  // .map(x => `${x.name} by ${x.artistsBaseInfo[0].name}: ${x.playCount.average} plays`).join(`\n`)
  // jellyfinRewindReport.tracks[`topTracksByLastPlayed`] = topTracksByLastPlayed
  // .map(x => `${x.name} by ${x.artistsBaseInfo[0].name}: last played on ${x.lastPlayed}`).join(`\n`)

  const topAlbumInfo = aggregate.generateAlbumInfo(allTopTrackInfo, albumInfo)
  const topAlbumsByDuration = aggregate.getTopItems(topAlbumInfo, { by: `duration`, limit: 20, dataSource: dataSource })
  const topAlbumsByPlayCount = aggregate.getTopItems(topAlbumInfo, { by: `playCount`, limit: 20, dataSource: dataSource })
  // const topAlbumsByLastPlayed = aggregate.getTopItems(topAlbumInfo, { by: `lastPlayed`, limit: 20, dataSource: dataSource })

  jellyfinRewindReport.albums[`duration`] = topAlbumsByDuration
  // .map(x => `${x.name} by ${x.albumArtist.name}: ${Number((x.totalPlayDuration / 60).toFixed(1))} minutes`).join(`\n`)
  jellyfinRewindReport.albums[`playCount`] = topAlbumsByPlayCount
  // .map(x => `${x.name} by ${x.albumArtist.name}: ${x.playCount.average} plays`).join(`\n`)
  // jellyfinRewindReport.albums[`topAlbumsByLastPlayed`] = topAlbumsByLastPlayed
  // .map(x => `${x.name} by ${x.albumArtist.name}: last played on ${x.lastPlayed}`).join(`\n`)

  const topArtistInfo = aggregate.generateArtistInfo(allTopTrackInfo, artistInfo)
  const topArtistsByDuration = aggregate.getTopItems(topArtistInfo, { by: `duration`, limit: 20, dataSource: dataSource })
  const topArtistsByPlayCount = aggregate.getTopItems(topArtistInfo, { by: `playCount`, limit: 20, dataSource: dataSource })
  // const topArtistsByLastPlayed = aggregate.getTopItems(topArtistInfo, { by: `lastPlayed`, limit: 20, dataSource: dataSource })

  jellyfinRewindReport.artists[`duration`] = topArtistsByDuration
  // .map(x => `${x.name}: ${Number((x.totalPlayDuration / 60).toFixed(1))} minutes`).join(`\n`)
  jellyfinRewindReport.artists[`playCount`] = topArtistsByPlayCount
  // .map(x => `${x.name}: ${x.playCount.average} plays`).join(`\n`)
  // jellyfinRewindReport.artists[`topArtistsByLastPlayed`] = topArtistsByLastPlayed
  // .map(x => `${x.name}: last played on ${x.lastPlayed}`).join(`\n`)

  const topGenreInfo = aggregate.generateGenreInfo(allTopTrackInfo)
  const topGenresByDuration = aggregate.getTopItems(topGenreInfo, { by: `duration`, limit: 20, dataSource: dataSource })
  const topGenresByPlayCount = aggregate.getTopItems(topGenreInfo, { by: `playCount`, limit: 20, dataSource: dataSource })
  // const topGenresByLastPlayed = aggregate.getTopItems(topGenreInfo, { by: `lastPlayed`, limit: 20, dataSource: dataSource })

  jellyfinRewindReport.genres[`duration`] = topGenresByDuration
  // .map(x => `${x.name}: ${Number((x.totalPlayDuration / 60).toFixed(1))} minutes`).join(`\n`)
  jellyfinRewindReport.genres[`playCount`] = topGenresByPlayCount
  // .map(x => `${x.name}: ${x.playCount.average} plays`).join(`\n`)
  // jellyfinRewindReport.genres[`topGenresByLastPlayed`] = topGenresByLastPlayed
  // .map(x => `${x.name}: last played on ${x.lastPlayed}`).join(`\n`)

  if (!playbackReportComplete) {
    jellyfinRewindReport.playbackReportComplete = false
  }
  
  console.log(`jellyfinRewindReport:`, jellyfinRewindReport)
  
  rewindReport = jellyfinRewindReport
  
  return {
    jellyfinRewindReport,
    rawData: {
      allItemInfoIndexed,
      indexedPlaybackReport,
      allTopTrackInfo,
      totalStats,
      topArtistInfo,
      topAlbumInfo,
      topGenreInfo,
    },
  }
  
}

function saveRewindReport() {
  if (rewindReport !== null) {
    try {
      const rewindReportJSON = JSON.stringify(rewindReport)
      console.log(`Full report length:`, rewindReportJSON.length)
      localStorage.setItem(`rewindReport`, rewindReportJSON)
    } catch (err) {
      console.warn(`Couldn't save full report to localStorage (maybe quota exceeded?). Saving a subset only`)
      const reduceToSubsets = categoryEntry => Object.entries(categoryEntry).reduce((acc, [key, value]) => {
        console.log(`key:`, key)
        acc[key] = value.map(x => x.subsetOnly ? x.subsetOnly() : x)
        return acc
      }, {})
      const rewindReportLightJSON = JSON.stringify({
        ...rewindReport,
        type: `light`,
        tracks: reduceToSubsets(rewindReport.tracks),
        albums: reduceToSubsets(rewindReport.albums),
        artists: reduceToSubsets(rewindReport.artists),
        genres: reduceToSubsets(rewindReport.genres),
      })
      console.log(`Light report length:`, rewindReportLightJSON.length)
      localStorage.setItem(`rewindReportLight`, rewindReportLightJSON)
    }
  } else {
    console.warn(`No Rewind report to save!`)
  }
}

function restoreRewindReport() {
  const rewindReportJSON = localStorage.getItem(`rewindReport`)
  if (rewindReportJSON !== null) {
    rewindReport = JSON.parse(rewindReportJSON)
  } else {
    console.warn(`No full Rewind report to restore! Attempting to restore light report...`)

    const rewindReportLightJSON = localStorage.getItem(`rewindReportLight`)
    if (rewindReportLightJSON !== null) {
      rewindReport = JSON.parse(rewindReportLightJSON)
    } else {
      throw new Error(`No Rewind report to restore!`)
    }
  }

  if (rewindReport.commit !== __COMMITHASH__) {
    console.warn(`Rewind report was generated with a different version of the app!`)
  }
  if (rewindReport.year !== new Date().getFullYear()) {
    console.warn(`Rewind report was generated for a different year (${rewindReport.year})!`)
  }
  
  return rewindReport
}

export {
  generateRewindReport,
  saveRewindReport,
  restoreRewindReport,
  auth,
}
