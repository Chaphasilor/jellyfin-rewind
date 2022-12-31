import { reactive, watch, html, } from '@arrow-js/core'

const state = reactive({
  currentView: `start`,
  views: {
    `start`: viewStart,
  }
})

export function init() {
  const onboardingElement = document.querySelector(`#onboarding`)
  
  html`
  <div class="">
    ${() => state.views[state.currentView]}
  </div>
  `(onboardingElement)

}

const viewStart = html`
<div class="p-4">

  <div class="mt-10 w-full flex flex-col items-center">
    <img class="h-24" src="${() =>  state.settings.darkMode ? '/media/jellyfin-banner-dark.svg' : '/media/jellyfin-banner-light.svg'}" alt="Jellyfin Rewind Logo">
    <h3 class="-rotate-6 ml-4 -mt-2 text-5xl font-quicksand font-medium text-[#00A4DC]">Rewind</h3>
  </div>


  <h2 class="text-[1.65rem] leading-8 text-center mt-16 font-semibold text-gray-800 dark:text-gray-200">Welcome to<br>Jellyfin Rewind ${() => state.rewindReport.year}!</h2>

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto">
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
`
