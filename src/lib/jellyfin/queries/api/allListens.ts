import type { Result } from "$lib/globals";
import jellyfin from "$lib/jellyfin";

export default async () =>
    await jellyfin.queryPlaybackReporting(
        [
            "ItemId",
            "ItemName",
            "DateCreated",
            "PlayDuration",
            "DeviceName",
            "ClientName",
        ],
    ) as Result<
        {
            ItemId: string;
            ItemName: string;
            DateCreated: Date;
            PlayDuration: number;
            DeviceName: string;
            ClientName: string;
        }[]
    >;
