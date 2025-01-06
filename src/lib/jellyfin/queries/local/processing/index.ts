import {
    fetchingTaskDone,
    fetchingTaskTodo,
    initTasksDone,
    initTasksTodo,
    processTaskDone,
    processTaskTodo,
} from "$lib/globals";
import type { ProcessingResults, Result } from "$lib/types";
import { logAndReturn } from "$lib/utility/logging";
import allListens from "../../api/allListens";
import {
    compactTrack,
    getMusicLibrary,
    getTrackFromItem,
    reset,
    updateCounters,
} from "./functions";
import {
    albumsCache,
    artistCache,
    clientCache,
    dayOfMonth,
    dayOfWeek,
    dayOfYear,
    deviceCache,
    favorites,
    generalCounter,
    genresCache,
    hourOfDay,
    monthOfYear,
    playbackCache,
    skipped,
    tracksCache,
} from "./values";

export default async (): Promise<Result<ProcessingResults>> => {
    reset();

    fetchingTaskTodo.set(2); // Queue Updates Ui

    const listens = await allListens();
    fetchingTaskDone.set(1); // Queue Updates Ui
    if (!listens.success || listens.data.length == 0) {
        return logAndReturn("processing", {
            success: false,
            reason: !listens.success
                ? listens.reason
                : "You didnt Listen to anything",
        });
    }

    const library = await getMusicLibrary();
    fetchingTaskDone.set(2); // Queue Updates Ui
    if (!library.success || library.data.Items.length == 0) {
        return logAndReturn("processing", {
            success: false,
            reason: !library.success ? library.reason : "Your Library is empty",
        });
    }

    initTasksTodo.set(library.data.Items.length);
    processTaskTodo.set(listens.data.length);

    let i = 0;
    for (const track of library.data.Items) {
        i++;
        if (track.UserData.IsFavorite) favorites.v++;

        tracksCache.setAndGetValue(track.Id, () => compactTrack(track));

        initTasksDone.set(i); // Queue Updates Ui
        if (Math.random() > 0.95) await new Promise((r) => setTimeout(r, 0)); // Give UI time to actually update
    }

    i = 0;
    for (const listen of listens.data) {
        i++;
        processTaskDone.set(i); // Queue Updates Ui

        const track = getTrackFromItem(listen);
        if (!track) {
            skipped.v++;
            console.log(listen);
            continue;
        }

        updateCounters(listen, track);

        if (Math.random() > 0.95) await new Promise((r) => setTimeout(r, 0)); // give Ui time to update
    }

    return logAndReturn("processing", {
        success: true,
        data: {
            generalCounter: generalCounter.v,

            dayOfMonth,
            monthOfYear,
            dayOfWeek,
            hourOfDay,
            dayOfYear,

            favorites: favorites.v,
            skipped: skipped.v,

            artistCache,
            tracksCache,
            albumsCache,
            genresCache,

            deviceCache,
            clientCache,
            playbackCache,
        },
    });
};
