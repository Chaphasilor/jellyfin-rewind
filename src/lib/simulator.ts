import jellyfin from "./jellyfin";
import { test } from "./utility";
import processing from "./jellyfin/queries/local/processing";
import { dev } from "$app/environment";
import {
    PUBLIC_JELLYFIN_PASSWORD,
    PUBLIC_JELLYFIN_SERVER_URL,
    PUBLIC_JELLYFIN_USERNAME,
} from "$env/static/public";

export async function run() {
    if (!dev) return;
    let v;
    v = await jellyfin.connectToURL(
        PUBLIC_JELLYFIN_SERVER_URL,
    );

    if (!test("connect to server", v)) return;

    v = await jellyfin.userLogin(
        PUBLIC_JELLYFIN_USERNAME,
        PUBLIC_JELLYFIN_PASSWORD,
    );
    if (!test("login as User", v)) return;

    // v = await allItems();
    // if (!test("query every item", v)) return;

    // v = await longestPlayDuration();
    // if (!test("longest play", v)) return;

    // v = await playsAndDurationPerMonth();
    // if (!test("monthly duration", v)) return;

    // v = await topSongPerMonth();
    // if (!test("top songs", v)) return;
    // console.log(v)

    v = await processing();
    if (!test("Processing", v)) return;

    for (let i = 0; i < 10; i++) {
        console.log("All Tests Passed! " + i);
    }
}
