import { reactive, watch, html, } from '@arrow-js/core' 
import Chart from 'chart.js/auto';

const mainElement = document.querySelector('main');

export const state = reactive({
  featuresOpen: false,
  settingsOpen: false,
  currentFeature: -1,
  features: null,
  featureSideEffects: null,
  rewindReport: null,
  rewindReportData: null,
  rewindReportDownloaded: null,
  jellyHelper: null,
  auth: null,
  pollCanvas: false,
  extraFeatures: {
    totalPlaytimeGraph: true,
    fullReport: true,
  },
  settings: {
    dataSource: `jellyfin`,
    rankingMetric: `playCount`,
    useAlbumArtists: true,
    sound: false, //FIXME: change to true
  },
  disabledSettings: [],
  previousRankingMetric: null,
  overlays: [],
})
window.state = state

state.featureSideEffects = {
  0: {

  },
  1: {
    enter: () => {
      pausePlayback()
      showPlaytimeByMonthChart()
    },
    leave: destroyPlayTimeByMonthChart,
  },
  2: {
    load: loadTopTrackMedia,
    enter: playTopTrack,
  },
  3: {
    load: loadTopTracksMedia,
    enter: playTopTracks,
  },
  4: {
    load: loadTopArtistMedia,
    enter: playTopArtist,
  },
  5: {
    load: loadTopArtistsMedia,
    enter: playTopArtists,
  },
  6: {
    load: loadTopAlbumMedia,
    enter: playTopAlbum,
  },
  7: {
    load: loadTopAlbumsMedia,
    enter: playTopAlbums,
  },
  8: {
    enter: playTopGenres,
  },
  9: {
    load: loadMostSuccessivePlaysTrackMedia,
    enter: playMostSuccessivePlaysTrack,
  },
}

state.features = [
  buildFeature(`intro`, html`
    <div class="p-4">

      <div class="mt-10 w-full flex flex-col items-center">
        <img class="h-24" src="/media/jellyfin-banner-light.svg" alt="Jellyfin Rewind Logo">
        <h3 class="-rotate-6 ml-4 -mt-2 text-5xl font-quicksand font-medium text-[#00A4DC]">Rewind</h3>
      </div>


      <h2 class="text-[1.65rem] leading-8 text-center mt-16 font-semibold text-gray-800">Welcome to<br>Jellyfin Rewind ${() => state.rewindReport.year}!</h2>

      <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 mt-10 w-5/6 mx-auto">
        <p class="">This is your personal overview over your listening habits of the past year. See your most-listened songs, artists and albums, as well as other awesome stats!</p>

        <p class="">Feel free to share your Rewind on social media, I'd love to see your <span class="text-[#00A4DC]" @click="${stopPropagation()}">#JellyfinRewind</span> posts! If you have any questions or feedback, please reach out to me on <a class="text-[#00A4DC] hover:text-[#0085B2]" href="https://reddit.com/u/Chaphasilor" target="_blank" @click="${stopPropagation()}">Reddit</a> or <a class="text-[#00A4DC] hover:text-[#0085B2]" href="https://twitter.com/Chaphasilor" target="_blank" @click="${stopPropagation()}">Twitter</a>.</p>
      </div>

      <button
        class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-12 flex flex-row gap-4 items-center mx-auto"
        @click="${stopPropagation(() => next())}"
      >
        <span>Let's Go!</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-arrow-big-right" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M4 9h8v-3.586a1 1 0 0 1 1.707 -.707l6.586 6.586a1 1 0 0 1 0 1.414l-6.586 6.586a1 1 0 0 1 -1.707 -.707v-3.586h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z"></path>
        </svg>
      </button>

    </div>
  `, `bg-[#00A4DC]/10 dark:bg-[#000B25]`),
  // total playtime
  buildFeature(`total playtime`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-12">Your Total Playtime<br>of ${()=> state.rewindReport.year}<span class="inline-flex flex-row align-items-start hover:text-gray-700 cursor-pointer" @click="${stopPropagation(() => showOverlay({
        title: `About the accuracy of this data`,
        content: html`
          <div class="flex flex-col items-start gap-2">
            <p>Jellyfin doesn't save any information about played tracks other than the number of times they were played. This means that e.g. the total playtime is only an approximation. It also means that it is <span class="font-semibold">not possible to limit the data to ${() => state.rewindReport.year} only!<span></p>
            <p>However, if you have the "Playback Reporting" plugin installed, significantly more information can be collected, such as the date and durations of each playback. This will results in better stats, although it isn't perfect either. Playback reporting depends on applications properly reporting the current playback states, and currently most music players that are compatible with Jellyfin seem to struggle with this in one way or another. Especially offline playback is challenging, because the players have to "simulate" the playback after the device reconnects to the server.</p>
            <p>Alternatively, an even better solution would be to install the Playback Reporting plugin into your Jellyfin server. It won't take longer than 5 minutes, so why not do it right now? Your Jellyfin Rewind isn't going anywhere!</p>
            <a class="px-3 py-2 my-1 rounded-md text-white font-semibold bg-[#00A4DC]" href="${() => `${state.auth.config.baseUrl}/web/index.html#!/addplugin.html?name=Playback%20Reporting&guid=5c53438191a343cb907a35aa02eb9d2c`}" target="_blank">Open Plugins Page!</a> 
            <p>So, please treat all of this information with a grain of salt. You can take a look at the settings in order to choose which data will be used, but any information that needs to be interpolated will have a negative influence on the quality of these stats.</p>
            <p>I will try to offer a way to import this year's Rewind data into next year's Jellyfin Rewind, so that more information can be used and the used data can be properly limited to the current year only. Because of this, please <span class="font-semibold">make sure to download a copy of your Rewind data at the end and store it until next year!</span></p>
            <p>For more information about the Playback Reporting plugin, you can visit <a class="text-[#00A4DC]" href="https://jellyfin.org/docs/general/server/plugins/#playback-reporting" target="_blank">its entry in the official Jellyfin Docs</a>.</p>
          </div>
        `,
      }))}">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 icon icon-tabler icon-tabler-asterisk" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M12 12l8 -4.5"></path>
          <path d="M12 12v9"></path>
          <path d="M12 12l-8 -4.5"></path>
          <path d="M12 12l8 4.5"></path>
          <path d="M12 3v9"></path>
          <path d="M12 12l-8 4.5"></path>
        </svg>
      </span>:</h2>
      
      <div class="mt-10 -rotate-6 font-quicksand text-sky-500 text-4xl"><span class="font-quicksand-bold">${() => showAsNumber(state.rewindReport.generalStats.totalPlaybackDurationMinutes[state.settings.dataSource].toFixed(0))}</span> min</div>

      <div class="mt-12 w-full flex flex-col items-center gap-0.5 text-sm">
        <div><span class="font-semibold">${() => showAsNumber(state.rewindReport.generalStats?.[`totalPlays`]?.[state.settings.dataSource])}</span> total streams.</div>
        <div><span class="font-semibold">${() => showAsNumber(state.rewindReport.generalStats?.[`uniqueTracksPlayed`])}</span> unique tracks.</div>
        <div><span class="font-semibold">${() => showAsNumber(state.rewindReport.generalStats?.[`uniqueAlbumsPlayed`])}</span> unique artists.</div>
        <div><span class="font-semibold">${() => showAsNumber(state.rewindReport.generalStats?.[`uniqueArtistsPlayed`])}</span> unique albums.</div>
      </div>

      <div class="absolute bottom-16 w-full h-2/5 px-8">
        <canvas id="playtime-by-month-chart" class="${() => state.extraFeatures.totalPlaytimeGraph ? `` : `opacity-30`}"></canvas>
        ${() => state.extraFeatures.totalPlaytimeGraph ? html`<br>` : html`
          <div class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-12">
            <span class="text-4xl rotate-12 text-sky-900 tracking-wider font-semibold">Unavailable</span>
            <button @click="${stopPropagation(() => showOverlay({
              title: `Why is this feature unavailable?`,
              content: html`
                <div class="text-center">
                  <p class="text-lg">This feature is currently unavailable for ${() => state.settings.dataSource}.</p>
                  <p class="text-lg">This is due to the fact that ${() => state.settings.dataSource} does not provide the required data.</p>
                </div>
              `,
            }))}" class="w-32 rounded-md flex flex-row items-center justify-around px-2 py-1 bg-white/80">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 icon icon-tabler icon-tabler-info-square-rounded" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 8h.01"></path>
                <path d="M11 12h1v4h1"></path>
                <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
              </svg>
              <span>Learn why</span>
            </button>
          </div>
        `}
      </div>
    </div>
  `, `bg-[#00A4DC]/10 dark:bg-[#000B25]`),
  // top song
  buildFeature(`top song`, html`
    <div class="text-center text-white">
      <h2 class="text-2xl mt-5">Your Top Song<br>of 2022:</h2>
      <div class="flex mt-10 flex-col">
        <img id="top-track-image" class="w-[30vh] h-[30vh] mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
        <div class="px-4 py-4 overflow-hidden whitespace-wrap">
          <div class="-rotate-6 -ml-10 mt-10 text-4xl font-semibold">
            <div class="">${() =>
              state.settings.useAlbumArtists ?
                state.rewindReport.tracks?.[state.settings.rankingMetric]?.[0].albumBaseInfo.albumArtistBaseInfo.name :
                state.rewindReport.tracks?.[state.settings.rankingMetric]?.[0].artistsBaseInfo
                  .reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)
            } -</div>
            <div class="mt-8 ml-10">${() => state.rewindReport.tracks?.[state.settings.rankingMetric]?.[0]?.name}</div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
        <div>Streamed <span class="font-semibold">${() => showAsNumber(state.rewindReport.tracks?.[state.settings.rankingMetric]?.[0]?.playCount[state.settings.dataSource])}</span> times.</div>
        <div>Listened for <span class="font-semibold">${() => showAsNumber(state.rewindReport.tracks?.[state.settings.rankingMetric]?.[0]?.totalPlayDuration[state.settings.dataSource]?.toFixed(0))}</span> minutes.</div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-track-background-image" class="w-full h-full" />
    </div>
  `),
  // top songs of the year
  buildFeature(`top songs of the year`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-5">Your Top Songs<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.tracks?.[state.settings.rankingMetric]?.slice(0, 5).map((track, index) => html`
          <li class="relative z-[10] flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <div class="relative w-[8vh] h-[8vh] flex-shrink-0 rounded-md overflow-hidden"> 
              <img id="${() => `top-tracks-image-${index}`}" class="w-full h-full" />
              <div id="${() => `top-tracks-visualizer-${index}`}" class="absolute top-0 left-0 w-full h-full grid place-content-center text-white bg-black/30 hidden"></div>
            </div>
            <div class="flex flex-col gap-1 bg-white/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md">
              <div class="flex flex-col gap-0.25 items-start">
                <div class="flex flex-row w-full justify-start items-center whitespace-nowrap">
                  <span class="font-semibold text-base mr-2">${() => index + 1}.</span>
                  <span class="font-semibold text-base leading-tight text-ellipsis overflow-hidden">${() => track.name}</span>
                </div>
                  <span class="text-sm ml-2 text-ellipsis overflow-hidden">by ${() =>
                    state.settings.useAlbumArtists ?
                      track.albumBaseInfo.albumArtistBaseInfo.name :
                      track.artistsBaseInfo
                        .reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)
                  }</span>
              </div>
              <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                <div><span class="font-semibold text-black">${() => showAsNumber(track.playCount[state.settings.dataSource])}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${() => showAsNumber(track.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> minutes</div>
              </div>
            </div>
            <div class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]">
              <img id="${() => `top-tracks-background-image-${index}`}" class="w-full h-full" />
            </div>
          </li>
        `.key(track.id)
        // .key((Math.random() * 100000).toString(16)) // assign a random key to force re-rendering of the list (and thus the indices)
        )}
      </ol>
    </div>
    <!-- continue as simple list -->
    <ol class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40">
      ${() => state.rewindReport.tracks?.[state.settings.rankingMetric]?.slice(5, 20).map((track, index) => html`
        <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
          <div class="flex flex-col gap-1 w-full">
            <div class="flex flex-col gap-0.25 items-start">
              <div class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center">
                <span class="font-semibold mr-2">${() => index + 1 + 5}.</span>
                <span class="font-base leading-tight text-ellipsis overflow-hidden">${() => track.name}</span>
              </div>
              <div class="ml-6 text-xs">by <span class="font-semibold text-ellipsis overflow-hidden">${() =>
                state.settings.useAlbumArtists ?
                  track.albumBaseInfo.albumArtistBaseInfo.name :
                  track.artistsBaseInfo
                    .reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)
                }</span>
              </div>
            </div>
            <!--
            <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
              <div><span class="font-semibold text-black">${showAsNumber(track.playCount[state.settings.dataSource])}</span> streams</div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
              <div><span class="font-semibold text-black">${showAsNumber(track.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> minutes</div>
            </div>
            -->
          </div>
        </li>
      `.key((Math.random() * 100000).toString(16)) // assign a random key to force re-rendering of the list (and thus the indices)
      )}
    </ol>
  `, `bg-[#00A4DC]/10 dark:bg-[#000B25]`),
  //TODO add playlist intermezzo
  // top artist
  buildFeature(`top artist`, html`
    <div class="text-center text-white">
      <h2 class="text-2xl mt-5">Your Top Artist<br>of 2022:</h2>
      <div class="flex mt-10 flex-col">
        <img id="top-artist-image" class="w-[30vh] h-[30vh] mx-auto rounded-2xl drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
        <div class="px-4 py-4 overflow-hidden whitespace-wrap">
          <div class="-rotate-6 mt-16 text-5xl font-semibold">
            <div class="">${() => state.rewindReport.artists?.[state.settings.rankingMetric]?.[0]?.name}</div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
        <div>Streamed <span class="font-semibold">${() => showAsNumber(state.rewindReport.artists?.[state.settings.rankingMetric]?.[0]?.playCount[state.settings.dataSource])}</span> times.</div>
        <div>Listened to <span class="font-semibold">${() => showAsNumber(state.rewindReport.artists?.[state.settings.rankingMetric]?.[0]?.uniqueTracks)}</span> unique songs <br>for <span class="font-semibold">${() => showAsNumber(state.rewindReport.artists?.[state.settings.rankingMetric]?.[0]?.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> minutes.</div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-artist-background-image" class="w-full h-full" />
    </div>
  `),
  // top artists of the year
  buildFeature(`top artists of the year`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-5">Your Top Artists<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.artists?.[state.settings.rankingMetric]?.slice(0, 5).map((artist, index) => html`
          <li class="relative z-[10] flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <div class="relative w-[8vh] h-[8vh] flex-shrink-0 rounded-md overflow-hidden"> 
              <img id="${() => `top-artists-image-${index}`}" class="w-full h-full" />
              <div id="${() => `top-artists-visualizer-${index}`}" class="absolute top-0 left-0 w-full h-full grid place-content-center text-white bg-black/30 hidden"></div>
            </div>
            <div class="flex flex-col gap-1 bg-white/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md">
              <div class="flex flex-col gap-0.25 items-start">
                <div class="flex flex-row w-full justify-start items-center whitespace-nowrap">
                  <span class="font-semibold text-base mr-2">${() => index + 1}.</span>
                  <span class="font-semibold text-base leading-tight">${() => artist.name}</span>
                </div>
              </div>
              <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                <div><span class="font-semibold text-black">${() => showAsNumber(artist.playCount[state.settings.dataSource])}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${() => showAsNumber(artist.uniqueTracks)}</span> songs</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${() => showAsNumber(artist.totalPlayDuration[state.settings.dataSource]
                .toFixed(0))}</span> min</div>
              </div>
            </div>
            <div class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]">
              <img id="${() => `top-artists-background-image-${index}`}" class="w-full h-full" />
            </div>
          </li>
        `.key(artist.id)
        // .key((Math.random() * 100000).toString(16)) // assign a random key to force re-rendering of the list (and thus the indices)
        )}
      </ol>
    </div>
    <!-- continue as simple list -->
    <ol class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40">
      ${() => state.rewindReport.artists?.[state.settings.rankingMetric]?.slice(5, 20).map((artist, index) => html`
        <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
          <div class="flex flex-col gap-1 w-full">
            <div class="flex flex-col gap-0.25 items-start">
              <div class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center">
                <span class="font-semibold mr-2">${() => index + 1 + 5}.</span>
                <span class="font-base leading-tight text-ellipsis overflow-hidden">${() => artist.name}</span>
              </div>
            </div>
            <!--
            <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
              <div><span class="font-semibold text-black">${showAsNumber(artist.playCount[state.settings.dataSource])}</span> streams</div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
              <div><span class="font-semibold text-black">${showAsNumber(artist.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> minutes</div>
            </div>
            -->
          </div>
        </li>
      `.key((Math.random() * 100000).toString(16)) // assign a random key to force re-rendering of the list (and thus the indices)
      )}
    </ol>
  `, `bg-[#00A4DC]/10 dark:bg-[#000B25]`),
  // top album
  buildFeature(`top album`, html`
    <div class="text-center text-white">
      <h2 class="text-2xl mt-5">Your Top Album<br>of 2022:</h2>
      <div class="flex mt-10 flex-col items-center">
        <img id="top-album-image" class="w-[30vh] h-[30vh] mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
        <div class="px-4 py-4 overflow-hidden whitespace-wrap">
          <div class="-rotate-6 mt-10 text-4xl font-semibold">
            <div class="-ml-4">${() => state.rewindReport.albums?.[state.settings.rankingMetric]?.[0].name}</div>
            <div class="ml-4 mt-8 max-h-[3.5em]">by ${() =>
              state.settings.useAlbumArtists ?
                state.rewindReport.albums?.[state.settings.rankingMetric]?.[0]?.albumArtist.name :
                state.rewindReport.albums?.[state.settings.rankingMetric]?.[0]?.artists
                  .reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)
            }</div>
          </div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
        <div>Streamed <span class="font-semibold">${() => showAsNumber(state.rewindReport.albums?.[state.settings.rankingMetric]?.[0]?.playCount[state.settings.dataSource])}</span> times.</div>
        <div>Listened for <span class="font-semibold">${() => showAsNumber(state.rewindReport.albums?.[state.settings.rankingMetric]?.[0]?.totalPlayDuration[state.settings.dataSource]?.toFixed(0))}</span> minutes.</div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-album-background-image" class="w-full h-full" />
    </div>
  `),
  // top albums of the year
  buildFeature(`top albums of the year`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-5">Your Top Albums<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.albums?.[state.settings.rankingMetric]?.slice(0, 5).map((album, index) => html`
          <li class="relative z-[10] flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <div class="relative w-[8vh] h-[8vh] flex-shrink-0 rounded-md overflow-hidden"> 
              <img id="${() => `top-albums-image-${index}`}" class="w-full h-full" />
              <div id="${() => `top-albums-visualizer-${index}`}" class="absolute top-0 left-0 w-full h-full grid place-content-center text-white bg-black/30 hidden"></div>
            </div>
            <div class="flex flex-col gap-1 bg-white/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md">
              <div class="flex flex-col gap-0.25 items-start">
                <div class="flex flex-row w-full justify-start items-center whitespace-nowrap">
                  <span class="font-semibold text-base mr-2">${() => index + 1}.</span>
                  <span class="font-semibold text-base leading-tight text-ellipsis overflow-hidden">${() => album.name}</span>
                </div>
                  <span class="text-sm ml-2 text-ellipsis overflow-hidden">by ${() =>
                    state.settings.useAlbumArtists ?
                      album.albumArtist.name :
                      album.artists
                        .reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)
                  }</span>
              </div>
              <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                <div><span class="font-semibold text-black">${() => showAsNumber(album.playCount[state.settings.dataSource])}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${() => showAsNumber(album.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> minutes</div>
              </div>
            </div>
            <div class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]">
              <img id="${() => `top-albums-background-image-${index}`}" class="w-full h-full" />
            </div>
          </li>
        `.key(album.id)
        // .key((Math.random() * 100000).toString(16)) // assign a random key to force re-rendering of the list (and thus the indices)
        )}
      </ol>
    </div>
    <!-- continue as simple list -->
    <ol class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40">
      ${() => state.rewindReport.albums?.[state.settings.rankingMetric]?.slice(5, 20).map((album, index) => html`
        <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
          <div class="flex flex-col gap-1 w-full">
            <div class="flex flex-col gap-0.25 items-start">
              <div class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center">
                <span class="font-semibold mr-2">${() => index + 1 + 5}.</span>
                <span class="font-base leading-tight text-ellipsis overflow-hidden">${() => album.name}</span>
              </div>
                <div class="ml-6 text-xs">by <span class="font-semibold">${() =>
                  state.settings.useAlbumArtists ?
                    album.albumArtist.name :
                    album.artists
                      .reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)
                }</span>
            </div>
            <!--
            <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
              <div><span class="font-semibold text-black">${album.playCount[state.settings.dataSource]}</span> streams</div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
              <div><span class="font-semibold text-black">${album.totalPlayDuration[state.settings.dataSource].toFixed(0)}</span> minutes</div>
            </div>
            -->
          </div>
        </li>
      `.key((Math.random() * 100000).toString(16)) // assign a random key to force re-rendering of the list (and thus the indices)
      )}
    </ol>
  `, `bg-[#00A4DC]/10 dark:bg-[#000B25]`),
  // top generes of the year
  buildFeature(`top generes of the year`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-5">Your Top Genres<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.genres?.[state.settings.rankingMetric]?.slice(0, 5).map((genre, index) => html`
          <li class="relative z-[10] flex flex-row items-center gap-4 overflow-hidden px-4 py-3 rounded-xl" style="${`background-color: ${stringToColor(genre.name)}`}">

            <div class="flex flex-col gap-1 overflow-hidden h-full w-full rounded-md">
              <div class="flex flex-row gap-4 w-full justify-start items-center whitespace-nowrap">
                <span class="font-semibold basext-xl">${() => index + 1}.</span>
                <div class="flex flex-col gap-0.5 items-start">

                  <span class="font-quicksand-bold text-lg uppercase tracking-widest">${() => genre.name}</span>

                  <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                    <div><span class="font-semibold text-black">${() => showAsNumber(genre.playCount[state.settings.dataSource])}</span> streams</div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <circle cx="12" cy="12" r="4"></circle>
                    </svg>
                    <div><span class="font-semibold text-black">${() => showAsNumber(genre.uniqueTracks)}</span> songs</div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <circle cx="12" cy="12" r="4"></circle>
                    </svg>
                    <div><span class="font-semibold text-black">${() => showAsNumber(genre.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> min</div>
                  </div>
                </div>
                <div id="${() => `top-genres-visualizer-${index}`}" class="absolute top-0 right-0 w-[8vh] h-full grid place-content-center text-black hidden"></div>
              </div>
            </div>
          </li>
        `)}
      </ol>
    </div>
    <!-- continue as simple list -->
    <ol class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40">
      ${() => state.rewindReport.genres?.[state.settings.rankingMetric]?.slice(5, 20).map((genre, index) => html`
        <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
          <div class="flex flex-col gap-1 w-full">
            <div class="flex flex-col gap-0.25 items-start">
              <div class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center">
                <span class="font-semibold mr-2">${index + 1 + 5}.</span>
                <span class="font-semibold leading-tight text-ellipsis overflow-hidden">${genre.name}</span>
              </div>
            </div>
            <!--
            <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
              <div><span class="font-semibold text-black">${showAsNumber(genre.playCount[state.settings.dataSource])}</span> streams</div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
              <div><span class="font-semibold text-black">${showAsNumber(genre.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> minutes</div>
            </div>
            -->
          </div>
        </li>
      `)}
    </ol>
    <!-- TODO add pie chart with percentages -->
  `, `bg-[#00A4DC]/10 dark:bg-[#000B25]`),
   // most successive streams
   buildFeature(`most successive streams`, html`
   <div class="text-center text-white">
     <h2 class="text-2xl mt-5">On Repeat:<br>Most successive streams</h2>
     <div class="flex mt-10 flex-col">
       <img id="most-successive-streams-track-image" class="w-[30vh] h-[30vh] mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
       <div class="px-4 py-4 overflow-hidden whitespace-wrap">
         <div class="-rotate-6 -ml-10 mt-10 text-4xl font-semibold">
           <div class="">${() =>
             state.settings.useAlbumArtists ?
               state.rewindReport.generalStats.mostSuccessivePlays.track.albumBaseInfo.albumArtistBaseInfo.name :
               state.rewindReport.generalStats.mostSuccessivePlays.track.artistsBaseInfo
                 .reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)
           } -</div>
           <div class="mt-8 ml-10">${() => state.rewindReport.generalStats.mostSuccessivePlays.track.name}</div>
         </div>
       </div>
     </div>
     <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
       <div><span class="font-semibold">${() => showAsNumber(state.rewindReport.generalStats.mostSuccessivePlays.playCount)}</span> successive streams.</div>
       <div>Adding up to <span class="font-semibold">${() => showAsNumber(state.rewindReport.generalStats.mostSuccessivePlays.totalDuration.toFixed(1))}</span> minutes.</div>
     </div>
   </div>
   <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
     <img id="most-successive-streams-track-background-image" class="w-full h-full" />
   </div>
 `), //TODO build fallback
 // outro
 buildFeature(`outro`, html`
  <div class="p-4">
    
    <h2 class="text-[1.65rem] leading-8 text-center mt-4 font-semibold text-gray-800">That's the end<br>of this year's</h2>

    <div class="mt-4 w-full flex flex-col items-center">
      <img class="h-16" src="/media/jellyfin-banner-light.svg" alt="Jellyfin Rewind Logo">
      <h3 class="-rotate-6 ml-4 -mt-2 text-3xl font-quicksand font-medium text-[#00A4DC]">Rewind</h3>
    </div>

    <div class="flex flex-col gap-3 text-lg font-medium leading-6 text-gray-500 mt-8 w-5/6 mx-auto">
      <p class="">Thank you so much for checking it out, I hope you had fun and saw some interesting stats!</p>
      <p class="">Please make sure to</p>
    </div>
    <button
      class="px-6 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-3 flex flex-row gap-4 items-center mx-auto"
      @click="${stopPropagation(() => {

        if (!state.rewindReportData.rawData) {
          showIncompleteReportOverlay()
        } else {
          window.downloadRewindReportData(state.rewindReportData)
          state.rewindReportDownloaded = true
        }
        
      })}"
    >
      <span class="leading-7">Download Your<br>Rewind Report</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-download" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
        <polyline points="7 11 12 16 17 11"></polyline>
        <line x1="12" y1="4" x2="12" y2="16"></line>
      </svg>
    </button>

    <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 mt-3 w-5/6 mx-auto">
      <p class="">and <span class="font-bold">store it until next year</span> because it might help to show you even more insights next time around!<br>Also, it could help to generate more accurate data in case you still don't have the Playback Reporting plugin installed next year.</p>
      <p class="">Oh and I'd love to hear your feedback on <a class="text-[#00A4DC] hover:text-[#0085B2]" href="https://reddit.com/u/Chaphasilor" target="_blank" @click="${stopPropagation()}">Reddit</a> or <a class="text-[#00A4DC] hover:text-[#0085B2]" href="https://twitter.com/Chaphasilor" target="_blank" @click="${stopPropagation()}">Twitter</a>!<br>Feel free to let me know your suggestions or report bugs :)</p>
      <p class="relative">Thanks for using Jellyfin Rewind. See you next year &lt;3 <span class="absolute italic right-0 bottom-0">- Chaphasilor</span></p>
    </div>

    <button
        class="px-4 py-2 rounded-xl text-base leading-6 bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-12 flex flex-row gap-2 items-center mx-auto"
        @click="${stopPropagation(() => {

          const closeJellyfinRewind = () => {
            closeOverlay(`overlay-download-report-prompt`)
            next()
          }
          if (!state.rewindReportDownloaded) {
            showOverlay({
              title: `Are you sure?`,
              key: `download-report-prompt`,
              content: html`
                <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 mt-10 w-5/6 mx-auto">
                  <p class="">You haven't downloaded your Rewind report yet.</p>
                  <p class="">Without this data, you might be missing out on some insights next year, as well as improved quality of the statistics.</p>
                  <p class="">If possible, please save the Rewind report somewhere safe until next year, just in case. It's only a few (hundred) MBs in size.</p>
                </div>

                <button
                  class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-12 flex flex-row gap-4 items-center mx-auto"
                  @click="${stopPropagation((e) => {
                    if (!state.rewindReportData.rawData) {
                      showIncompleteReportOverlay(closeJellyfinRewind)
                    } else {
                      window.downloadRewindReportData(state.rewindReportData)
                      state.rewindReportDownloaded = true
                    }
                  })}"
                >
                  <span>Download Report</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-download" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
                    <polyline points="7 11 12 16 17 11"></polyline>
                    <line x1="12" y1="4" x2="12" y2="16"></line>
                  </svg>
                </button>

                <button
                  class="px-4 py-2 rounded-xl text-[1.2rem] bg-orange-300 hover:bg-bg-orange-400 text-white font-regular mt-12 flex flex-row gap-4 items-center mx-auto"
                  @click="${stopPropagation(() => {
                    closeJellyfinRewind()
                  })}"
                >
                  <span>Skip and close</span>
                </button>
              `,
            })
          } else {
            next()
          }
        })}"
      >
        <span>Close<br>Jellyfin Rewind</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 stroke-[2.5] icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

  </div>
`, `bg-[#00A4DC]/10 dark:bg-[#000B25]`),
]

function showIncompleteReportOverlay(onClose = () => {}) {

  console.log(`showing incomplete report overlay`)

  showOverlay({
    title: `Incomplete Report`,
    key: `incomplete-report`,
    content: html`
      <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 mt-10 w-5/6 mx-auto">
        <p class="">The report you're about to download is incomplete and missing some data.</p>
        <p class="">Please re-generate and download the report without reloading the page in-between.</p>
      </div>

      <button
        class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-12 flex flex-row gap-4 items-center mx-auto"
        @click="${stopPropagation((e) => {
          const button = e.target.closest(`button`)
          const span = button.querySelector(`span`)
          const svg = button.querySelector('svg') // arrowjs syntax highlighting breaks with backticks
          button.disabled = true
          span.innerHTML = `Generating...`
          svg.classList.add(`animate-spin`)
          window.generateRewindReport(state.rewindReport.year).then((rewindReportData) => {

            span.innerHTML = `Regenerate and Download Report`
            svg.classList.remove(`animate-spin`)
            
            state.rewindReportData = rewindReportData
            window.downloadRewindReportData(rewindReportData)
            state.rewindReportDownloaded = true
            // closeOverlay(`overlay-incomplete-report`)
            closeOverlay()

            button.disabled = false
          })
        })}"
      >
        <span>Regenerate and<br>Download Report</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-refresh" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
          <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
        </svg>
      </button>

      <button
        class="px-4 py-2 rounded-xl text-[1.2rem] bg-orange-300 hover:bg-bg-orange-400 text-white font-regular mt-12 flex flex-row gap-4 items-center mx-auto"
        @click="${stopPropagation(() => {
          window.downloadRewindReportData(state.rewindReportData, true)
          // closeOverlay(`overlay-incomplete-report`)
          closeOverlay()
        })}"
      >
        <span>Download anyway</span>
      </button>
    `,
    onClose: onClose,
  })
  
}

const settings = html`
${() =>
  !state.extraFeatures.fullReport ? html`
    <p class="text-sm text-gray-500">Jellyfin Rewind is using a 'light' version of the Rewind report, therefore some settings are not available.</p>
    <p class="text-sm mt-1 mb-3 text-gray-500">To access all settings, please <button @click="${() => {
      closeFeatures() // close settings
      closeFeatures() // close features
      closeFeatures() // for good measure, in case an overlay is open
      window.generateRewindReport().then((rewindReport) => {
        window.initializeFeatureStory(rewindReport)
      })
    }}" class="text-[#00A4DC]">re-generate the Rewind report</button> and make sure you have enough free storage left on your device!</p>
  ` : html`<br>`
}
<ul class="flex flex-col gap-4">
  <li class="flex flex-row justify-between">
    ${() => buildOptionChooser({
      title: `Sound`,
      description: `Should fitting music be played while you view the report?`,
      settingsKey: `sound`,
      options: [
        {
          name: `On`,
          description: `Sound is on`,
          value: true,
        },
        {
          name: `Off`,
          description: `Sound is off. Nothing will play.`,
          value: false,
        },
      ],
    }) }
  </li>
  <li class="flex flex-row justify-between">
    ${() => buildOptionChooser({
      title: `Main data source`,
      description: `Choose the main data source for the report`,
      settingsKey: `dataSource`,
      options: [
        {
          name: `Playback Reporting`,
          description: `Use the Playback Reporting Plugin (most accurate)`,
          value: `playbackReport`,
          disabled: state.rewindReport.playbackReportDataMissing,
        },
        {
          name: `Combined`,
          description: `Use the average of Jellyfin's built-in play count tracking and the Playback Reporting Plugin`,
          value: `average`,
          disabled: state.rewindReport.playbackReportDataMissing
        },
        {
          name: `Jellyfin`,
          description: `Use Jellyfin's built-in play count tracking (least accurate)`,
          value: `jellyfin`,
        },
      ],
    }) }
  </li>
  <li class="flex flex-row justify-between">
  ${() => buildOptionChooser({
      title: `Rank by...`,
      description: `Choose which metric should be used for ranking the top songs, artists, albums, genres, etc.`,
      settingsKey: `rankingMetric`,
      options: [
        {
          name: `Duration`,
          description: `Use the actual duration (preferred)`,
          value: `duration`,
        },
        {
          name: `Play Count`,
          description: `Only use the number of times an item was played, disregarding the duration of each play`,
          value: `playCount`,
        },
      ],
    }) }
  </li>
  <li class="flex flex-row justify-between">
    ${() => buildOptionChooser({
      title: `Artist Type`,
      description: `Toggle between (song) artists and album artists`,
      settingsKey: `useAlbumArtists`,
      options: [
        {
          name: `(Song) Artists`,
          description: `Using (song) artists`,
          value: false,
        },
        {
          name: `Album Artists`,
          description: `Using album artists`,
          value: true,
        },
      ],
    }) }
  </li>
</ul>
`

function stopPropagation(f) {
  if (!f || typeof f !== `function`) {
    f = () => {}
  }
  return (e) => {
    e.stopPropagation()
    f(e)
  }
}

function showOverlay({ title, key, content, onClose }) {

  let overlayId = `overlay-${Math.random().toString(36).substring(2, 9)}`
  if (key) {
    overlayId = `overlay-${key}`
  }
  let overlay = buildOverlay({ title, content, overlayId, onClose: () => {
    console.log(`overlayId:`, overlayId)
    closeOverlay(overlayId)
    console.log(`state.overlays:`, state.overlays)
    
  } })
  state.overlays.push(reactive({
    overlayId,
    overlay,
    onClose,
  }))

  return overlayId

}

function closeOverlay(overlayId) {
  if (!overlayId) {
    state.overlays.pop()?.onClose?.()
  } else {
    let index = state.overlays.findIndex(x => x.overlayId === overlayId)
    if (index > -1) {
      console.log(`index, overlayId:`, index, overlayId)
      state.overlays[index].onClose?.()
      state.overlays.splice(index, 1)
    }
  }
}

function buildOverlay({ title, content, overlayId, onClose }) {

  return html`
  <div style="${() => `z-index: ${200 + state.overlays.length}`}" class="absolute top-0 left-0 w-full h-full px-6 py-16 md:py-32 lg:py-48 xl:py-64">
    <div @click="${() => onClose()}" class="absolute top-0 left-0 w-full h-full bg-black/20"></div>
      <div class="w-full h-full bg-white/80 pb-20 backdrop-blur rounded-xl">
        <div class="relative w-full flex flex-row justify-center items-center px-2 pt-4 pb-2">
          <h3 class="text-center text-lg font-quicksand font-medium text-[#00A4DC]">${() => title}</h3>
          <button @click="${() => onClose()}" class="absolute right-2 text-[#00A4DC] hover:text-[#0085B2]">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="w-full h-full overflow-x-auto p-4">
          ${() => content}
        </div>
      </div>
    </div>
  </div>
  `.key(overlayId)
  
}

function buildOptionChooser({ title, description, settingsKey, options}) {

  let selectedValue = state.settings[settingsKey]
  let selectedOptionIndex = options.findIndex((option, index) => option.value === selectedValue)
  let selectedOption = options[selectedOptionIndex]

  return html`
    <div class="w-full flex flex-col gap-2 items-center">
      <div class="flex flex-col gap-0.5 items-start place-self-start">
        <span class="text-base font-semibold">${title}</span>
        <span class="text-xs text-gray-600">${description}</span>
      </div>
      <div class="w-full flex flex-row justify-around overflow-hidden border-4 border-gray-200 items-center text-sm rounded-full bg-gray-200">
        ${() => options.map((option, index) => {
          const optionDisabled = state.disabledSettings.includes(settingsKey) || option.disabled

          return html`
          <button
            class="w-full h-full rounded-md ${selectedOptionIndex === index ? `bg-gray-100` : optionDisabled ? `opacity-50`  : ``}"
            @click="${(e) => !optionDisabled ? updateSetting(settingsKey, option.value) : e.preventDefault()}"
          >
            <span class="">${option.name}</span>
          </button>
          `
        })}
      </div>
      <p class="w-full text-center text-xs px-4 text-gray-600">${selectedOption.description}</p>
    </div>
  `
  
}

function updateSetting(key, value) {
  if (!state.disabledSettings.includes(key)) {
    state.settings[key] = value
  }
}

watch(() => {
  console.log(`state.settings:`, state.settings)
})

watch(() => state.rewindReportDownloaded, (downloaded) => {
  if (downloaded !== null) {
    localStorage.setItem(`rewindReportDownloaded`, JSON.stringify(downloaded))
  }
})

watch(() => {
  console.log(`featuresOpen:`, state.featuresOpen)
})

watch(() => state.settings.rankingMetric, () => {
  if (!state.rewindReport) {
    return
  }
  if (state.previousRankingMetric && state.previousRankingMetric === state.settings.rankingMetric) {
    return
  } else if (state.previousRankingMetric === null) {
    state.previousRankingMetric = state.settings.rankingMetric
    return
  }
  console.log(`state.settings.rankingMetric:`, state.settings.rankingMetric)
  state.previousRankingMetric = state.settings.rankingMetric
  // re-load the current feature after a short delay (to wait for rendering to finish)
  setTimeout(() => {
    state.featureSideEffects?.[state.currentFeature]?.load?.()
    state.featureSideEffects?.[state.currentFeature]?.enter?.()
  }, 250)
  // re-load all other features after another short delay
  setTimeout(() => {
    Object.values(state.featureSideEffects).forEach((feature, index) => {
      if (index !== state.currentFeature) {
        feature.load?.()
      }
    })
  }, 1000)
})

export function init(rewindReportData, jellyHelper, auth) {

  state.rewindReportData = rewindReportData
  state.rewindReport = rewindReportData.jellyfinRewindReport
  state.jellyHelper = jellyHelper
  state.auth = auth
  console.log(`state.rewindReport:`, state.rewindReport)
  console.log(`state.rewindReport.type:`, state.rewindReport.type)
  console.log(`state.rewindReport.type !== 'full':`, state.rewindReport.type !== 'full')

  state.rewindReportDownloaded = JSON.parse(localStorage.getItem(`rewindReportDownloaded`)) || false

  
  if (state.rewindReport.type !== `full`) {
    state.extraFeatures.fullReport = false
    state.settings.useAlbumArtists = true
    !state.disabledSettings.includes(`useAlbumArtists`) ? state.disabledSettings.push(`useAlbumArtists`) : null
  } else {
    state.extraFeatures.fullReport = true
    state.disabledSettings = state.disabledSettings.filter((setting) => setting !== `useAlbumArtists`)
  }

  // determine which data source is the best
  if (state.rewindReport.playbackReportAvailable) {
    if (!state.rewindReport.playbackReportDataMissing) {
      if (state.rewindReport.playbackReportComplete) {
        state.settings.dataSource = `playbackReport`
      } else {
        state.settings.dataSource = `average`
      }
    } else {
      state.settings.dataSource = `jellyfin`
    }
  } else {
    state.settings.dataSource = `jellyfin`
  }

  state.extraFeatures.totalPlaytimeGraph = state.rewindReport.playbackReportAvailable && !state.rewindReport.playbackReportDataMissing

  console.log(`dataSource:`, state.settings.dataSource)

  if (state.settings.dataSource === `playbackReport`) {
    state.settings.rankingMetric = `duration`
  } else {
    state.settings.rankingMetric = `playCount`
  }

  console.log(`init finished`)

}

export function render() {

  console.info(`Rendering...`)
  
  let content = html`
      ${() => {
        return state.featuresOpen ?
          html`
          <div class="fixed top-0 left-0 w-[100vw] h-[100vh] bg-white">
            <div class="absolute top-0 left-0 z-[5] w-[100vw] h-10 flex flex-row justify-between bg-gray-700/30">
              <ul class="px-2 py-4 z-[100] w-full h-full flex flex-row gap-1.5 justify-between">
                ${() => {
                  return state.features.map((feature, index) => {
                    return html`<li class="${() => `relative block w-full rounded-full h-full text-white/0 ${state.currentFeature >= index ? `bg-white/90` : `bg-black/50`}`}"> </li>`
                  })
                }}
              </ul>
              <button class="px-1 z-[150]" @click="${() => toggleMute()}" type="button">
                ${() => state.settings.sound ?
                  html`
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white icon icon-tabler icon-tabler-volume" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M15 8a5 5 0 0 1 0 8"></path>
                    <path d="M17.7 5a9 9 0 0 1 0 14"></path>
                    <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a0.8 .8 0 0 1 1.5 .5v14a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"></path>
                  </svg>
                  ` :
                  html`
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white icon icon-tabler icon-tabler-volume-off" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5.001 5.001 0 0 1 -.535 .464"></path>
                    <path d="M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9.005 9.005 0 0 1 -.686 .615"></path>
                    <path d="M9.069 5.054l.431 -.554a0.8 .8 0 0 1 1.5 .5v2m0 4v8a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664"></path>
                    <path d="M3 3l18 18"></path>
                  </svg>
                  `
                }
              </button>
              <button class="px-1 z-[150]" @click="${() => toggleSettings()}" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white icon icon-tabler icon-tabler-settings" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="px-1 z-[150]" @click="${() => closeFeatures()}" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white icon icon-tabler icon-tabler-x" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          <ul class="absolute top-0 left-0 w-full h-full">
            ${() => state.features.map((feature, index) => feature(index))}
          </ul>
          ${() => Object.values(state.overlays).map(x => x.overlay)}
        </div>
        <audio id="audio-player-1"></audio>
        <audio id="audio-player-2"></audio>
        `
        :
        html`<br>`
      }}
  `
  content(mainElement);

  state.currentFeature = 0

  // autoAdvance()

  // document.querySelector(`#playtime-by-month-chart`).addEventListener(`load`, () => {
  //   showPlaytimeByMonthChart()
  // })
  
}

function autoAdvance() {
  let intervalTimer = setInterval(() => {
    next()
  }, 1000 * 12)
}

export function openFeatures() {
  state.featuresOpen = true
  // request fullscreen
  // document.querySelector(`body`).requestFullscreen() //FIXME reenable fullscreen
}
export function closeFeatures() {

  if (state.overlays.length > 0) {
    closeOverlay(state.overlays.slice(-1)[0].overlayId)
    return
  }
  
  // mainElement.innerHTML = ``;
  state.featuresOpen = false
  state.pollCanvas = false
  // exit fullscreen
  document.exitFullscreen().catch((err) => {
    console.warn(`Could not exit fullscreen`, err)
  })
}

export function toggleSettings() {

  if (!state.settingsOpen) {
    showOverlay({
      title: `Settings`,
      key: `settings`,
      content: settings,
      onClose: () => {
        console.log(`settings onClose`)
        state.settingsOpen = false
      }
    })
    state.settingsOpen = true

  } else {
    closeOverlay(`overlay-settings`)
  }
  
}

export function toggleMute() {
  state.settings.sound = !state.settings.sound
}

watch(() => state.featuresOpen, (value) => {
  if (value) {
    document.querySelector(`body`).classList.add(`overflow-hidden`)
    // pre-load all features
    setTimeout(() => {
      Object.entries(state.featureSideEffects).forEach(([featureId, sideEffects]) => {
        sideEffects.load?.()
      })
    }, 500)
  } else {
    document.querySelector(`body`).classList.remove(`overflow-hidden`)
    // reset all features
    Object.entries(state.featureSideEffects).forEach(([featureId, sideEffects]) => {
      sideEffects.leave?.()
    })
  }
})

watch(() => state.featuresOpen && state.currentFeature, () => {
  if (state.featuresOpen) {
    let index = state.currentFeature
    state.featureSideEffects[index]?.enter?.()
    state.featureSideEffects[(index-1) % state.features.length]?.leave?.()
  }
})

watch(() => {
  if (state.featuresOpen) {
    if (state.settings.sound) {
      resumePlayback()
    } else {
      pausePlayback()
    }
  }
})

function next() {
  console.log(`next feature`)
  if (state.currentFeature >= state.features.length - 1) {
    state.currentFeature = 0
    closeFeatures()
  } else {
    state.currentFeature++;
  }
}
function previous() {
  state.currentFeature = state.currentFeature - 1 < 0 ? 0 : state.currentFeature - 1;
}

function buildFeature(featureName, content, classes) {
  console.log(`feature '${featureName}' created`)
  return (index) => html`
    <li @click="${(e) => handleFeatureClick(e)}" data-feature-name="${() => featureName}" class="${() => `${classes} cursor-pointer [-webkit-tap-highlight-color:_transparent] absolute top-0 left-0 w-full h-full overflow-auto pt-8 pb-4 transition-opacity duration-700 ${state.currentFeature === index ? `opacity-100` : `opacity-0 pointer-events-none`}`}">
      <div>${content}</div>
      </li>
      `
      // <div class="fixed top-0 left-0 w-full h-full grid grid-cols-3 grid-rows-1">
      //   <!-- TODO use single click event with some javascript for checking if the click was on the left or right side, so that the feature can still be interacted with -->
      //   <div @click="${() => previous()}" class="col-span-1 row-span-1"></div>
      //   <div @click="${() => next()}" class="col-span-2 row-span-1"></div>
      // </div>
}

function handleFeatureClick(event) {
  // call `previous()` or `next()` depending on which side of the feature was clicked
  console.log(event)
  let featureElement = event.target.closest(`[data-feature-name]`)
  console.log(`featureElement:`, featureElement)

  if (event.clientX < featureElement.offsetWidth / 3) {
    previous()
  } else {
    next()
  }
}

function showPlaytimeByMonthChart() {

  //TODO disable if playback reporting isn't enabled
  
  console.log(`Loading chart...`)

  let canvas;

  const initializeChart = () => {
    new Chart(canvas, {
      type: 'bar',
      data,
      plugins: [
      ],
      options: {
        plugins: {
          legend: {
            display: false,
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        backgroundColor: `#ffffff`,
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              width: 3,
              color: `#002633`,
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            },
            border: {
              width: 3,
              color: `#002633`,
            }
          }
        },
        layout: {
        },
        elements: {
          bar: {
            backgroundColor: '#00a4dc',
            borderWidth: 0,
            borderRadius: 4,
            borderSkipped: `bottom`,
            minBarLength: 32,
          },
        }
      }
    });
  }
  
  let monthData = Object.keys(state.rewindReport.generalStats.totalPlaybackDurationByMonth).reduce((acc, month) => {
    acc[month] = state.rewindReport.generalStats.totalPlaybackDurationByMonth[month];
    return acc;
  }, [])
  
  let data = {
    labels: [`January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December`],
    datasets: [{
      label: `Playtime in minutes`,
      data: state.extraFeatures.totalPlaytimeGraph ? monthData : [300, 600, 367, 763, 823, 285, 506, 583, 175, 286, 1204, 496],
    }]
  }
  
  state.pollCanvas = true
  const pollCanvas = () => {
    if (!state.pollCanvas) {
      return
    }
    canvas = document.querySelector(`#playtime-by-month-chart`)
    console.log(`canvas:`, canvas)
    if (canvas === null) {
      setTimeout(pollCanvas, 100);
    } else {
      try {
        initializeChart();
      } catch (err) {
        console.warn(`Error initializing chart:`, err)
      }
    }
  }
  pollCanvas()
  
}

function destroyPlayTimeByMonthChart() {
  Chart.getChart(`playtime-by-month-chart`)?.destroy()
}

function loadTopTrackMedia() {

  const topSongPrimaryImage = document.querySelector(`#top-track-image`);
  const topSongBackgroundImage = document.querySelector(`#top-track-background-image`);
  console.log(`img:`, topSongPrimaryImage)
  const topSongByDuration = state.rewindReport.tracks?.[state.settings.rankingMetric]?.[0]
  console.log(`topSongByDuration:`, topSongByDuration)
  state.jellyHelper.loadImage([topSongPrimaryImage, topSongBackgroundImage], topSongByDuration.image, `track`)

}

function loadTopTracksMedia() {

  console.log(`topTracksMedia`)

  const topSongs = state.rewindReport.tracks?.[state.settings.rankingMetric]?.slice(0, 5)

  topSongs.forEach((song, index) => {
    const songPrimaryImage = document.querySelector(`#top-tracks-image-${index}`);
    const songBackgroundImage = document.querySelector(`#top-tracks-background-image-${index}`);
    console.log(`img:`, songPrimaryImage)
    state.jellyHelper.loadImage([songPrimaryImage, songBackgroundImage], song.image, `track`)
  })
  
}

function loadTopArtistMedia() {

  const topArtistPrimaryImage = document.querySelector(`#top-artist-image`);
  const topArtistBackgroundImage = document.querySelector(`#top-artist-background-image`);
  console.log(`img:`, topArtistPrimaryImage)
  const topSongByDuration = state.rewindReport.artists?.[state.settings.rankingMetric]?.[0]
  console.log(`topSongByDuration:`, topSongByDuration)
  state.jellyHelper.loadImage([topArtistPrimaryImage, topArtistBackgroundImage], topSongByDuration.images.primary, `artist`)

}

function loadTopArtistsMedia() {

  const topArtists = state.rewindReport.artists?.[state.settings.rankingMetric]?.slice(0, 5)

  topArtists.forEach((artist, index) => {
    const artistPrimaryImage = document.querySelector(`#top-artists-image-${index}`);
    const artistBackgroundImage = document.querySelector(`#top-artists-background-image-${index}`);
    console.log(`img:`, artistPrimaryImage)
    state.jellyHelper.loadImage([artistPrimaryImage, artistBackgroundImage], artist.images.primary, `artist`)
  })
  
}

function loadTopAlbumMedia() {

  const topAlbumPrimaryImage = document.querySelector(`#top-album-image`);
  const topAlbumBackgroundImage = document.querySelector(`#top-album-background-image`);
  console.log(`img:`, topAlbumPrimaryImage)
  const topAlbumByDuration = state.rewindReport.albums?.[state.settings.rankingMetric]?.[0]
  console.log(`topAlbumByDuration:`, topAlbumByDuration)
  state.jellyHelper.loadImage([topAlbumPrimaryImage, topAlbumBackgroundImage], topAlbumByDuration.image, `album`)

}

function loadTopAlbumsMedia() {

  const topAlbums = state.rewindReport.albums?.[state.settings.rankingMetric]?.slice(0, 5)

  topAlbums.forEach((album, index) => {
    const albumPrimaryImage = document.querySelector(`#top-albums-image-${index}`);
    const albumBackgroundImage = document.querySelector(`#top-albums-background-image-${index}`);
    console.log(`img:`, albumPrimaryImage)
    state.jellyHelper.loadImage([albumPrimaryImage, albumBackgroundImage], album.image, `album`)
  })
  
}

function loadMostSuccessivePlaysTrackMedia() {

  const mostSuccessivePlaysTrackPrimaryImage = document.querySelector(`#most-successive-streams-track-image`);
  const mostSuccessivePlaysTrackBackgroundImage = document.querySelector(`#most-successive-streams-track-background-image`);
  console.log(`img:`, mostSuccessivePlaysTrackPrimaryImage)
  const mostSuccessivePlaysTrack = state.rewindReport.generalStats.mostSuccessivePlays.track
  console.log(`mostSuccessivePlaysTrack:`, mostSuccessivePlaysTrack)
  state.jellyHelper.loadImage([mostSuccessivePlaysTrackPrimaryImage, mostSuccessivePlaysTrackBackgroundImage], mostSuccessivePlaysTrack.image, `track`)

}


function playTopTrack() {

  const topSongByDuration = state.rewindReport.tracks?.[state.settings.rankingMetric]?.[0]
  console.log(`topSongByDuration:`, topSongByDuration)
  fadeToNextTrack(topSongByDuration)

}

// plays a random track from the top 5 tracks (excluding the top track)
function playTopTracks() {

  const topSongs = state.rewindReport.tracks?.[state.settings.rankingMetric]?.slice(1, 5) // first track excluded
  const randomSongId = Math.floor(Math.random() * topSongs.length)
  const randomSong = topSongs[randomSongId]
  showPlaying(`#top-tracks-visualizer`, randomSongId+1, 5)

  console.log(`randomSong:`, randomSong)
  fadeToNextTrack(randomSong)
  
}

async function playTopArtist() {

  const topArtistByDuration = state.rewindReport.artists?.[state.settings.rankingMetric]?.[0] //TODO adhere to settings for ranking
  console.log(`topArtistByDuration:`, topArtistByDuration)

  let artistsTracks = await state.jellyHelper.loadTracksForGroup(topArtistByDuration.id, `artist`)
  let randomTrackId = Math.floor(Math.random() * artistsTracks.length)
  let randomTrack = artistsTracks[randomTrackId]
  console.log(`randomTrack:`, randomTrack)

  fadeToNextTrack({ id: randomTrack.Id })

}

// plays a random track from the top 5 artists (excluding the top artist)
async function playTopArtists() {

  const topArtists = state.rewindReport.artists?.[state.settings.rankingMetric]?.slice(1, 5) // first artist excluded
  const randomArtistId = Math.floor(Math.random() * topArtists.length)
  const randomArtist = topArtists[randomArtistId]
  console.log(`randomArtist:`, randomArtist)
  showPlaying(`#top-artists-visualizer`, randomArtistId+1, 5)

  let artistsTracks = await state.jellyHelper.loadTracksForGroup(randomArtist.id, `artist`)
  let randomTrackId = Math.floor(Math.random() * artistsTracks.length)
  let randomTrack = artistsTracks[randomTrackId]
  console.log(`randomTrack:`, randomTrack)

  fadeToNextTrack({ id: randomTrack.Id })
  
}

async function playTopAlbum() {

  const topAlbumByDuration = state.rewindReport.albums?.[state.settings.rankingMetric]?.[0] //TODO adhere to settings for ranking
  console.log(`topAlbumByDuration:`, topAlbumByDuration)

  let albumsTracks = await state.jellyHelper.loadTracksForGroup(topAlbumByDuration.id, `album`)
  let randomTrackId = Math.floor(Math.random() * albumsTracks.length)
  let randomTrack = albumsTracks[randomTrackId]
  console.log(`randomTrack:`, randomTrack)

  fadeToNextTrack({ id: randomTrack.Id })

}

// plays a random track from the top 5 albums (excluding the top album)
async function playTopAlbums() {

  const topAlbums = state.rewindReport.albums?.[state.settings.rankingMetric]?.slice(1, 5) // first album excluded
  const randomAlbumId = Math.floor(Math.random() * topAlbums.length)
  const randomAlbum = topAlbums[randomAlbumId]
  console.log(`randomAlbum:`, randomAlbum)
  showPlaying(`#top-albums-visualizer`, randomAlbumId+1, 5)

  let albumsTracks = await state.jellyHelper.loadTracksForGroup(randomAlbum.id, `album`)
  let randomTrackId = Math.floor(Math.random() * albumsTracks.length)
  let randomTrack = albumsTracks[randomTrackId]
  console.log(`randomTrack:`, randomTrack)

  fadeToNextTrack({ id: randomTrack.Id })
  
}

// plays a random track from the top 5 genres
async function playTopGenres() {

  const topGenres = state.rewindReport.genres?.[state.settings.rankingMetric]?.slice(0, 5) // first genre excluded
  const randomGenreId = Math.floor(Math.random() * topGenres.length)
  const randomGenre = topGenres[randomGenreId]
  console.log(`randomGenre:`, randomGenre)
  showPlaying(`#top-genres-visualizer`, randomGenreId, 5)

  let genresTracks = await state.jellyHelper.loadTracksForGroup(randomGenre.id, `genre`)
  let randomTrackId = Math.floor(Math.random() * genresTracks.length)
  let randomTrack = genresTracks[randomTrackId]
  console.log(`randomTrack:`, randomTrack)

  fadeToNextTrack({ id: randomTrack.Id })
  
}

function playMostSuccessivePlaysTrack() {

  const mostSuccessivePlaysTrack = state.rewindReport.generalStats.mostSuccessivePlays.track
  console.log(`topSongByDuration:`, mostSuccessivePlaysTrack)
  fadeToNextTrack(mostSuccessivePlaysTrack)

}

function showPlaying(itemQuery, itemId, idRange) {

  for (let i = 0; i < idRange; i++) {
    const itemOverlay = document.querySelector(`${itemQuery}-${i}`)
    if (itemOverlay) {
      itemOverlay.innerHTML = ``
      itemOverlay.classList.add(`hidden`)
    }
  }

  const playingItemOverlay = document.querySelector(`${itemQuery}-${itemId}`)

  // animated bars
  if (playingItemOverlay) {
    playingItemOverlay.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 icon icon-tabler icon-tabler-antenna-bars-5" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <line x1="6" y1="18" x2="6" y2="15">
          <animate attributeName="y2" values="0;16;0" begin="0.0s" dur="0.7s" repeatCount="indefinite" />
        </line>
        <line x1="10" y1="18" x2="10" y2="12">
          <animate attributeName="y2" values="0;16;0" begin="0.2s" dur="0.7s" repeatCount="indefinite" />
        </line>
        <line x1="14" y1="18" x2="14" y2="9">
          <animate attributeName="y2" values="0;16;0" begin="0.3s" dur="0.7s" repeatCount="indefinite" />
        </line>
        <line x1="18" y1="18" x2="18" y2="6">
          <animate attributeName="y2" values="0;16;0" begin="0.4s" dur="0.7s" repeatCount="indefinite" />
        </line>
      </svg>
    `
    playingItemOverlay.classList.remove(`hidden`)
  }

}

// fade between two tracks over 1000ms
async function fadeToNextTrack(trackInfo) {

  const player1 = document.querySelector(`#audio-player-1`)
  const player2 = document.querySelector(`#audio-player-2`)
  console.log(`player1:`, player1)
  console.log(`player2:`, player2)

  if (!player1 || !player2) {
    return
  }

  // mark the currently active player as inactive, and the other as active
  let activePlayer, inactivePlayer
  if (player1.paused) {
    activePlayer = player2
    inactivePlayer = player1
  } else {
    activePlayer = player1
    inactivePlayer = player2
  }
  activePlayer.setAttribute(`data-active`, false)
  inactivePlayer.setAttribute(`data-active`, true)
  await state.jellyHelper.loadAudio(inactivePlayer, trackInfo)

  if (state.settings.sound) {
  
    inactivePlayer.volume = 0
    activePlayer.volume = 1
    inactivePlayer.play()
  
    // fade
    let fadeInterval = setInterval(() => {
      try {
        if (inactivePlayer.volume + 0.1 <= 1) {
          inactivePlayer.volume += 0.1
          activePlayer.volume -= 0.1
        } else {
          clearInterval(fadeInterval)
    
          // stop the active player
          activePlayer.pause()
          activePlayer.currentTime = 0
        }
      } catch (err) {
        console.error(`Error while fading tracks:`, err)
        clearInterval(fadeInterval)
        inactivePlayer.volume = 1
        activePlayer.volume = 0
        activePlayer.pause()
      }
    }, 100)
  }

}

// fade both tracks out over 1000ms
function pausePlayback() {
  const player1 = document.querySelector(`#audio-player-1`)
  const player2 = document.querySelector(`#audio-player-2`)
  console.log(`player1:`, player1)
  console.log(`player2:`, player2)

  if (!player1 || !player2) {
    return
  }

  // mark the currently active player for later
  let activePlayer, inactivePlayer
  if (player1.paused) {
    activePlayer = player2
    inactivePlayer = player1
  } else {
    activePlayer = player1
    inactivePlayer = player2
  }
  activePlayer.setAttribute(`data-active`, true)
  inactivePlayer.setAttribute(`data-active`, false)
  
  player1.volume = 1
  player2.volume = 1

  // fade
  let fadeInterval = setInterval(() => {
    try {
      if (player1.volume - 0.1 >= 0) {
        player1.volume -= 0.1
        player2.volume -= 0.1
      } else {
        clearInterval(fadeInterval)
        
        // stop the active player
        player1.pause()
        player2.pause()
        //!!! don't reset currentTime, otherwise the track will start from the beginning when resuming playback
      }
    } catch (err) {
      console.error(`Error while fading tracks:`, err)
      clearInterval(fadeInterval)
      player1.volume = 0
      player2.volume = 0
      player1.pause()
      player2.pause()
    }
  }, 100)
  
}

// uses the tag data to determine the previously active player and resumes playback by fading it in
function resumePlayback() {
  const player1 = document.querySelector(`#audio-player-1`)
  const player2 = document.querySelector(`#audio-player-2`)
  console.log(`player1:`, player1)
  console.log(`player2:`, player2)

  if (!player1 || !player2) {
    return
  }

  let activePlayer
  if (player1.getAttribute(`data-active`) === `true`) {
    activePlayer = player1
  } else {
    activePlayer = player2
  }

  activePlayer.volume = 0
  activePlayer.play()

  // fade
  let fadeInterval = setInterval(() => {
    try {
      if (activePlayer.volume + 0.1 <= 1) {
        activePlayer.volume += 0.1
      } else {
        clearInterval(fadeInterval)
      }
    } catch (err) {
      console.error(`Error while fading tracks:`, err)
      clearInterval(fadeInterval)
      activePlayer.volume = 1
    }
  }, 100)

}

function showAsNumber(numberOrArray) {
  if (Array.isArray(numberOrArray)) {
    numberOrArray = numberOrArray.length
  }
  return numberOrArray.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// function stringToColor(string) {
//   var hash = 0;
//   for (var i = 0; i < string.length; i++) {
//       hash = string.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   var color = `#`;
//   for (var i = 0; i < 3; i++) {
//       var value = (hash >> (i * 8)) & 0xFF;
//       color += ('00' + value.toString(16)).substring(-2);
//   }
//   return color;
// }

function stringToColor(string) {
  var hash = 0;
  for (var i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  // var color = `#`;
  // for (var i = 0; i < 3; i++) {
  //     var value = (hash >> (i * 8)) & 0xFF;
  //     color += ('00' + value.toString(16)).substring(-2);
  // }
  return `hsl(${Number(hash) % 256}, 100%, 80%)`;
}
