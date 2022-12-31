import { reactive, watch, html, } from '@arrow-js/core'

import { connectToServer, generateRewindReport, initializeFeatureStory, loginViaAuthToken, loginViaPassword, restoreAndPrepareRewind } from './setup';

export const state = reactive({
  currentView: `start`,
  views: {},
  server: {
    url: ``,
    users: [
      {name: `test`, id: `test`},
      {name: `test`, id: `test`},
      {name: `test`, id: `test`},
      {name: `test`, id: `test`}
    ],
    loginType: `password`,
    selectedUser: null,
  },
  rewindGenerating: false,
  rewindReport: null,
  staleReport: false,
  progress: 0,
  auth: null,
  featuresInitialized: false,
  darkMode: null,
})

export async function init(auth) {
  
  state.views = reactive({
    start: viewStart,
    server: viewServer,
    user: viewUser,
    login: viewLogin,
    load: viewLoad,
    revisit: viewRevisit,
    rewindGenerationError: viewRewindGenerationError,
  })

  state.auth = auth
  
  // MediaQueryList
  const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

  // recommended method for newer browsers: specify event-type as first argument
  darkModePreference.addEventListener(`change`, e => {
    if (e.matches) {
      state.darkMode = true 
    } else {
      state.darkMode = false
    }
  });

  state.darkMode = darkModePreference.matches

  handleBackButton()

  try {
    let restored = await restoreAndPrepareRewind()
  
    state.rewindReport = restored.rewindReportData
    state.staleReport = restored.staleReport
    console.log(`state.auth.config.user:`, state.auth.config.user)
    state.currentView = `revisit`
  } catch (err) {
    if (state.auth.config.user) {
      state.currentView = `load`
    }
  }

}

function handleBackButton() {

  // add hash to url on view change
  watch(() => state.currentView, (view) => {
    let url = new URL(location.href)
    url.hash = view
    history.pushState(null, null, url);
  
  })
  
  // handle back button by changing state.currentView
  // history.pushState(null, null, location.href);
  window.onpopstate = () => {
    // console.log(`back`)
    // history.go(1);
    state.currentView = document.location.hash.slice(1)
  };
}

export function render() {
  const onboardingElement = document.querySelector(`#onboarding`)

  html`
  <div class="">
    ${() => state.views[state.currentView]}
  </div>
  `(onboardingElement)
}

watch(() => [
  console.log(`state.currentView:`, state.currentView)
])

const header = html`
<div class="mt-10 w-full flex flex-col items-center">
  <img class="h-24" src="${() =>  state.darkMode ? '/media/jellyfin-banner-dark.svg' : '/media/jellyfin-banner-light.svg'}" alt="Jellyfin Rewind Logo">
  <h3 class="-rotate-6 ml-4 -mt-2 text-5xl font-quicksand font-medium text-[#00A4DC]">Rewind</h3>
</div>
`

const viewStart = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto">
    <p class="">Hi there!</p>
    <p class="">Before we can get started with your rewind, you'll have to log into your Jellyfin server.</p>
    <p class="">Ideally, your server is reachable over the internet and via secure HTTPS, but even if not, there are ways to enjoy your Rewind.</p>
    <p class="">Let's get started!</p>
  </div>

  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-20 flex flex-row gap-4 items-center mx-auto"
    @click="${() => state.currentView = `server`}"
  >
    <span>Log In</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-arrow-big-right" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 9h8v-3.586a1 1 0 0 1 1.707 -.707l6.586 6.586a1 1 0 0 1 0 1.414l-6.586 6.586a1 1 0 0 1 -1.707 -.707v-3.586h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z"></path>
    </svg>
  </button>

</div>
`

async function connect() {
  state.server.url = document.querySelector(`#onboarding-server-url`).value
  state.server.users = await connectToServer(state.auth, state.server.url)
  state.currentView = `user`
}

const viewServer = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto">
    <p class="">First, type in the web address (URL) of your Jellyfin server.</p>
    <p class="">If you don't know the URL, you can open your Jellyfin app, open the menu/sidebar and click on "Select Server". It should display your server's URL and you can easily copy it!</p>
  </div>

  <form class="flex flex-col gap-4 mt-10 w-5/6 mx-auto" @submit="${(e) => e.preventDefault()}">
    <label class="flex flex-col gap-1">
      <span class="text-sm ml-1.5 font-medium">Server URL</span>
      <input
        id="onboarding-server-url"
        name="server-url"
        class="px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-[#00A4DC] focus:outline-none"
        type="text"
        placeholder="e.g. https://demo.jellyfin.org"
        @keydown="${(e) => e?.key?.toLowerCase() === `enter` && connect()}"
      >
    </label>
  </form>

  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-20 flex flex-row gap-4 items-center mx-auto"
    @click="${() => connect()}"
  >
    <span>Connect</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-arrow-big-right" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 9h8v-3.586a1 1 0 0 1 1.707 -.707l6.586 6.586a1 1 0 0 1 0 1.414l-6.586 6.586a1 1 0 0 1 -1.707 -.707v-3.586h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z"></path>
    </svg>
  </button>

</div>
`

const viewUser = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto">
    <p class="">That worked, amazing!</p>
    <p class="">Now, select the user account you want to see the Rewind for.</p>

    <p class="text-sm -mt-1">You can also manually enter a username if your account isn't shown.<br>Alternatively, connecting via an access token is possible as well!</p>
  </div>

  <div class="mt-6 w-5/6 mx-auto">
    <span class="text-sm ml-1.5 font-medium">Select a User</span>
    <ul class="flex flex-col gap-4 mt-2">
      <div class="flex flex-col gap-2 max-h-[14rem] overflow-x-auto">
        ${() => state.server.users.map(user => html`
          <li
            class="flex flex-row gap-3 items-center bg-white shadow-sm rounded-xl p-2"
            @click="${() => {
              state.server.selectedUser = user
              state.server.loginType = `password`
              state.currentView = `login`
            }}"
          >
            <img
              class="w-10 h-10 rounded-md" src="${() => user.PrimaryImageTag ? `${state.auth.config.baseUrl}/Users/${user.Id}/Images/Primary?tag=${user.PrimaryImageTag}` : `/media/ArtistPlaceholder.png`}"
            >
            <span class="text-xl font-semibold text-gray-700">${user.Name}</span>
          </li>
        `)}
      </div>
      <span class="w-full text-center text-gray-600 font-semibold text-xs -my-1">or</span>
      <div class="flex flex-col gap-2">
        <li
          class="flex flex-row gap-4 items-center bg-white shadow-sm rounded-xl p-2"
          @click="${() => {
            state.server.loginType = `full`
            state.currentView = `login`
          }}"
        >
          <span class="text-base text-center w-full font-regular italic text-gray-700">Manually enter username</span>
        </li>
        <span class="w-full text-center text-gray-600 font-semibold text-xs -mt-1.5 -mb-1">or</span>
        <li
          class="flex flex-row gap-4 items-center bg-white shadow-sm rounded-xl p-2"
          @click="${() => {
            state.server.loginType = `token`
            state.currentView = `login`
          }}"
        >
          <span class="text-base text-center w-full font-regular italic text-gray-700">Log in via auth token</span>
        </li>
      </div>
    </ul>
  </div>

</div>
`

async function login()  {
  const username = document.querySelector(`#onboarding-username`).value
  const password = document.querySelector(`#onboarding-password`).value
  try {
    let userInfo = await loginViaPassword(state.auth, username, password)
    state.currentView = `load`
  } catch (err) {
    console.error(`Error while logging in:`, err)
    //TODO error handling
  }
}

async function loginAuthToken()  {
  const token = document.querySelector(`#onboarding-auth-token`).value
  try {
    let userInfo = await loginViaAuthToken(state.auth, username, token)
    state.currentView = `load`
  } catch (err) {
    console.error(`Error while logging in:`, err)
    //TODO error handling
  }
}

const viewLogin = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto">
    <p class="">Almost there!</p>
    <p class="">Please enter your credentials to log into your server.<br>Your password will only be sent to your server.</p>
  </div>

  <form class="flex flex-col gap-4 mt-10 w-5/6 mx-auto" @submit="${(e) => e.preventDefault()}">
    ${() => 
      [`password`, `full`].includes(state.server.loginType) ? html`
        <label class="flex flex-col gap-1">
          <span class="text-sm ml-1.5 font-medium">Username</span>
          <input
            class="${() => `px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-[#00A4DC] focus:outline-none ${state.server.selectedUser ? `font-semibold text-gray-500` : `text-gray-700`}`}"
            id="onboarding-username"
            name="username"
            type="text"
            placeholder="Your Username"
            value="${() => state.server.selectedUser ? state.server.selectedUser.Name : ``}"
            @keydown="${(e) => e?.key?.toLowerCase() === `enter` && login()}"
          >
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm ml-1.5 font-medium">Password</span>
          <input
            class="px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-[#00A4DC] focus:outline-none"
            id="onboarding-password"
            name="password"
            type="password"
            placeholder="Your Password"
            @keydown="${(e) => e?.key?.toLowerCase() === `enter` && login()}"
          >
        </label>
      ` : html`
        <label class="flex flex-col gap-1">
          <span class="text-sm ml-1.5 font-medium">Auth Token</span>
          <input
            class="px-3 py-1.5 rounded-lg focus:ring-1 focus:ring-[#00A4DC] focus:outline-none"
            id="onboarding-auth-token"
            name="auth-token"
            type="text"
            placeholder="Your Auth Token"
            @keydown="${(e) => e?.key?.toLowerCase() === `enter` && loginAuthToken()}"
          >
        </label>
      `
    }
  </form>

  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-20 flex flex-row gap-4 items-center mx-auto"
    @click="${() => [`password`, `full`].includes(state.server.loginType) ? login() : loginAuthToken()}"
  >
    <span>Log In</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-arrow-big-right" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 9h8v-3.586a1 1 0 0 1 1.707 -.707l6.586 6.586a1 1 0 0 1 0 1.414l-6.586 6.586a1 1 0 0 1 -1.707 -.707v-3.586h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z"></path>
    </svg>
  </button>

</div>
`

const progressBar = html`
<div class="w-5/6 mx-auto mt-10 flex h-8 flex-row gap-4 justify-left">
  <!-- <img class="inline h-full animate-spin" src="/media/jellyfin-icon-transparent.svg" /> -->
  <div class="w-full flex flex-row gap-2 items-center bg-white dark:bg-[#101010] rounded-full">
    <div
      class="h-full rounded-full bg-fixed bg-gradient-to-r from-[#AA5CC3] to-[#00A4DC]"
      style="${() => `width: ${state.progress * 100}%;`}"
    ></div>
  </div>
</div>
`

function smoothSeek(current, target, duration) {
  const diff = Math.abs(target - current)
  const stepCount = 20
  const step = Math.abs(diff / stepCount)

  const increase = () => {
    if (state.progress < target) {
      state.progress += step
      setTimeout(increase, duration / stepCount)
    }
  }
  increase()
}

async function generateReport() {
  try {
    state.rewindGenerating = true
    state.progress = 0
    state.rewindReport = await generateRewindReport((progress) => {
      smoothSeek(state.progress, progress, 750)
      // state.progress = progress
    })
    state.rewindGenerating = false
  } catch (err) {
    console.error(err)
    state.rewindGenerating = false
    state.currentView = `rewindGenerationError`
  }
}

watch(() => state.currentView, async (view) => {
  if (view === `load`) {
    await generateReport()
  }
})

function launchRewind() {
  initializeFeatureStory(state.rewindReport, state.featuresInitialized)
  state.featuresInitialized = true
  state.currentView = `revisit`
}

const viewLoad = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto">
    <p class="">Awesome, you're now logged in!</p>
    <p class="">Your Rewind Report is now generating. This might take a few seconds.</p>
    <p class="">Please be patient, and if nothing happens for more than 30s, reach out to me via Reddit so that I can look into it :)</p>
  </div>

  ${() => progressBar}
  
  ${() =>
    state.rewindReport ? html`
    <button
      class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] disabled:bg-[#00A4DC]/30 text-white font-semibold mt-20 flex flex-row gap-4 items-center mx-auto"
      @click="${() => launchRewind()}"
      disabled="${() => !state.rewindReport || state.rewindGenerating}"
    >
      <span>Launch Rewind!</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2] icon icon-tabler icon-tabler-rocket" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path>
        <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path>
        <circle cx="15" cy="9" r="1"></circle>
      </svg>
    </button>
    ` : html`<br>`
  }

  <button
  class="px-4 py-2 rounded-xl text-[1.2rem] bg-red-400 hover:bg-red-500 text-white font-medium mt-20 flex flex-row gap-3 items-center mx-auto"
    @click="${() => {
      state.auth.destroySession()
      state.currentView = `start`
    }}"
  >
    <span>Log out</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-[2.5] icon icon-tabler icon-tabler-logout" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"></path>
      <path d="M7 12h14l-3 -3m0 6l3 -3"></path>
    </svg>
  </button>

</div>
`

const viewRevisit = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto">
    <p class="">Welcome back, ${() => state.auth.config?.user?.name}!</p>
    <p class="">${() =>
      !state.staleReport ? 
        html`
        <span>Your Rewind Report is still saved. You can view it any time you like.</span>
        ` : html`
        <span class="font-bold text-orange-500">The stored Rewind report is stale. Please re-generate it for the best experience.</span>
        `
    }</p>
  </div>

  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] disabled:bg-[#00A4DC]/40 text-white font-semibold mt-20 flex flex-row gap-4 items-center mx-auto"
    @click="${() => launchRewind()}"
    disabled="${() => !state.rewindReport || state.rewindGenerating}"
  >
    <span>Launch Rewind!</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2] icon icon-tabler icon-tabler-rocket" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path>
      <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path>
      <circle cx="15" cy="9" r="1"></circle>
    </svg>
  </button>

  <button
    class="px-4 py-2 rounded-xl text-[1.2rem] bg-orange-400 hover:bg-orange-500 opacity-80 text-white font-medium mt-32 flex flex-row gap-3 items-center mx-auto"
    @click="${() => {
      state.currentView = `load` 
    }}"
  >
    <span>Regenerate Rewind</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-[2.5] icon icon-tabler icon-tabler-refresh" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
    </svg>
  </button>

  <button
  class="px-4 py-2 rounded-xl text-[1.2rem] bg-red-500 hover:bg-red-600 opacity-80 text-white font-medium mt-6 flex flex-row gap-3 items-center mx-auto"
    @click="${() => {
      state.auth.destroySession()
      state.currentView = `start`
    }}"
  >
    <span>Log out</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-[2.5] icon icon-tabler icon-tabler-logout" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2"></path>
      <path d="M7 12h14l-3 -3m0 6l3 -3"></path>
    </svg>
  </button>

</div>
`

const viewRewindGenerationError = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto">
    <p class="">Sorry, we couldn't generate your Rewind Report.</p>
    <p class="">Please try again later.</p>
    <p class="">If you keep seeing this message, please reach out to me on <a class="text-[#00A4DC] hover:text-[#0085B2]" href="https://reddit.com/u/Chaphasilor" target="_blank">Reddit</a> or <a class="text-[#00A4DC] hover:text-[#0085B2]" href="https://twitter.com/Chaphasilor" target="_blank">Twitter</a> so that I can try to resolve the issue!</p>
  </div>

  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] disabled:bg-[#00A4DC]/40 text-white font-semibold mt-20 flex flex-row gap-4 items-center mx-auto"
    @click="${() => {
      state.currentView = `load` 
    }
  }"
  >
    <span>Try again</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-[2.5] icon icon-tabler icon-tabler-refresh" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
    </svg>
  </button>

</div>
`
