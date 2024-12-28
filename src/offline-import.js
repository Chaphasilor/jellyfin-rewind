export function importOfflinePlayback(fileHandle) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {

      console.log(`Parsing offline data`)
      const offlinePlaybackData = await parseOfflinePlaybackData(reader.result)
      console.log(`offlinePlaybackData:`, offlinePlaybackData)
      
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
          timestamp: parsedLine[`timestamp`],
          itemId: parsedLine[`item_id`],
          title: parsedLine[`title`],
          artist: parsedLine[`artist`],
          album: parsedLine[`album`],
          userId: parsedLine[`user_id`],
          musicBrainzId: parsedLine[`track_mbid`],
        })
      } catch (err) {
        return null
      }
    }).filter(x => !!x)
  )

  return plays
  
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
  }) {
    this.timestamp = timestamp
    this.itemId = itemId
    this.title = title
    this.artist = artist
    this.album = album
    this.userId = userId
    this.musicBrainzId = musicBrainzId
  }
  
}
