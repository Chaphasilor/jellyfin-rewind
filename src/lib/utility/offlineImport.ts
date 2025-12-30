import { loadItemInfoBatched } from "$lib/jellyfin/queries/local/processing/functions.ts";
import type { ListenQueryRow } from "$lib/types.ts";
import { fetchDevices } from "$lib/utility/jellyfin-helper.ts";

export function importOfflinePlayback(
  fileHandle: Blob,
): Promise<ListenQueryRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      console.log(`Parsing offline data`);
      const offlinePlaybackData = await parseOfflinePlaybackData(
        typeof reader.result === "string" ? reader.result : "{}",
      );
      console.log(`offlinePlaybackData:`, offlinePlaybackData);

      // fetch item data to get track durations
      const itemInfoResult = await loadItemInfoBatched(
        offlinePlaybackData.map((play) => play.ItemId),
      );
      if (!itemInfoResult.success) {
        reject(new Error("Error loading item info for offline data"));
        return;
      }
      const itemInfo = itemInfoResult.data;
      console.log(`itemInfo:`, itemInfo);
      if (itemInfo[`Items`]?.length > 0) {
        // create map of item ID and duration for reduced time complexity
        const itemDurations = itemInfo[`Items`].reduce((all, cur) => {
          all[cur[`Id`]] = !isNaN(Math.round(cur[`RunTimeTicks`] / 10000000))
            ? Math.round(cur[`RunTimeTicks`] / 10000000)
            : 0;
          return all;
        }, {});
        // enrich offline plays with fetched track durations
        for (const index in offlinePlaybackData) {
          offlinePlaybackData[index].PlayDuration =
            itemDurations[offlinePlaybackData[index].ItemId];
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

async function parseOfflinePlaybackData(fileContent: string) {
  console.log(`raw offline data:`, fileContent);

  let content;
  try {
    content = JSON.parse(fileContent);
  } catch (err) {
    content = null;
  }

  if (content) {
    console.warn(`Regular JSON detected, unsupported`);
  }

  console.log(
    `fileContent.split(/\r\n|\r|\n/):`,
    fileContent.split(/\r\n|\r|\n/),
  );
  const contentLines = fileContent.split(/\r\n|\r|\n/).filter((x) =>
    x.trim().length > 0
  );
  console.log(`contentLines:`, contentLines);
  // detect supported formats
  if (contentLines.length > 0) {
    try {
      JSON.parse(contentLines[0]);
      console.info(
        `Detected Finamp offline playback data format, attempting to parse`,
      );
      return await parseFinampOfflinePlaybackData(contentLines);
    } catch (err) {
      console.error(`Error while parsing Finamp offline playback data:`, err);
      return [];
    }
  } else {
    return [];
  }
}

function parseFinampOfflinePlaybackData(contentLines: string[]) {
  console.log(`contentLines:`, contentLines);

  const plays = [];
  // parsed successfully, now parse all lines
  plays.push(
    ...contentLines.map((line) => {
      try {
        const parsedLine = JSON.parse(line);
        const play: ListenQueryRow = {
          DateCreated: new Date(Number(parsedLine[`timestamp`]) * 1000),
          ItemId: parsedLine[`item_id`],
          ItemName: `${parsedLine[`artist`]} - ${parsedLine[`title`]} (${
            parsedLine[`album`]
          })`,
          UserId: parsedLine[`user_id`],
          // musicBrainzId: parsedLine[`track_mbid`],
          ClientName: parsedLine[`client`] ?? `Finamp`,
          DeviceName: parsedLine[`device`] ?? `Unknown Device`,
          PlaybackMethod: `OfflinePlay`,
          PlayDuration: 0,
          //TODO add device information to exported offline plays file
        };
        return play;
      } catch (err) {
        return null;
      }
    }).filter((x) => !!x),
  );

  return plays;
}

export async function checkIfOfflinePlaybackImportAvailable() {
  try {
    const devices = await fetchDevices();
    const finampBetaMatch = devices[`Items`].find((device: any) => {
      if (device[`AppName`] === `Finamp`) {
        const versionString = device[`AppVersion`];
        const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/;
        const [, major, minor, patch] = versionString.match(versionRegex) || [];
        return Number(major) > 0 || Number(minor) >= 9;
      }
      return false;
    });
    return !!finampBetaMatch;
  } catch (err) {
    console.error(
      `Error while checking if offline playback import is available:`,
      err,
    );
  }
  return false;
}
