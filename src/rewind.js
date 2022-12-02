// import fetch from 'node-fetch'

import Auth from './auth.js'
import * as aggregate from './aggregate.js'

let rewindReport = null

const auth = new Auth()

const playbackReportQuery = () => {
  return `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE ItemType="Audio"
    AND UserId="${auth.config.user.id}"
`
}
  // GROUP BY ItemId -- don't group so that we can filter out wrong durations
  // LIMIT 200

//TODO implement batched requests to not exceed maximum URL length

async function loadPlaybackReport() {

  const response = await fetch(`${auth.config.baseUrl}/user_usage_stats/submit_custom_query?stamp=${Date.now()}`, {
    method: 'POST',
    headers: {
      ...auth.config.defaultHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "CustomQueryString": playbackReportQuery(),
    })
  })
  const json = await response.json()
  return json

}

function generateJSONFromPlaybackReport(playbackReportInfo) {

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

  for (const index in playbackReportJSON.items) {
    const item = playbackReportJSON.items[index] //!!! don't use this as a left-hand expression
    const itemInfo = indexedItemInfo[item.ItemId]
    if (!itemInfo) {
      console.warn(`Item info not found: ${item.ItemId} (${item.ItemName})`)
      //TODO try to find a replacement item
      continue
    }

    // adjust playback duration if necessary

    const playbackReportDuration = Number(item.PlayDuration)
    const jellyfinItemDuration = Math.ceil(itemInfo.RunTimeTicks / 10000000)
    
    if (playbackReportDuration > jellyfinItemDuration) {
      console.warn(`Wrong duration for ${item.ItemId} (${item.ItemName}), adjusting from ${playbackReportDuration} to ${jellyfinItemDuration}`)
      playbackReportJSON.items[index].PlayDuration = jellyfinItemDuration
    }

  }

  return playbackReportJSON

}

function indexPlaybackReport(playbackReportJSON) {
  const items = {}
  for (const item of playbackReportJSON.items) {
    const playInfo = {
      date: new Date(item.DateCreated),
      duration: Number(item.PlayDuration),
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
      
  }
  return items
}

async function loadItemInfo(items) {

  const params = {
    'SortBy': `Album,SortName`,
    'SortOrder': `Ascending`,
    'IncludeItemTypes': `Audio`,
    'Recursive': `true`,
    'Fields': `AudioInfo,ParentId,Ak`,
    'EnableImageTypes': `Primary`,
    'Ids': items.map(item => item.ItemId).join(','),
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

async function generateRewindReport() {

  const playbackReportInfo = await loadPlaybackReport()

  const playbackReportJSON = generateJSONFromPlaybackReport(playbackReportInfo)
  // console.log(`playbackReportJSON:`, playbackReportJSON)

  const allItemInfo = []

  
  for (const items of chunkedArray(Object.values(playbackReportJSON.items), 200)) {
    const itemInfo = await loadItemInfo(items)
    allItemInfo.push(...itemInfo.Items)
  }

  console.log(`allItemInfo:`, allItemInfo)
  
  const allItemInfoIndexed = indexItemInfo(allItemInfo)
  
  const enhancedPlaybackReportJSON = adjustPlaybackReportJSON(playbackReportJSON, allItemInfoIndexed)
  const indexedPlaybackReport = indexPlaybackReport(enhancedPlaybackReportJSON)
  console.log(`indexedPlaybackReport:`, indexedPlaybackReport)
  
  console.log(`Object.keys(allItemInfoIndexed).length:`, Object.keys(allItemInfoIndexed).length)
  const allTopTrackInfo = aggregate.generateTopTrackInfo(allItemInfoIndexed, indexedPlaybackReport)

  const totalStats = aggregate.generateTotalStats(allTopTrackInfo)

  const jellyfinRewindReport = {
    generalStats: {},
    tracks: {},
    albums: {},
    artists: {},
  }

  jellyfinRewindReport.generalStats[`totalPlays`] = totalStats.totalPlayCount.average
  jellyfinRewindReport.generalStats[`totalPlaybackDurationMinutes`] = Number((totalStats.totalPlayDuration / 60).toFixed(1))
  jellyfinRewindReport.generalStats[`totalPlaybackDurationHours`] = Number((totalStats.totalPlayDuration / 60 / 60).toFixed(1))
  jellyfinRewindReport.generalStats[`uniqueTracksPlayed`] = totalStats.uniqueTracks.size
  jellyfinRewindReport.generalStats[`uniqueAlbumsPlayed`] = totalStats.uniqueAlbums.size
  jellyfinRewindReport.generalStats[`uniqueArtistsPlayed`] = totalStats.uniqueArtists.size

  jellyfinRewindReport.generalStats[`totalPlaybackDurationByMonth`] = aggregate.generateTotalPlaybackDurationByMonth(indexedPlaybackReport)
  console.log(`jellyfinRewindReport.generalStats['totalPlaybackDurationByMonth']:`, jellyfinRewindReport.generalStats[`totalPlaybackDurationByMonth`])

  const topTracksByDuration = aggregate.generateTopTracks(allTopTrackInfo, { by: `duration`, limit: 10 })
  const topTracksByPlayCount = aggregate.generateTopTracks(allTopTrackInfo, { by: `playCount`, limit: 10 })
  const topTracksByLastPlayed = aggregate.generateTopTracks(allTopTrackInfo, { by: `lastPlayed`, limit: 10 })
  
  jellyfinRewindReport.tracks[`topTracksByDuration`] = topTracksByDuration
  // .map(x => `${x.name} by ${x.artistsBaseInfo[0].name}: ${Number((x.totalPlayDuration / 60).toFixed(1))} minutes`).join(`\n`)
  jellyfinRewindReport.tracks[`topTracksByPlayCount`] = topTracksByPlayCount
  // .map(x => `${x.name} by ${x.artistsBaseInfo[0].name}: ${x.playCount.average} plays`).join(`\n`)
  jellyfinRewindReport.tracks[`topTracksByLastPlayed`] = topTracksByLastPlayed
  // .map(x => `${x.name} by ${x.artistsBaseInfo[0].name}: last played on ${x.lastPlayed}`).join(`\n`)

  const topAlbumInfo = aggregate.generateTopAlbumInfo(allTopTrackInfo)
  const topAlbumsByDuration = aggregate.generateTopAlbums(topAlbumInfo, { by: `duration`, limit: 10 })
  const topAlbumsByPlayCount = aggregate.generateTopAlbums(topAlbumInfo, { by: `playCount`, limit: 10 })
  const topAlbumsByLastPlayed = aggregate.generateTopAlbums(topAlbumInfo, { by: `lastPlayed`, limit: 10 })

  jellyfinRewindReport.albums[`topAlbumsByDuration`] = topAlbumsByDuration
  // .map(x => `${x.name} by ${x.albumArtist.name}: ${Number((x.totalPlayDuration / 60).toFixed(1))} minutes`).join(`\n`)
  jellyfinRewindReport.albums[`topAlbumsByPlayCount`] = topAlbumsByPlayCount
  // .map(x => `${x.name} by ${x.albumArtist.name}: ${x.playCount.average} plays`).join(`\n`)
  jellyfinRewindReport.albums[`topAlbumsByLastPlayed`] = topAlbumsByLastPlayed
  // .map(x => `${x.name} by ${x.albumArtist.name}: last played on ${x.lastPlayed}`).join(`\n`)

  const topArtistInfo = aggregate.generateTopArtistInfo(allTopTrackInfo)
  const topArtistsByDuration = aggregate.generateTopArtists(topArtistInfo, { by: `duration`, limit: 10 })
  const topArtistsByPlayCount = aggregate.generateTopArtists(topArtistInfo, { by: `playCount`, limit: 10 })
  const topArtistsByLastPlayed = aggregate.generateTopArtists(topArtistInfo, { by: `lastPlayed`, limit: 10 })

  jellyfinRewindReport.artists[`topArtistsByDuration`] = topArtistsByDuration
  // .map(x => `${x.name}: ${Number((x.totalPlayDuration / 60).toFixed(1))} minutes`).join(`\n`)
  jellyfinRewindReport.artists[`topArtistsByPlayCount`] = topArtistsByPlayCount
  // .map(x => `${x.name}: ${x.playCount.average} plays`).join(`\n`)
  jellyfinRewindReport.artists[`topArtistsByLastPlayed`] = topArtistsByLastPlayed
  // .map(x => `${x.name}: last played on ${x.lastPlayed}`).join(`\n`)

  console.log(`jellyfinRewindReport:`, jellyfinRewindReport)
  
  rewindReport = jellyfinRewindReport
  
  return jellyfinRewindReport
  
}

function saveRewindReport() {
  if (rewindReport !== null) {
    const rewindReportJSON = JSON.stringify(rewindReport)
    localStorage.setItem(`rewindReport`, rewindReportJSON)
  } else {
    console.warn(`No Rewind report to save!`)
  }
}

function restoreRewindReport() {
  const rewindReportJSON = localStorage.getItem(`rewindReport`)
  if (rewindReportJSON !== null) {
    rewindReport = JSON.parse(rewindReportJSON)
  } else {
    throw new Error(`No Rewind report to restore!`)
  }
  return rewindReport
}

export {
  generateRewindReport,
  saveRewindReport,
  restoreRewindReport,
  auth,
}
