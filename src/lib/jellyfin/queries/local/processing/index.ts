import { downloadingProgress, generatingProgress, processingProgress } from "$lib/globals.ts";
import type { ProcessingResults, Result } from "$lib/types.ts";
import { logAndReturn } from "$lib/utility/logging.ts";
import allListens from "$lib/jellyfin/queries/api/allListens.ts";
import {
    compactTrack,
    getMusicLibrary,
    getTrackFromItem,
    reset,
    updateCounters,
} from "./functions.ts";
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
} from "./values.ts";



const execute = async (): Promise<Result<ProcessingResults>> => {
    reset();



    downloadingProgress.set({cur: 0, max: 2, detail: "Getting playback reports"})
    const listens = await allListens();
    downloadingProgress.set({cur: 1, max: 2, detail: "Getting library tracks and metadata"})
    if (!listens.success || listens.data.length == 0) {
        return logAndReturn("processing", {
            success: false,
            reason: !listens.success
            ? listens.reason
            : "You didnt Listen to anything",
        });
    }
    


    const library = await getMusicLibrary();
    downloadingProgress.set({cur: 2, max: 2, detail: ""})
    if (!library.success || library.data.Items.length == 0) {
        return logAndReturn("processing", {
            success: false,
            reason: !library.success ? library.reason : "Your Library is empty",
        });
    }



    processingProgress.set({cur: 0, max: library.data.Items.length, detail: ""})
    for (let i = 0; i < library.data.Items.length; i++) {
        const track = library.data.Items[i]
        processingProgress.update(state => ({...state, cur: i+1, detail: track.Name }))
        
        if (track.UserData.IsFavorite) favorites.v++;

        tracksCache.setAndGetValue(track.Id, () => compactTrack(track));

        if (Math.random() > 0.8) {
            await new Promise((r) => setTimeout(r, 1)); // give Ui time to update
        }
    }



    generatingProgress.set({cur: 0, max: listens.data.length, detail: ""})
    for (let i = 0; i < listens.data.length; i++) {
        const listen = listens.data[i]
        generatingProgress.update(state => ({...state, cur: i+1, detail: listen.ItemId}))

        const track = getTrackFromItem(listen);
        if (!track) {
            skipped.v++;
            continue;
        }
    
        updateCounters(listen, track);
    
        if (Math.random() > 0.8) {
            await new Promise((r) => setTimeout(r, 1)); // give Ui time to update
        }
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


let running: Promise<Result<ProcessingResults>> | undefined= undefined
function preventDoubleExecution() {
    console.log("CallED!", running)
    if (!running) running = execute()
    return running
}

export default preventDoubleExecution
