import { reactive, watch, html, } from '@arrow-js/core' 

const mainElement = document.querySelector('main');

let state = reactive({
  featuresOpen: true,
  currentFeature: 0,
  features: null,
})

state.features = [
  // totalTime
  createFeature(html`
    <a href="">totalTime</a>
  `),
  // topSong
  createFeature(html`
    <a href="">topSong</a>
  `),
  // test1
  createFeature(html`
    <a class="border border-red-500" href="">test1</a>
  `),
  
]

watch(() => {
  console.log(`featuresOpen:`, state.featuresOpen)
})

export function init() {

  let content = html`
      ${() => {
        return state.featuresOpen ?
        html`<div class="fixed top-0 left-0 w-[100vw] h-[100vh] bg-gray-200 border-red-500">
          <button class="absolute top-4 right-4 z-50" @click="${() => closeFeatures()}" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <ul class="absolute top-0 left-0 px-8 py-3 z-[100] w-full h-8 flex flex-row justify-between">
            ${() => {
              return state.features.map((feature, index) => {
                return html`<li class="relative block w-full mx-2 rounded-full h-full bg-black/50 text-white/0"> </li>`
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

  autoAdvance()

}

function autoAdvance() {
  let intervalTimer = setTimeout(() => {
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

function next() {
  state.currentFeature = (state.currentFeature + 1) % state.features.length;
}
function previous() {
  state.currentFeature = (state.currentFeature - 1) % state.features.length;
}

function createFeature(content) {
  console.log(`feature created`)
  return (index) => html`
    <li @click="${() => next()}" class="${() => `cursor-pointer absolute top-0 left-0 w-full h-full pt-6 ${state.currentFeature === index ? `opacity-100` : `opacity-0`}`}">
      ${content}
    </li>
  `
}
