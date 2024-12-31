import { loadItemInfo } from "./rewind";

export function importOfflinePlayback(fileHandle) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {

      console.log(`Parsing offline data`)
      const offlinePlaybackData = await parseOfflinePlaybackData(reader.result)
      console.log(`offlinePlaybackData:`, offlinePlaybackData)

      // fetch item data to get track durations
      const itemInfo = await loadItemInfo(offlinePlaybackData.map(play => play.itemId))
      console.log(`itemInfo:`, itemInfo)
      if (itemInfo[`Items`]?.length > 0) {
        // create map of item ID and duration for reduced time complexity
        const itemDurations = itemInfo[`Items`].reduce((all, cur) => {
          all[cur[`Id`]] = !isNaN(Math.round(cur[`RunTimeTicks`] / 10000000)) ? Math.round(cur[`RunTimeTicks`] / 10000000) : 0
          return all
        }, {})
        // enrich offline plays with fetched track durations 
        for (const index in offlinePlaybackData) {
          offlinePlaybackData[index].playDuration = itemDurations[offlinePlaybackData[index].itemId]
        }
      }
      
      resolve(offlinePlaybackData);
    };
    reader.onerror = () => {
      reader.abort();
      reject(new Error("Error loading offline data"));
    };
    reader.readAsText(fileHandle);
  });
}

async function parseOfflinePlaybackData(fileContent) {

  console.log(`raw offline data:`, fileContent)
  
  let content
  try {
    content = JSON.parse(fileContent)
  } catch (err) {
    content = null
  }
  
  if (!!content) {
    console.warning(`Regular JSON detected, unsupported`)
  }
  
  console.log(`fileContent.split(/\r\n|\r|\n/):`, fileContent.split(/\r\n|\r|\n/))
  const contentLines = fileContent.split(/\r\n|\r|\n/).filter(x => x.trim().length > 0)
  console.log(`contentLines:`, contentLines)
  // detect supported formats
  if (contentLines.length > 0) {
    try {
      JSON.parse(contentLines[0])
      console.info(`Detected Finamp offline playback data format, attempting to parse`)
      return await parseFinampOfflinePlaybackData(contentLines)
    } catch (err) {
      console.error(`Error while parsing Finamp offline playback data:`, err)
    }

  }
  
}

async function parseFinampOfflinePlaybackData(contentLines) {

  console.log(`contentLines:`, contentLines)
  
  const plays = []
  // parsed successfully, now parse all lines
  plays.push(
    ...contentLines.map(line => {
      try {
        const parsedLine = JSON.parse(line)
        return new Play({
          timestamp: new Date(Number(parsedLine[`timestamp`]) * 1000),
          itemId: parsedLine[`item_id`],
          title: parsedLine[`title`],
          artist: parsedLine[`artist`],
          album: parsedLine[`album`],
          userId: parsedLine[`user_id`],
          musicBrainzId: parsedLine[`track_mbid`],
          client: `Finamp`,
          //TODO add device information to exported offline plays file
        })
      } catch (err) {
        return null
      }
    }).filter(x => !!x)
  )

  return plays
  
}

const uploadOfflinePlaybackQuery = (offlinePlays, auth) => {
  return `
  INSERT INTO PlaybackActivity
  (DateCreated, UserId, ItemId, ItemType, ItemName, PlaybackMethod, ClientName, DeviceName, PlayDuration)
  VALUES
    ${offlinePlays.map(play => 
      `( '${play.timestamp.toISOString().slice(0, 19).replace(`T`, ` `)}.0000000', '${auth.config.user.id}', '${play.itemId}', 'Audio', '${play.artist.replaceAll(`'`, `''`)} - ${play.title.replaceAll(`'`, `''`)} (${play.album.replaceAll(`'`, `''`)})', 'OfflinePlay', '${play.client.replaceAll(`'`, `''`)}', '${play.device.replaceAll(`'`, `''`)}', ${play.playDuration})`
    ).join(`,`)}
  `
}
  // GROUP BY ItemId -- don't group so that we can filter out wrong durations
  // LIMIT 200

export async function uploadOfflinePlayback(offlinePlays, auth) {

  console.info(`Importing offline playback to server`)
  
  const response = await fetch(`${auth.config.baseUrl}/user_usage_stats/submit_custom_query?stamp=${Date.now()}`, {
    method: 'POST',
    headers: {
      ...auth.config.defaultHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "CustomQueryString": uploadOfflinePlaybackQuery(offlinePlays, auth),
    })
  })
  const json = await response.json()
  
  if (json[`message`]?.toLowerCase?.()?.includes?.(`query executed`)) {
    console.info(`Successfully imported offline playback to server`)
    return json
  } else {
    console.error(`Error while importing offline playback to server:`, json[`message`])
    throw new Error(`Error while importing offline playback to server: ${json[`message`]}`)
  }

}

export async function checkIfOfflinePlaybackImportAvailable() {
  try {
    const devices = await window.helper.fetchDevices()
    const finampBetaMatch = devices[`Items`].find(device => {
      if (device[`AppName`] === `Finamp`) {
        const versionString = device[`AppVersion`]
        const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/;
        const [, major, minor, patch] = versionString.match(versionRegex) || [];
        return Number(major) > 0 || Number(minor) >= 9
      }
    })
    return finampBetaMatch
  } catch (err) {
    console.error(`Error while checking if offline playback import is available:`, err)
  }
  return false
}

export class Play {

  constructor({
    timestamp,
    itemId,
    title,
    artist,
    album,
    userId,
    musicBrainzId,
    playDuration,
    client,
    device,
  }) {
    this.timestamp = timestamp
    this.itemId = itemId
    this.title = title
    this.artist = artist
    this.album = album
    this.userId = userId
    this.musicBrainzId = musicBrainzId
    this.playDuration = playDuration
    this.client = client
    this.device = device ?? `Unknown Device`
  }
  
}
