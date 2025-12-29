import jellyfin from "$lib/jellyfin/index.ts";
import type { ListenQueryRow, Result } from "$lib/types.ts";
export default async () =>
  (await jellyfin.queryPlaybackReporting()) as Result<ListenQueryRow[]>;
