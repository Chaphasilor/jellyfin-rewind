import jellyfin from "$lib/jellyfin";
import type { Listen, Result } from "$lib/types";
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
