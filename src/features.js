import { reactive, watch, html, } from '@arrow-js/core' 
import Chart from 'chart.js/auto';

const mainElement = document.querySelector('main');

let state = reactive({
  featuresOpen: false,
  currentFeature: -1,
  features: null,
  featureSideEffects: null,
  rewindReport: null,
  jellyHelper: null,
})

state.featureSideEffects = {
  0: {
    load: showPlaytimeByMonthChart,
    unload: destroyPlayTimeByMonthChart,
  },
  1: {
    load: loadTopTrackMedia,
  },
  2: {
    load: loadTopTracksMedia,
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
}

state.features = [
  // total playtime
  createFeature(html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-16">Your Total Playtime<br>of 2022:</h2>
      
      <div class="mt-28 -rotate-6 font-quicksand text-sky-500 text-5xl"><span class="font-quicksand-bold">${() => insertCommas(state.rewindReport.generalStats.totalPlaybackDurationMinutes.toFixed(0))}</span> min</div>

      <div class="absolute bottom-16 w-full h-2/5 px-8">
        <canvas id="playtime-by-month-chart"></canvas>
      </div>
    </div>
  `),
  // top song
  createFeature(html`
    <div class="text-center text-white">
      <h2 class="text-2xl mt-10">Your Top Song<br>of 2022:</h2>
      <div class="flex mt-10 flex-col">
        <img id="top-track-image" class="w-64 h-64 mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
        <div class="-rotate-6 -ml-10 mt-10 text-5xl font-semibold">
          <div class="">${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0].artistsBaseInfo.reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)} -</div>
          <div class="mt-8 ml-10">${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]?.name}</div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
        <div>Streamed <span class="font-semibold">${() => insertCommas(state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]?.playCount.average)}</span> times.</div>
        <div>Listened for <span class="font-semibold">${() => insertCommas(state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]?.totalPlayDuration?.toFixed(0))}</span> minutes.</div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-track-background-image" class="w-full h-full" />
    </div>
  `),
  // top songs of the year
  createFeature(html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-10">Your Top Songs<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.slice(0, 5).map((track, index) => html`
          <li class="relative flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <img id="${() => `top-tracks-image-${index}`}" class="w-20 h-20 rounded-md" />
            <div class="flex flex-col gap-1 bg-white/30 overflow-hidden px-2 py-1 h-20 w-full rounded-md">
              <div class="flex flex-col gap-0.25 items-start">
                <div class="flex flex-row w-full justify-start items-center whitespace-nowrap">
                  <span class="font-semibold text-lg mr-2">${index + 1}.</span>
                  <span class="font-semibold text-lg leading-tight text-ellipsis overflow-hidden">${track.name}</span>
                </div>
                  <span class="text-sm ml-2 text-ellipsis overflow-hidden">by ${track.artistsBaseInfo.reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)}</span>
              </div>
              <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                <div><span class="font-semibold text-black">${insertCommas(track.playCount.average)}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${insertCommas(track.totalPlayDuration.toFixed(0))}</span> minutes</div>
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
                <span class="font-semibold leading-tight text-ellipsis overflow-hidden">${track.name}</span>
              </div>
                <div class="ml-6 text-xs">by <span class="font-semibold text-ellipsis overflow-hidden">${track.artistsBaseInfo.reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)}</span>
            </div>
            <!--
            <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
              <div><span class="font-semibold text-black">${insertCommas(track.playCount.average)}</span> streams</div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
              <div><span class="font-semibold text-black">${insertCommas(track.totalPlayDuration.toFixed(0))}</span> minutes</div>
            </div>
            -->
          </div>
        </li>
      `)}
    </ol>
  `),
  // top artist
  createFeature(html`
    <div class="text-center text-white">
      <h2 class="text-2xl mt-10">Your Top Artist<br>of 2022:</h2>
      <div class="flex mt-10 flex-col">
        <img id="top-artist-image" class="w-64 h-64 mx-auto rounded-2xl drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
        <div class="-rotate-6 mt-16 text-5xl font-semibold">
          <div class="">${() => state.rewindReport.artists?.[`topArtistsByPlayCount`]?.[0]?.name}</div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
        <div>Streamed <span class="font-semibold">${() => insertCommas(state.rewindReport.artists?.[`topArtistsByPlayCount`]?.[0]?.playCount.average)}</span> times.</div>
        <!-- TODO show number of unique songs -->
        <div>Listened to <span class="font-semibold">${() => insertCommas(state.rewindReport.artists?.[`topArtistsByPlayCount`]?.[0]?.uniqueTracks.length)}</span> unique songs for <span class="font-semibold">${() => insertCommas(state.rewindReport.artists?.[`topArtistsByPlayCount`]?.[0]?.totalPlayDuration.toFixed(0))}</span> minutes.</div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-artist-background-image" class="w-full h-full" />
    </div>
  `),
  // top artists of the year
  createFeature(html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-10">Your Top Artists<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.artists?.[`topArtistsByPlayCount`]?.slice(0, 5).map((artist, index) => html`
          <li class="relative flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <img id="${() => `top-artists-image-${index}`}" class="w-20 h-20 rounded-md" />
            <div class="flex flex-col gap-1 bg-white/30 overflow-hidden px-2 py-1 h-20 w-full rounded-md">
              <div class="flex flex-col gap-0.25 items-start">
                <div class="flex flex-row w-full justify-start items-center whitespace-nowrap">
                  <span class="font-semibold text-lg mr-2">${index + 1}.</span>
                  <span class="font-semibold text-lg leading-tight">${artist.name}</span>
                </div>
              </div>
              <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                <div><span class="font-semibold text-black">${insertCommas(artist.playCount.average)}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${insertCommas(artist.uniqueTracks.length)}</span> songs</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${insertCommas(artist.totalPlayDuration.toFixed(0))}</span> min</div>
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
                <span class="font-semibold leading-tight text-ellipsis overflow-hidden">${artist.name}</span>
              </div>
            </div>
            <!--
            <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
              <div><span class="font-semibold text-black">${insertCommas(artist.playCount.average)}</span> streams</div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
              <div><span class="font-semibold text-black">${insertCommas(artist.totalPlayDuration.toFixed(0))}</span> minutes</div>
            </div>
            -->
          </div>
        </li>
      `)}
    </ol>
  `),
  // top album
  createFeature(html`
    <div class="text-center text-white">
      <h2 class="text-2xl mt-10">Your Top Album<br>of 2022:</h2>
      <div class="flex mt-10 flex-col">
        <img id="top-album-image" class="w-64 h-64 mx-auto rounded-md drop-shadow-[0_35px_35px_rgba(255,255,255,0.25)]" />
        <div class="-rotate-6 -ml-10 mt-10 text-4xl font-semibold">
          <div class="text-ellipsis overflow-hidden">${() => state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.[0].name}</div>
          <div class="mt-8 ml-10">by ${() => state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.[0]?.albumArtist.name}</div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-3">
        <div>Streamed <span class="font-semibold">${() => state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.[0]?.playCount.average}</span> times.</div>
        <div>Listened for <span class="font-semibold">${() => state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.[0]?.totalPlayDuration?.toFixed(0)}</span> minutes.</div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 bg-gray-800 -left-40 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-album-background-image" class="w-full h-full" />
    </div>
  `),
  // top albums of the year
  createFeature(html`
    <div class="text-center">
      <h2 class="text-2xl font-medium mt-10">Your Top Albums<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.albums?.[`topAlbumsByPlayCount`]?.slice(0, 5).map((album, index) => html`
          <li class="relative flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <img id="${() => `top-albums-image-${index}`}" class="w-20 h-20 rounded-md" />
            <div class="flex flex-col gap-1 bg-white/30 overflow-hidden px-2 py-1 h-20 w-full rounded-md">
              <div class="flex flex-col gap-0.25 items-start">
                <div class="flex flex-row w-full justify-start items-center whitespace-nowrap">
                  <span class="font-semibold text-lg mr-2">${index + 1}.</span>
                  <span class="font-semibold text-base leading-tight text-ellipsis overflow-hidden">${album.name}</span>
                </div>
                  <span class="text-sm ml-2 text-ellipsis overflow-hidden">by ${album.albumArtist.name}</span>
              </div>
              <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
                <div><span class="font-semibold text-black">${album.playCount.average}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold text-black">${album.totalPlayDuration.toFixed(0)}</span> minutes</div>
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
                <span class="font-semibold leading-tight text-ellipsis overflow-hidden">${album.name}</span>
              </div>
                <div class="ml-6 text-xs">by <span class="font-semibold">${album.albumArtist.name}</span>
            </div>
            <!--
            <div class="flex flex-row justify-start font-medium text-gray-800 gap-0.5 items-center text-xs">
              <div><span class="font-semibold text-black">${album.playCount.average}</span> streams</div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 stroke-2 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
              <div><span class="font-semibold text-black">${album.totalPlayDuration.toFixed(0)}</span> minutes</div>
            </div>
            -->
          </div>
        </li>
      `)}
    </ol>
  `),
]

watch(() => {
  console.log(`featuresOpen:`, state.featuresOpen)
})

export function init(rewindReport, jellyHelper) {

  state.rewindReport = rewindReport
  state.jellyHelper = jellyHelper
  console.log(`state.rewindReport:`, state.rewindReport)

  let content = html`
      ${() => {
        return state.featuresOpen ?
          html`<div class="fixed top-0 left-0 w-[100vw] h-[100vh] bg-white border-red-500">
          <button class="absolute top-0.5 right-2.5 z-[150]" @click="${() => closeFeatures()}" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white icon icon-tabler icon-tabler-x" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <ul class="absolute top-0 left-0 pl-4 pr-12 py-3 bg-gray-700/30 z-[100] w-full h-8 flex flex-row gap-1.5 justify-between">
            ${() => {
              return state.features.map((feature, index) => {
                return html`<li class="${() => `relative block w-full rounded-full h-full text-white/0 ${state.currentFeature === index ? `bg-white/90` : `bg-black/50`}`}"> </li>`
              })
            }}
          </ul>
          <ul class="absolute top-0 left-0 w-full h-full">
            ${() => state.features.map((feature, index) => feature(index))}
          </ul>
        </div>`
        :
        html`<br>`
      }}
  `
  content(mainElement);

  state.currentFeature = 0

  // autoAdvance()

  document.querySelector(`#playtime-by-month-chart`).addEventListener(`load`, () => {
    showPlaytimeByMonthChart()
  })

}

function autoAdvance() {
  let intervalTimer = setInterval(() => {
    next()
  }, 5000)
}

export function openFeatures() {
  state.featuresOpen = true
}
export function closeFeatures() {
  mainElement.innerHTML = ``;
  state.featuresOpen = false
}

watch(() => state.featuresOpen, (value) => {
  if (value) {
    document.querySelector(`body`).classList.add(`overflow-hidden`)
  } else {
    document.querySelector(`body`).classList.remove(`overflow-hidden`)
  }
})

watch(() => state.featuresOpen && state.currentFeature, () => {
  if (state.featuresOpen) {
    let index = state.currentFeature
    state.featureSideEffects[index]?.load?.()
    state.featureSideEffects[(index-1) % state.features.length]?.unload?.()
  }
})

function next() {
  if (state.currentFeature >= state.features.length - 1) {
    state.featuresOpen = false
    state.currentFeature = 0
  } else {
    state.currentFeature++;
  }
}
function previous() {
  state.currentFeature = (state.currentFeature - 1) % state.features.length;
}

function createFeature(content) {
  console.log(`feature created`)
  return (index) => html`
    <li @click="${() => next()}" class="${() => `cursor-pointer absolute top-0 left-0 w-full h-full pt-8 ${state.currentFeature === index ? `opacity-100` : `opacity-0`}`}">
      ${content}
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
      data: monthData,
    }]
  }
  
  const pollCanvas = () => {
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

function insertCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
