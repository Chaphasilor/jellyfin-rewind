import { reactive, watch, html, } from '@arrow-js/core' 
import Chart from 'chart.js/auto';

const mainElement = document.querySelector('main');

let state = reactive({
  featuresOpen: false,
  settingsOpen: false,
  currentFeature: -1,
  features: null,
  featureSideEffects: null,
  rewindReport: null,
  jellyHelper: null,
  pollCanvas: false,
  settings: {
    dataSource: null,
    sound: true,
  },
})

state.featureSideEffects = {
  0: {
    enter: showPlaytimeByMonthChart,
    leave: destroyPlayTimeByMonthChart,
  },
  1: {
    load: loadTopTrackMedia,
    enter: playTopTrack,
  },
  2: {
    load: loadTopTracksMedia,
    enter: playTopTracks,
  },
  3: {
    load: loadTopArtistMedia,
  },
  4: {
    load: loadTopArtistsMedia,
  },
  5: {
    load: loadTopAlbumMedia,
  },
  6: {
    load: loadTopAlbumsMedia,
  },
  7: {
  },
}

state.features = [
  // total playtime
  createFeature(`total playtime`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-12">Your Total Playtime<br>of 2022:</h2>
      
      <div class="mt-24 -rotate-6 font-quicksand text-sky-500 text-4xl"><span class="font-quicksand-bold">${() => showAsNumber(state.rewindReport.generalStats.totalPlaybackDurationMinutes[state.settings.dataSource].toFixed(0))}</span> min</div>

      <div class="absolute bottom-16 w-full h-2/5 px-8">
        <canvas id="playtime-by-month-chart" class="${() => state.rewindReport.playbackReportAvailable ? `` : `opacity-30`}"></canvas>
        ${() => state.rewindReport.playbackReportAvailable ? html`` : html`
          <div class="absolute top-0 left-0 w-full h-full text-4xl rotate-12 grid content-center text-sky-900 tracking-wider font-semibold">Unavailable</div>
        `}
      </div>
    </div>
  `),
  // top song
  createFeature(`top song`, html`
    <div class="text-center text-white">
      <h2 class="text-2xl mt-5">Your Top Song<br>of 2022:</h2>
      <div class="flex mt-10 flex-col">
        <img id="top-track-image" class="w-[30vh] h-[30vh] mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
        <div class="-rotate-6 -ml-10 mt-10 text-4xl font-semibold">
          <div class="">${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0].artistsBaseInfo.reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)} -</div>
          <div class="mt-8 ml-10">${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]?.name}</div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
        <div>Streamed <span class="font-semibold">${() => showAsNumber(state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]?.playCount[state.settings.dataSource])}</span> times.</div>
        <div>Listened for <span class="font-semibold">${() => showAsNumber(state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]?.totalPlayDuration[state.settings.dataSource]?.toFixed(0))}</span> minutes.</div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-track-background-image" class="w-full h-full" />
    </div>
  `),
  // top songs of the year
  createFeature(`top songs of the year`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-5">Your Top Songs<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.slice(0, 5).map((track, index) => html`
          <li class="relative flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <img id="${() => `top-tracks-image-${index}`}" class="w-[8vh] h-[8vh] rounded-md" />
            <div class="flex flex-col gap-1 bg-white/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md">
              <div class="flex flex-col gap-0.25 items-start">
                <div class="flex flex-row w-full justify-start items-center whitespace-nowrap">
                  <span class="font-semibold text-base mr-2">${index + 1}.</span>
                  <span class="font-semibold text-base leading-tight text-ellipsis overflow-hidden">${track.name}</span>
                </div>
                  <span class="text-sm ml-2 text-ellipsis overflow-hidden">by ${track.artistsBaseInfo.reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)}</span>
              </div>
              <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                <div><span class="font-semibold text-black">${showAsNumber(track.playCount[state.settings.dataSource])}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${showAsNumber(track.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> minutes</div>
              </div>
            </div>
            <div class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]">
              <img id="${() => `top-tracks-background-image-${index}`}" class="w-full h-full" />
            </div>
          </li>
        `)}
      </ol>
    </div>
    <!-- continue as simple list -->
    <ol class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40">
      ${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.slice(5, 20).map((track, index) => html`
        <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
          <div class="flex flex-col gap-1 w-full">
            <div class="flex flex-col gap-0.25 items-start">
              <div class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center">
                <span class="font-semibold mr-2">${index + 1 + 5}.</span>
                <span class="font-semibobase leading-tight text-ellipsis overflow-hidden">${track.name}</span>
              </div>
                <div class="ml-6 text-xs">by <span class="font-semibold text-ellipsis overflow-hidden">${track.artistsBaseInfo.reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)}</span>
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
      `)}
    </ol>
  `),
  // top artist
  createFeature(`top artist`, html`
    <div class="text-center text-white">
      <h2 class="text-2xl mt-5">Your Top Artist<br>of 2022:</h2>
      <div class="flex mt-10 flex-col">
        <img id="top-artist-image" class="w-[30vh] h-[30vh] mx-auto rounded-2xl drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
        <div class="-rotate-6 mt-16 text-4xl font-semibold">
          <div class="">${() => state.rewindReport.artists?.[`topArtistsByPlayCount`]?.[0]?.name}</div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
        <div>Streamed <span class="font-semibold">${() => showAsNumber(state.rewindReport.artists?.[`topArtistsByPlayCount`]?.[0]?.playCount[state.settings.dataSource])}</span> times.</div>
        <div>Listened to <span class="font-semibold">${() => showAsNumber(state.rewindReport.artists?.[`topArtistsByPlayCount`]?.[0]?.uniqueTracks)}</span> unique songs <br>for <span class="font-semibold">${() => showAsNumber(state.rewindReport.artists?.[`topArtistsByPlayCount`]?.[0]?.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> minutes.</div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-artist-background-image" class="w-full h-full" />
    </div>
  `),
  // top artists of the year
  createFeature(`top artists of the year`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-5">Your Top Artists<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.artists?.[`topArtistsByPlayCount`]?.slice(0, 5).map((artist, index) => html`
          <li class="relative flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <img id="${() => `top-artists-image-${index}`}" class="w-[8vh] h-[8vh] rounded-md" />
            <div class="flex flex-col gap-1 bg-white/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md">
              <div class="flex flex-col gap-0.25 items-start">
                <div class="flex flex-row w-full justify-start items-center whitespace-nowrap">
                  <span class="font-semibold text-base mr-2">${index + 1}.</span>
                  <span class="font-semibold text-base leading-tight">${artist.name}</span>
                </div>
              </div>
              <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                <div><span class="font-semibold text-black">${showAsNumber(artist.playCount[state.settings.dataSource])}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${showAsNumber(artist.uniqueTracks)}</span> songs</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${showAsNumber(artist.totalPlayDuration[state.settings.dataSource]
                .toFixed(0))}</span> min</div>
              </div>
            </div>
            <div class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]">
              <img id="${() => `top-artists-background-image-${index}`}" class="w-full h-full" />
            </div>
          </li>
        `)}
      </ol>
    </div>
    <!-- continue as simple list -->
    <ol class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40">
      ${() => state.rewindReport.artists?.[`topArtistsByPlayCount`]?.slice(5, 20).map((artist, index) => html`
        <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
          <div class="flex flex-col gap-1 w-full">
            <div class="flex flex-col gap-0.25 items-start">
              <div class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center">
                <span class="font-semibold mr-2">${index + 1 + 5}.</span>
                <span class="font-semibobase leading-tight text-ellipsis overflow-hidden">${artist.name}</span>
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
      `)}
    </ol>
  `),
  // top album
  createFeature(`top album`, html`
    <div class="text-center text-white">
      <h2 class="text-2xl mt-5">Your Top Album<br>of 2022:</h2>
      <div class="flex mt-10 flex-col items-center">
        <img id="top-album-image" class="w-[30vh] h-[30vh] mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
        <div class="-rotate-6 mt-10 text-4xl font-semibold">
          <div class="-ml-4 text-ellipsis overflow-hidden">${() => state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.[0].name}</div>
          <div class="ml-4 mt-8">by ${() => state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.[0]?.albumArtist.name}</div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
        <div>Streamed <span class="font-semibold">${() => showAsNumber(state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.[0]?.playCount[state.settings.dataSource])}</span> times.</div>
        <div>Listened for <span class="font-semibold">${() => showAsNumber(state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.[0]?.totalPlayDuration[state.settings.dataSource]?.toFixed(0))}</span> minutes.</div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-album-background-image" class="w-full h-full" />
    </div>
  `),
  // top albums of the year
  createFeature(`top albums of the year`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-5">Your Top Albums<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.slice(0, 5).map((album, index) => html`
          <li class="relative flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <img id="${() => `top-albums-image-${index}`}" class="w-[8vh] h-[8vh] rounded-md" />
            <div class="flex flex-col gap-1 bg-white/30 overflow-hidden px-2 py-1 h-[10vh] w-full rounded-md">
              <div class="flex flex-col gap-0.25 items-start">
                <div class="flex flex-row w-full justify-start items-center whitespace-nowrap">
                  <span class="font-semibold text-base mr-2">${index + 1}.</span>
                  <span class="font-semibold text-babase leading-tight text-ellipsis overflow-hidden">${album.name}</span>
                </div>
                  <span class="text-sm ml-2 text-ellipsis overflow-hidden">by ${album.albumArtist.name}</span>
              </div>
              <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                <div><span class="font-semibold text-black">${album.playCount[state.settings.dataSource]}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${album.totalPlayDuration[state.settings.dataSource].toFixed(0)}</span> minutes</div>
              </div>
            </div>
            <div class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]">
              <img id="${() => `top-albums-background-image-${index}`}" class="w-full h-full" />
            </div>
          </li>
        `)}
      </ol>
    </div>
    <!-- continue as simple list -->
    <ol class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40">
      ${() => state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.slice(5, 20).map((album, index) => html`
        <li class="relative overflow-hidden w-1/2 mx-auto pl-3">
          <div class="flex flex-col gap-1 w-full">
            <div class="flex flex-col gap-0.25 items-start">
              <div class="flex flex-row w-full justify-start whitespace-nowrap overflow-hidden items-center">
                <span class="font-semibold mr-2">${index + 1 + 5}.</span>
                <span class="font-semibobase leading-tight text-ellipsis overflow-hidden">${album.name}</span>
              </div>
                <div class="ml-6 text-xs">by <span class="font-semibold">${album.albumArtist.name}</span>
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
      `)}
    </ol>
  `),
  // top generes of the year
  createFeature(`top generes of the year`, html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-5">Your Top Genres<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.genres?.[`topGenresByPlayCount`]?.slice(0, 5).map((genre, index) => html`
          <li class="relative flex flex-row items-center gap-4 overflow-hidden px-4 py-3 rounded-xl" style="${`background-color: ${stringToColor(genre.name)}`}">

            <div class="flex flex-col gap-1 overflow-hidden h-full w-full rounded-md">
              <div class="flex flex-row gap-4 w-full justify-start items-center whitespace-nowrap">
                <span class="font-semibold basext-xl">${index + 1}.</span>
                <div class="flex flex-col gap-0.5 items-start">

                  <span class="font-quicksand-bold text-lg uppercase tracking-widest">${genre.name}</span>

                  <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                    <div><span class="font-semibold text-black">${showAsNumber(genre.playCount[state.settings.dataSource])}</span> streams</div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <circle cx="12" cy="12" r="4"></circle>
                    </svg>
                    <div><span class="font-semibold text-black">${showAsNumber(genre.uniqueTracks)}</span> songs</div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <circle cx="12" cy="12" r="4"></circle>
                    </svg>
                    <div><span class="font-semibold text-black">${showAsNumber(genre.totalPlayDuration[state.settings.dataSource].toFixed(0))}</span> min</div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        `)}
      </ol>
    </div>
    <!-- continue as simple list -->
    <ol class="text-sm px-4 flex flex-col gap-0.5 overflow-x-auto flex-wrap w-full items-left h-40">
      ${() => state.rewindReport.genres?.[`topGenresByPlayCount`]?.slice(5, 20).map((genre, index) => html`
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
  `),
]

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
        ${() => options.map((option, index) => html`
          <button
            class="w-full h-full rounded-md ${selectedOptionIndex === index ? `bg-gray-100` : ``}"
            @click="${() => updateSetting(settingsKey, option.value)}"
          >
            <span class="">${option.name}</span>
          </button>
        `)}
      </div>
      <p class="w-full text-center text-xs px-4 text-gray-600">${selectedOption.description}</p>
    </div>
  `
  
}

function updateSetting(key, value) {
  state.settings[key] = value
}

watch(() => {
  console.log(`state.settings:`, state.settings)
})

watch(() => {
  console.log(`featuresOpen:`, state.featuresOpen)
})

export function init(rewindReport, jellyHelper) {

  state.rewindReport = rewindReport
  state.jellyHelper = jellyHelper
  console.log(`state.rewindReport:`, state.rewindReport)

  // determine which data source is the best
  state.settings.dataSource = state.rewindReport.playbackReportAvailable ? (state.rewindReport.playbackReportComplete ? `playbackReport` : `average`) : `jellyfin`
  console.log(`state.settings.dataSource:`, state.settings.dataSource)
  console.log(`state.rewindReport.playbackReportAvailable:`, state.rewindReport.playbackReportAvailable)

  let content = html`
      ${() => {
        return state.featuresOpen ?
          html`
          <div class="fixed top-0 left-0 w-[100vw] h-[100vh] bg-white border-red-500">
            <div class="absolute top-0 left-0 w-[100vw] h-10 flex flex-row justify-between bg-gray-700/30">
              <ul class="px-2 py-4 z-[100] w-full h-full flex flex-row gap-1.5 justify-between">
                ${() => {
                  return state.features.map((feature, index) => {
                    return html`<li class="${() => `relative block w-full rounded-full h-full text-white/0 ${state.currentFeature === index ? `bg-white/90` : `bg-black/50`}`}"> </li>`
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
          ${() => state.settingsOpen ?
            html`
            <div class="absolute top-0 left-0 w-full h-full px-6 py-16">
              <div @click="${() => toggleSettings()}" class="absolute top-0 left-0 w-full h-full bg-black/20"></div>
              <div class="w-full h-full bg-white/75 backdrop-blur rounded-xl p-3">
                <h3 class="w-full text-center text-lg mb-4">Settings</h3>
                
                <ul class="flex flex-col gap-4">
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
                        },
                        {
                          name: `Combined`,
                          description: `Use the average of Jellyfin's built-in play count tracking and the Playback Reporting Plugin`,
                          value: `average`,
                        },
                        {
                          name: `Jellyfin`,
                          description: `Use Jellyfin's built-in play count tracking (least accurate)`,
                          value: `jellyfin`,
                        },
                      ],
                    }) }
                  </li>
                </ul>
              </div>
            </div>
            ` :
            html`<br>`
          }
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

  if (state.settingsOpen) {
    toggleSettings()
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
  state.settingsOpen = !state.settingsOpen
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
  if (state.currentFeature >= state.features.length - 1) {
    state.currentFeature = 0
    closeFeatures()
  } else {
    state.currentFeature++;
  }
}
function previous() {
  state.currentFeature = (state.currentFeature - 1) % state.features.length;
}

function createFeature(featureName, content) {
  console.log(`feature created`)
  return (index) => html`
    <li data-feature-name="${() => featureName}" class="${() => `cursor-pointer absolute top-0 left-0 w-full h-full pt-8 ${state.currentFeature === index ? `opacity-100` : `opacity-0`}`}">
      <div>${content}</div>
      <div class="fixed top-0 left-0 w-full h-full grid grid-cols-3 grid-rows-1">
        <!-- TODO use single click event with some javascript for checking if the click was on the left or right side, so that the feature can still be interacted with -->
        <div @click="${() => previous()}" class="col-span-1 row-span-1"></div>
        <div @click="${() => next()}" class="col-span-2 row-span-1"></div>
      </div>
    </li>
  `
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
      label: `Playtime by Month`,
      data: state.rewindReport.playbackReportAvailable ? monthData : [300, 600, 367, 763, 823, 285, 506, 583, 175, 286, 1204, 496],
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
      initializeChart();
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
  const topSongByDuration = state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]
  console.log(`topSongByDuration:`, topSongByDuration)
  state.jellyHelper.loadImage([topSongPrimaryImage, topSongBackgroundImage], topSongByDuration.image, `track`)

}

function loadTopTracksMedia() {

  const topSongs = state.rewindReport.tracks?.[`topTracksByPlayCount`]?.slice(0, 5)

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
  const topSongByDuration = state.rewindReport.artists?.[`topArtistsByPlayCount`]?.[0]
  console.log(`topSongByDuration:`, topSongByDuration)
  state.jellyHelper.loadImage([topArtistPrimaryImage, topArtistBackgroundImage], topSongByDuration.images.primary, `artist`)

}

function loadTopArtistsMedia() {

  const topArtists = state.rewindReport.artists?.[`topArtistsByPlayCount`]?.slice(0, 5)

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
  const topAlbumByDuration = state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.[0]
  console.log(`topAlbumByDuration:`, topAlbumByDuration)
  state.jellyHelper.loadImage([topAlbumPrimaryImage, topAlbumBackgroundImage], topAlbumByDuration.image, `album`)

}

function loadTopAlbumsMedia() {

  const topAlbums = state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.slice(0, 5)

  topAlbums.forEach((album, index) => {
    const albumPrimaryImage = document.querySelector(`#top-albums-image-${index}`);
    const albumBackgroundImage = document.querySelector(`#top-albums-background-image-${index}`);
    console.log(`img:`, albumPrimaryImage)
    state.jellyHelper.loadImage([albumPrimaryImage, albumBackgroundImage], album.image, `album`)
  })
  
}


function playTopTrack() {

  const topSongByDuration = state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]
  console.log(`topSongByDuration:`, topSongByDuration)
  fadeToNextTrack(topSongByDuration)

}

// plays a random track from the top 5 tracks (excluding the top track)
function playTopTracks() {

  const topSongs = state.rewindReport.tracks?.[`topTracksByPlayCount`]?.slice(1, 5) // first track excluded
  const randomSong = topSongs[Math.floor(Math.random() * topSongs.length)]
  console.log(`randomSong:`, randomSong)
  fadeToNextTrack(randomSong)
  
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
