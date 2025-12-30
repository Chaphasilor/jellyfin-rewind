import jellyfin from "$lib/jellyfin/index.ts";
import type { ListenQueryRow, Result } from "$lib/types.ts";
export default async () =>
  (await jellyfin.queryPlaybackReporting()) as Result<ListenQueryRow[]>;

export function uploadOfflinePlaybackQuery(offlinePlays: ListenQueryRow[]) {
  return `
  INSERT INTO PlaybackActivity
  (DateCreated, UserId, ItemId, ItemType, ItemName, PlaybackMethod, ClientName, DeviceName, PlayDuration)
  VALUES
    ${
    offlinePlays.map((play) =>
      `( '${
        play.DateCreated.toISOString().slice(0, 19).replace(`T`, ` `)
      }.0000000', '${
        play.UserId ?? jellyfin.user?.id
      }', '${play.ItemId}', 'Audio', '${
        play.ItemName.replaceAll?.(`'`, `''`)
      })', 'OfflinePlay', '${play.ClientName?.replaceAll?.(`'`, `''`)}', '${
        play.DeviceName.replaceAll(`'`, `''`)
      }', ${play.PlayDuration ?? 0})`
    ).join(`,`)
  }
  `;
}
// GROUP BY ItemId -- don't group so that we can filter out wrong durations
// LIMIT 200

export async function uploadOfflinePlaybackBatched(
  offlinePlays: ListenQueryRow[],
) {
  console.info(`Importing offline playback to server`);

  const batchSize = 100;
  for (
    let batchIndex = 0;
    batchIndex < Math.ceil(offlinePlays.length / batchSize);
    batchIndex++
  ) {
    console.info(`Importing batch`);
    await uploadOfflinePlayback(
      offlinePlays.slice(batchSize * batchIndex, batchSize * (batchIndex + 1)),
    );
  }
}

async function uploadOfflinePlayback(offlinePlays: ListenQueryRow[]) {
  console.log(`offlinePlays:`, offlinePlays);
  const path = `user_usage_stats/submit_custom_query?stamp=${Date.now()}`;
  const body = { CustomQueryString: uploadOfflinePlaybackQuery(offlinePlays) };
  const resultData = (await jellyfin.fetchData(path, body)) as Result<{
    colums: string[]; //!!! the plugin returns the data with a typo
    results: string[];
    message: "";
  }>;
  if (!resultData.success) {
    console.error(
      `Error while importing offline playback to server:`,
      resultData,
    );
    throw new Error(
      `Error while importing offline playback to server: ${resultData.reason}`,
    );
  }

  if (
    resultData.data[`message`]?.toLowerCase?.()?.includes?.(`query executed`)
  ) {
    console.info(`Successfully imported offline playback to server`);
    return resultData.data;
  } else {
    console.error(
      `Error while importing offline playback to server:`,
      resultData.data[`message`],
    );
    throw new Error(
      `Error while importing offline playback to server: ${
        resultData.data[`message`]
      }`,
    );
  }
}
