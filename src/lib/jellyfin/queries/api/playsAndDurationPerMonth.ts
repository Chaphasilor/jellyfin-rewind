import jellyfin from "$lib/jellyfin/index.ts";
import type { Result } from "$lib/types.ts";
export default async () => {
    const data = (await jellyfin.queryPlaybackReporting(
        [
            "COUNT(ItemId) AS 'plays'",
            "strftime('%m',DateCreated) AS 'month'",
            "PlayDuration AS 'duration'",
        ],
        {
            orderBy: "duration",
            groupBy: "month",
            limit: 13,
            toInt: ["duration", "plays", "month"],
        },
    )) as Result<{ plays: number; month: number; duration: number }[]>;
    if (!data.success) {
        return data;
    }
    for (let month = 1; month < 12; month++) {
        if (data.data.find((entry) => entry.month == month)) {
            data.data.push({
                plays: 0,
                month,
                duration: 0,
            });
        }
    }
    return data;
};
