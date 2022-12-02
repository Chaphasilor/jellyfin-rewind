import { reactive, watch, html, } from '@arrow-js/core' 
import Chart from 'chart.js/auto';

const mainElement = document.querySelector('main');

let state = reactive({
  featuresOpen: true,
  currentFeature: -1,
  features: null,
  featureSideEffects: null,
  rewindReport: null,
  jellyHelper: null,
})

state.featureSideEffects = {
  0: showPlaytimeByMonthChart,
  1: loadTopSongMedia,
  2: loadTopSongsMedia,
}

state.features = [
  // total playtime
  createFeature(html`
    <div class="text-center">
      <h2 class="text-2xl mt-16">Your Total Playtime<br>of 2022:</h2>
      
      <div class="mt-28 -rotate-6 text-sky-500 text-5xl"><span class="font-semibold">${() => insertCommas(state.rewindReport.generalStats.totalPlaybackDurationMinutes.toFixed(0))}</span> min</div>

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
        <img id="top-song-image" class="w-64 h-auto mx-auto rounded-md" />
        <div class="-rotate-6 mr-6 mt-10 text-5xl font-semibold">
          <div class="">${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0].artistsBaseInfo.reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)} -</div>
          <div class="mt-8 ml-6">${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]?.name}</div>
        </div>
      </div>
      <div class="absolute bottom-16 left-0 w-full flex flex-col items-center gap-6">
        <div>Streamed <span class="font-semibold">${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]?.playCount.average}</span> times.<div>
        <div>Listened for <span class="font-semibold mt-4">${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]?.totalPlayDuration}</span> minutes.<div>
      </div>
    </div>
    <div class="fixed -top-16 blur-xl brightness-75 -left-32 w-[125vh] h-[125vh] z-[-1] rotate-[17deg]">
      <img id="top-song-background-image" class="w-full h-full" />
    </div>
  `),
  // top songs of the year
  createFeature(html`
    <div class="text-center">
      <h2 class="text-2xl mt-10">Your Top Songs<br>of the year</h2>
      <ol class="flex flex-col gap-2 p-6">
        ${() => state.rewindReport.tracks?.[`topTracksByPlayCount`]?.slice(0, 5).map((track, index) => html`
          <li class="relative flex flex-row items-center gap-4 overflow-hidden px-4 py-2 rounded-xl">
            <img id="${() => `top-songs-image-${index}`}" class="w-16 h-auto rounded-md" src="${track.artworkUrl}" />
            <div class="flex flex-col gap-1 bg-white/30 px-2 py-1 rounded-md">
              <div class="flex flex-row w-full justify-start items-center">
                <span class="font-semibold mr-2">${index + 1}.</span>
                <!-- <span class="text-sm">${track.artistsBaseInfo.reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)}</span> -->
                <!-- <span class="mx-1">-</span> -->
                <span class="font-semibold">${track.name}</span>
              </div>
              <div class="flex flex-row justify-start gap-3 text-xs">
                <div><span class="font-semibold">${track.playCount.average}</span> streams</div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 stroke-1.5 icon icon-tabler icon-tabler-point" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <circle cx="12" cy="12" r="4"></circle>
                </svg>
                <div><span class="font-semibold">${track.totalPlayDuration}</span> minutes</div>
              </div>
            </div>
            <div class="absolute -left-2 blur-xl saturate-200 brightness-100 w-full h-full z-[-1]">
              <img id="${() => `top-songs-background-image-${index}`}" class="w-full h-full" />
            </div>
          </li>
        `)}
      </ol>
      <!-- TODO continue as simple list -->
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
          <button class="absolute top-2 right-3 z-[150]" @click="${() => closeFeatures()}" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white icon icon-tabler icon-tabler-x" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <ul class="absolute top-0 left-0 pl-4 pr-12 py-5 bg-gray-700/30 z-[100] w-full h-12 flex flex-row justify-between">
            ${() => {
              return state.features.map((feature, index) => {
                return html`<li class="${() => `relative block w-full mx-2 rounded-full h-full text-white/0 ${state.currentFeature === index ? `bg-white/90` : `bg-black/50`}`}"> </li>`
              })
            }}
          </ul>
          <ul class="absolute top-0 left-0 w-full h-full">
            ${() => state.features.map((feature, index) => feature(index))}
          </ul>
        </div>`
        :
        html`<button type="button" @click="${() => openFeatures()}">Open</button>`
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

function openFeatures() {
  state.featuresOpen = true
}
function closeFeatures() {
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

watch(() => state.currentFeature, (index) => {
  if (state.featuresOpen && state.featureSideEffects[index]) {
    state.featureSideEffects[index]()
  }
})

function next() {
  state.currentFeature = (state.currentFeature + 1) % state.features.length;
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

  const canvas = document.querySelector(`#playtime-by-month-chart`);

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

function loadTopSongMedia() {

  const topSongPrimaryImage = document.querySelector(`#top-song-image`);
  const topSongBackgroundImage = document.querySelector(`#top-song-background-image`);
  console.log(`img:`, topSongPrimaryImage)
  const topSongByDuration = state.rewindReport.tracks?.[`topTracksByPlayCount`]?.[0]
  state.jellyHelper.loadImage([topSongPrimaryImage, topSongBackgroundImage], topSongByDuration.image)

}

function loadTopSongsMedia() {

  const topSongs = state.rewindReport.tracks?.[`topTracksByPlayCount`]?.slice(0, 5)

  topSongs.forEach((song, index) => {
    const topSongPrimaryImage = document.querySelector(`#top-songs-image-${index}`);
    const topSongBackgroundImage = document.querySelector(`#top-songs-background-image-${index}`);
    console.log(`img:`, topSongPrimaryImage)
    state.jellyHelper.loadImage([topSongPrimaryImage, topSongBackgroundImage], song.image)
  })
  
}

function insertCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
