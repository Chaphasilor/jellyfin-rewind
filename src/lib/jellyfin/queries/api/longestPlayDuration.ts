import jellyfin from "$lib/jellyfin";
export default async () =>
    await jellyfin.queryPlaybackReporting(
        ["ItemId", "DateCreated", "PlayDuration"],
        {
            orderBy: "PlayDuration",
            groupBy: "ItemId",
            limit: 10,
        },
    );
