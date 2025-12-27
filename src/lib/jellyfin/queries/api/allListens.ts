import jellyfin from "$lib/jellyfin/index.ts";
import type { Listen, Result } from "$lib/types.ts";
export default async () =>
    (await jellyfin.queryPlaybackReporting([
        "ItemId",
        "ItemName",
        "DateCreated",
        "PlayDuration",
        "DeviceName",
        "ClientName",
        "PlaybackMethod",
    ])) as Result<Listen[]>;
