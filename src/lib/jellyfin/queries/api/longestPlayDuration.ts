import jellyfin from "$lib/jellyfin/index.ts";
export default async () =>
    await jellyfin.queryPlaybackReporting(
        ["ItemId", "DateCreated", "PlayDuration"],
        {
            orderBy: "PlayDuration",
            groupBy: "ItemId",
            limit: 10,
        },
    );
