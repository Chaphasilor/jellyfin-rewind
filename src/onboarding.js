import { reactive, watch, html, } from '@arrow-js/core'

import { connectToServer, generateRewindReport, initializeFeatureStory, loginViaAuthToken, loginViaPassword, restoreAndPrepareRewind, deleteRewind } from './setup';
import { getFeatureDelta, importRewindReport } from './delta';

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
  oldReport: null,
  importingExistingReport: false,
  importingLastYearsReport: false,
  staleReport: false,
  progress: 0,
  auth: null,
  error: null,
  playbackReportingInspectionResult: null,
  connectionHelpDialogOpen: false,
  playbackReportingDialogOpen: false,
  featuresInitialized: false,
  darkMode: null,
  selectedAction: null,
})

export async function init(auth) {
  
  state.views = reactive({
    start: viewStart,
    placeholder: viewPlaceholder,
    server: viewServer,
    user: viewUser,
    login: viewLogin,
    playbackReportingIssues: viewPlaybackReportingIssues,
    importReportForViewing: viewImportReportForViewing,
    importLastYearsReport: viewImportLastYearsReport,
    launchExistingReport: viewLaunchExistingReport,
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
    if (state.auth?.config?.user) {
      await checkPlaybackReportingSetup(`revisit`)
    } else {
      state.currentView = `revisit`
    }
  } catch (err) {
    if (state.auth?.config?.user) {
      // determine which view to show
      await checkPlaybackReportingSetup()
    } else {
      state.currentView = `placeholder`
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
  <div class="md:max-w-3xl mx-auto">
    ${() => state.views[state.currentView]}
    ${() => state.connectionHelpDialogOpen ? connectionHelpDialog : null}
    ${() => state.playbackReportingDialogOpen ? playbackReportingDialog : null}
  </div>
  `(onboardingElement)
}

watch(() => [
  console.log(`state.currentView:`, state.currentView)
])

const header = html`
<div class="mt-6 w-full flex flex-col items-center mb-16">
  <img class="h-24" src="${() =>  state.darkMode ? '/media/jellyfin-banner-dark.svg' : '/media/jellyfin-banner-light.svg'}" alt="Jellyfin Rewind Logo">
  <h3 class="-rotate-6 ml-4 -mt-2 text-5xl font-quicksand font-medium text-[#00A4DC]">Rewind</h3>
</div>
`

const viewStart = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center">

    <p class="">Hi there!</p>
    
    <p class="">Before we can get started with your rewind, you'll have to log into your Jellyfin server.</p>
    <p class="">Ideally, your server is reachable over the internet and via secure HTTPS, but even if not, there are ways to enjoy your Rewind.</p>
    <p class="">Let's get started!</p>

  </div>

  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-16 flex flex-row gap-4 items-center mx-auto"
    @click="${() => state.currentView = `server`}"
  >
    <span>Log In</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-arrow-big-right" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 9h8v-3.586a1 1 0 0 1 1.707 -.707l6.586 6.586a1 1 0 0 1 0 1.414l-6.586 6.586a1 1 0 0 1 -1.707 -.707v-3.586h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z"></path>
    </svg>
  </button>

  <button
    class="px-3 py-2 rounded-lg text-[0.9rem] underline text-orange-600 font-semibold mt-4 flex flex-row gap-4 items-center mx-auto"
    @click="${() => state.currentView = `importReportForViewing`}"
  >
    <span>Import an Existing Report Instead</span>
  </button>

</div>
`

const viewPlaceholder = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center">

    <p class="">Hi there!</p>
    
    <p class="">If you're looking for this year's Jellyfin Rewind, you'll have to wait a little longer. <span class="text-white">Jellyfin Rewind 2024</span> will launch on <span class="text-white">December 31st, 2024</span> (if all goes well).</p>
    <p class="">In order to prepare for the launch, make sure your Playback Reporting plugin is installed and set up properly.</p>
    <button class="self-center text-[#00A4DC] font-semibold px-6 py-2 rounded-md bg-orange-500 dark:text-white" @click="${() => state.playbackReportingDialogOpen = true}">Click here<br>to configure it!</button></p>
    
    <p class="font-light text-base italic">If you want to review your stats from last year, you can now import your old report for viewing. The media itself probably won't load, but everything else should be there!</p>

  </div>

  <button
    class="px-3 py-2 rounded-lg text-[0.9rem] underline text-orange-600 font-semibold mt-4 flex flex-row gap-4 items-center mx-auto"
    @click="${() => state.currentView = `importReportForViewing`}"
  >
    <span>View An Old Report</span>
  </button>

</div>
`

const connectionHelpDialog = html`
<div class="fixed top-0 left-0 w-full h-full px-6 py-16 md:py-32 lg:py-48 xl:py-64">
  <div @click="${() => state.connectionHelpDialogOpen = false}" class="absolute top-0 left-0 w-full h-full bg-black/20"></div>
    <div class="w-full h-full bg-white/80 dark:bg-black/90 dark:text-white pb-20 backdrop-blur dark:backdrop-blur-sm rounded-xl">
      <div class="relative w-full flex flex-row justify-center items-center px-2 pt-4 pb-2">
        <h3 class="text-center text-lg font-quicksand font-medium text-[#00A4DC]">How to Connect?</h3>
        <button @click="${() => state.connectionHelpDialogOpen = false}" class="absolute right-2 text-[#00A4DC] hover:text-[#0085B2]">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="w-full h-full overflow-x-auto p-4">
        <div class="flex flex-col items-start gap-2">
          
          <p>Because Jellyfin Rewind is web-based and (for now at least) not available as a plugin, it might be a bit tricky to get your browser to communicate with your Jellyfin server. The problem is that browsers won't allow "insecure" requests (HTTP) from a "secure" website (HTTP<span class="font-semibold">S</span>), or requests from a non-private context (website not within your network) to a private context (Jellyfin server accessed over a local IP address within your network).</p>
          ${() => window.location.protocol === `https:` ? html`
            <p>Make sure that your Jellyfin server is accessible via <b>HTTPS</b>. If your server is only available via regular HTTP, try going to <a class="text-[#00A4DC]" href="http://jellyfin-rewind-http.chaphasilor.xyz">http://jellyfin-rewind-http.chaphasilor.xyz</a></p>
          ` : null}
          <p>So make sure you're not using a local IP address (starts with <span class="font-mono">192.168.</span>) or mDNS hostname (something like <span class="font-mono">jellyfin.local</span>). If you use something like Tailscale as your VPN, you could use your server's Tailscale IP address.</p>
          <p>Therefore, <span class="font-semibold">if you're unsure what your Jellyfin server is using, but your Jellyfin server is accessible over the internet, simply use the first link</span> (http)!</p>
          <p>If your server <span class="font-semibold">is NOT</span> accessible over the internet, you could self-host the Jellyfin Rewind website on your local network, for example on the same server that is running Jellyfin. For that, check out the <a class="text-[#00A4DC]" href="https://github.com/Chaphasilor/jellyfin-rewind/releases" target="_blank">GitHub releases page</a> and either download the zip-archive or use the provided Docker image. The zip-archive will need to be extracted into a folder that is served by a web server, like Apache or Nginx. The Docker image will need a to have port 80 exposed instead.</p>
        </div>
      </div>
    </div>
  </div>
</div>
`

const playbackReportingDialog = html`
<div class="fixed top-0 left-0 w-full h-full px-6 py-16 md:py-32 lg:py-48 xl:py-64">
  <div @click="${() => state.playbackReportingDialogOpen = false}" class="absolute top-0 left-0 w-full h-full bg-black/20"></div>
    <div class="w-full h-full bg-white/80 dark:bg-black/90 dark:text-white pb-20 backdrop-blur dark:backdrop-blur-sm rounded-xl">
      <div class="relative w-full flex flex-row justify-center items-center px-2 pt-4 pb-2">
        <h3 class="text-center text-lg font-quicksand font-medium text-[#00A4DC]">Setting up Playback Reporting</h3>
        <button @click="${() => state.playbackReportingDialogOpen = false}" class="absolute right-2 text-[#00A4DC] hover:text-[#0085B2]">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="w-full h-full overflow-x-auto p-4">
        <div class="flex flex-col items-start gap-2">
          <p>Jellyfin doesn't save any information about played tracks other than the number of times they were played. This means that e.g. the total playtime is only an approximation. It also means that it is <span class="font-semibold">not possible to limit the data to a specific time frame, like 2023 only!<span></p>
          <p>However, if you have the "Playback Reporting" plugin installed, significantly more information can be collected, such as the date and durations of each playback. This results in better stats, although it isn't perfect either. Playback reporting depends on applications properly reporting the current playback states, and currently most music players that are compatible with Jellyfin seem to struggle with this in one way or another. Especially offline playback is challenging, because the players have to "simulate" the playback after the device reconnects to the server.</p>
          <p>Still, the best solution is to install the Playback Reporting plugin into your Jellyfin server if you haven't done so already. It won't take longer than 2 minutes, so why not do it right now? (You'll have to be logged in as an admin user.)</p>
          ${() => state.server.url !== `` ? html`
            <a class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]" href="${() => `${state.auth.config.baseUrl}/web/index.html#!/addplugin.html?name=Playback%20Reporting&guid=5c53438191a343cb907a35aa02eb9d2c`}" target="_blank">Open Plugins Page!</a>
            ` : html`
            <button
              class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
              @click="${() => {
                state.selectedAction = `openPluginsPage`
                state.currentView = `server`
                state.playbackReportingDialogOpen = false
              }}">Open Plugins Page!</button>
            `
          }
          <p>By default, the Playback Reporting plugin only stores the last 3 months worth of playback data, so you definitely want to change that in the settings. I'd suggest keeping at least the last two years, just to be safe. The button below will take you directly to the settings page.</p>
          ${() => state.server.url !== `` ? html`
            <a class="px-3 py-2 my-1 rounded-md text-white font-semibold bg-[#00A4DC]" href="${() => `${state.auth.config.baseUrl}/web/index.html#!/configurationpage?name=playback_report_settings`}" target="_blank">Open Playback Reporting Settings!</a>
            ` : html`
            <button
              class="px-3 py-2 my-1 rounded-md text-white font-semibold bg-[#00A4DC]"
              @click="${() => {
                state.selectedAction = `openPlaybackReportingSettings`
                state.currentView = `server`
                state.playbackReportingDialogOpen = false
              }}">Open Playback Reporting Settings!</button>
            `
          }
          <p>For more information about the Playback Reporting plugin, you can visit <a class="text-[#00A4DC]" href="https://jellyfin.org/docs/general/server/plugins/#playback-reporting" target="_blank">its entry in the official Jellyfin Docs</a>.</p>
          <p>I will try to again offer a way to import ${() => state.rewindReport?.year}'s Rewind data into Jellyfin Rewind ${() => state.rewindReport?.year+1}, so that more information can be used and the used data can be properly limited to the current year only.</p>
        </div>
      </div>
    </div>
  </div>
</div>
`

async function connect() {
  state.error = null
  state.server.url = document.querySelector(`#onboarding-server-url`).value
  // remove trailing slash
  state.server.url = state.server.url.replace(/\/$/, ``)
  try {
    state.server.users = await connectToServer(state.auth, state.server.url)
    state.currentView = `user`
  } catch (err) {

    console.error(`Error while connecting to the server:`, err)
    state.error = html`
    <div class="flex flex-col items-start gap-1 text-base font-medium leading-6 text-red-500 dark:text-red-400 mt-10 w-5/6 mx-auto">
      <p class="">There was an error while connecting to the server.</p>
      <p class="">Please check the URL and try again.</p>
      <button class="self-center text-[#00A4DC] font-semibold px-3 py-1 rounded-md bg-orange-500 text-white" @click="${() => state.connectionHelpDialogOpen = true}">Help me!?</button>
    </div>
    `

    // try anyway, in case of CORS issues but correct URL
    if (state.selectedAction === `openPluginsPage`) {
      window.open(`${state.auth.config.baseUrl}/web/index.html#!/addplugin.html?name=Playback%20Reporting&guid=5c53438191a343cb907a35aa02eb9d2c`, `_blank`)
    } else if (state.selectedAction === `openPlaybackReportingSettings`) {
      window.open(`${state.auth.config.baseUrl}/web/index.html#!/configurationpage?name=playback_report_settings`, `_blank`)
    }

  }
}

const viewServer = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center px-2">
    <p class="">Type in the web address (URL) of your Jellyfin server in the field below.</p>
    <p class="">If you don't know the URL, you can open your Jellyfin app, open the menu/sidebar and click on "Select Server". It should display your server's URL and you can easily copy it!</p>
  </div>

  <form class="flex flex-col gap-4 mt-10 w-5/6 mx-auto" @submit="${(e) => e.preventDefault()}">
    <label class="flex flex-col gap-1">
      <span class="text-sm ml-1.5 font-medium">Server URL</span>
      <input
        id="onboarding-server-url"
        name="server-url"
        class="px-3 py-1.5 dark:bg-[#101010] dark:text-gray-200 rounded-lg focus:ring-1 focus:ring-[#00A4DC] focus:outline-none"
        type="text"
        placeholder="e.g. https://demo.jellyfin.org"
        @keydown="${(e) => e?.key?.toLowerCase() === `enter` && connect()}"
      >
    </label>
  </form>

  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-12 flex flex-row gap-4 items-center mx-auto"
    @click="${() => connect()}"
  >
    <span>Connect</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-arrow-big-right" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M4 9h8v-3.586a1 1 0 0 1 1.707 -.707l6.586 6.586a1 1 0 0 1 0 1.414l-6.586 6.586a1 1 0 0 1 -1.707 -.707v-3.586h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z"></path>
    </svg>
  </button>

  ${() => state.error}

</div>
`

const viewUser = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center">
    <p class="">That worked, amazing!</p>
    <p class="">Now, select the user account you want to see the Rewind for.</p>

    <!-- <p class="text-sm -mt-1">You can also manually enter a username if your account isn't shown.<br>Alternatively, connecting via an access token is possible as well!</p> -->
  </div>

  <div class="mt-6 w-5/6 mx-auto">
    <span class="text-sm ml-1.5 font-medium">Select a User</span>
    <ul class="flex flex-col gap-4 mt-2">
      <div class="flex flex-row flex-wrap justify-center gap-2 max-h-[14rem] overflow-x-hidden">
        ${() => state.server.users.map(user => html`
          <li
            class="flex flex-col gap-2 items-center bg-white shadow-sm rounded-xl p-2"
            @click="${() => {
              state.server.selectedUser = user
              state.server.loginType = `password`
              state.currentView = `login`
            }}"
          >
            <img
              class="w-10 h-10 rounded-md" src="${() => user.PrimaryImageTag ? `${state.auth.config.baseUrl}/Users/${user.Id}/Images/Primary?tag=${user.PrimaryImageTag}` : `/media/ArtistPlaceholder.png`}"
            >
            <span class="text-lg text-wrap text-center font-semibold text-gray-700">${user.Name}</span>
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
          <span class="text-base text-center w-full font-regular text-gray-900">Manually enter username</span>
        </li>
        <span class="w-full text-center text-gray-600 font-semibold text-xs -mt-1.5 -mb-1">or</span>
        <li
          class="flex flex-row gap-4 items-center bg-white shadow-sm rounded-xl p-2"
          @click="${() => {
            state.server.loginType = `token`
            state.currentView = `login`
          }}"
        >
          <span class="text-base text-center w-full font-regular text-gray-900">Log in with a token</span>
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
    // state.currentView = `importLastYearsReport`
    checkPlaybackReportingSetup()
  } catch (err) {
    console.error(`Error while logging in:`, err)
    state.error = html`
    <div class="flex flex-col items-start gap-1 text-base font-medium leading-6 text-red-500 dark:text-red-400 mt-10 w-5/6 mx-auto">
      <p class="w-full text-center">${err.toString()}</p>
    </div>
    `
  }
}

async function loginAuthToken()  {
  const token = document.querySelector(`#onboarding-auth-token`).value
  try {
    let userInfo = await loginViaAuthToken(state.auth, username, token)
    // state.currentView = `importLastYearsReport`
    checkPlaybackReportingSetup()
  } catch (err) {
    console.error(`Error while logging in:`, err)
    state.error = html`
    <div class="flex flex-col items-start gap-1 text-base font-medium leading-6 text-red-500 dark:text-red-400 mt-10 w-5/6 mx-auto">
      <p class="w-full text-center">${err.toString()}</p>
    </div>
    `
  }
}

function inspectPlaybackReportingSetup(playbackReportingSetup, nextScreen) {

  const inspection = {
    valid: true,
    issue: ``,
    action: null,
  }

  if (!playbackReportingSetup.installed) {
    inspection.valid = false
    inspection.issue = `The Playback Reporting plugin is not installed.`
    if (window.helper && state.auth.config.user.isAdmin) {
      inspection.action = html`
      <button
        class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
        @click="${async () => {
          try {
            await window.helper.installPlaybackReportingPlugin()
            checkPlaybackReportingSetup(nextScreen)
          } catch (err) {
            console.error(`Couldn't set up Playback Reporting Plugin!:`, err)
          }
        }}">Install Playback Reporting Plugin!</button>
      `
    }
  } else if (playbackReportingSetup.restartRequired) {
    inspection.valid = false
    inspection.issue = `The Playback Reporting plugin is installed, but the Jellyfin server needs to be restarted in order to activate it.`
    if (window.helper && state.auth.config.user.isAdmin) {
      inspection.action = html`
      <button
        class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
        @click="${async () => {
          try {
            await window.helper.shutdownServer()
            setTimeout(() => {
              checkPlaybackReportingSetup(nextScreen)
            }, 5000)
          } catch (err) {
            console.error(`Couldn't set up Playback Reporting Plugin!:`, err)
          }
        }}">Shut down Jellyfin Server</button>
      <p class="italic">For most setups, the server will <b>automatically restart</b> after shutting it down.</p>
      `
    }
  } else if (playbackReportingSetup.disabled) {
    inspection.valid = false
    inspection.issue = `The Playback Reporting plugin is installed, but disabled.`
    if (window.helper && state.auth.config.user.isAdmin) {
      inspection.action = html`
      <button
        class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
        @click="${async () => {
          try {
            await window.helper.enablePlaybackReportingPlugin(playbackReportingSetup)
            checkPlaybackReportingSetup(nextScreen)
          } catch (err) {
            console.error(`Couldn't set up Playback Reporting Plugin!:`, err)
          }
        }}">Enable Playback Reporting Plugin!</button>
      `
    }
  } else if (playbackReportingSetup.version && parseInt(playbackReportingSetup.version) < 13) {
    inspection.valid = false
    inspection.issue = `The Playback Reporting plugin is installed and active, but there is a newer version available. Please update the plugin to the latest version to make sure everything is working correctly.`
  } else if (Number(playbackReportingSetup.settings.retentionInterval) !== -1 && Number(playbackReportingSetup.settings?.retentionInterval) < 24) {
    inspection.valid = false
    inspection.issue = `The Playback Reporting plugin is installed, but the retention interval is short (${playbackReportingSetup.settings?.retentionInterval} months).`
    if (window.helper && state.auth.config.user.isAdmin) {
      inspection.action = html`
        <button
          class="px-3 py-2 my-1 mx-auto rounded-lg text-white font-semibold bg-[#00A4DC] hover:bg-[#0085B2] "
          @click="${async () => {
            try {
              const newSettings = {
                ...playbackReportingSetup.settings,
                MaxDataAge: "-1",
              }
              await window.helper.updatePlaybackReportingSettings(newSettings)
              checkPlaybackReportingSetup(nextScreen)
            } catch (err) {
              console.error(`Couldn't set up Playback Reporting Plugin!:`, err)
            }
          }}">Set retention interval to forever</button>
        <button
          class="px-2 py-1 mt-1 mx-auto rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-700 dark:text-gray-200 flex flex-row gap-4 items-center mx-auto hover:text-white"
          @click="${async () => {
            try {
              const newSettings = {
                ...playbackReportingSetup.settings,
                MaxDataAge: 24,
              }
              await window.helper.updatePlaybackReportingSettings(newSettings)
              checkPlaybackReportingSetup(nextScreen)
            } catch (err) {
              console.error(`Couldn't set up Playback Reporting Plugin!:`, err)
            }
          }}">Set retention interval to 2 years</button>
      `
    }
  } else if (playbackReportingSetup.ignoredUsers.some(user => user.id === state.auth?.config?.user?.id)) {
    inspection.valid = false
    inspection.issue = `The Playback Reporting plugin is installed and active, but your user account is ignored. Please remove your user from the list of ignored users so that listening activity is recorded for your account.`
    // if (window.helper && state.auth.config.user.isAdmin) {
      inspection.action = html`
      <a class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]" href="${() => `${state.auth.config.baseUrl}/web/index.html#!/configurationpage?name=playback_report_settings`}" target="_blank">Open Playback Reporting Settings!</a>
      <button class="px-2 py-1 rounded-lg text-sm font-semibold border-2 border-orange-400 hover:bg-orange-500 dark:border-orange-500 dark:hover:bg-orange-600 text-orange-500 hover:text-white" @click="${() => checkPlaybackReportingSetup(nextScreen)}">Check Again</button>
      `
    // }
  }

  return inspection
  
} 

async function checkPlaybackReportingSetup(nextScreen = `importLastYearsReport`) {

  // there's nothing we can do without the helper
  if (!window.helper) {
    state.currentView = nextScreen
  }

  try {

    const playbackReportingSetup = await window.helper.checkIfPlaybackReportingInstalled()
    console.log(`playbackReportingSetup:`, playbackReportingSetup)

    const inspection = inspectPlaybackReportingSetup(playbackReportingSetup, nextScreen)
    console.log(`inspection:`, inspection)

    
    if (!inspection.valid) {
      state.currentView = `playbackReportingIssues`
      state.playbackReportingInspectionResult = inspection
    } else {
      state.currentView = nextScreen
    }
    
  } catch (err) {
    console.error(`Failed to check the playback reporting setup, continuing without it:`, err)
    state.currentView = nextScreen
  }
  
}

const viewPlaybackReportingIssues = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center">
    <p class="">It seems like the Playback Reporting plugin isn't set up correctly.</p>
    <p class="">The following problem was detected:</p>
  </div>

  <div class="w-full px-6 flex flex-col gap-3 items-center text-center mt-10 text-gray-700 dark:text-gray-300 text-balance text-center">
    <p class="w-full text-lg text-balance font-semibold text-red-500 dark:text-red-400">${() => state.playbackReportingInspectionResult?.issue}</p>
    ${() => state.playbackReportingInspectionResult?.action}
  </div>

  <button
    class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-700 dark:text-gray-200 text-balance text-center mt-12 flex flex-row gap-4 items-center mx-auto hover:text-white"
    @click="${() => state.playbackReportingDialogOpen = true}"
  >
    <span>More Information about why this is important</span>
  </button>

  <button
    class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-700 dark:text-gray-200 mt-24 flex flex-row gap-4 items-center mx-auto hover:text-white"
    @click="${() => state.currentView = `importLastYearsReport`}"
  >
    <span>Continue anyway</span>
  </button>

</div>
`

const viewLogin = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto text-balance text-center">
    <p class="">Almost there!</p>
    <p class="">Please enter your credentials to log into your server.<br>Your password will only be sent to your server.</p>
  </div>

  <form class="flex flex-col gap-4 mt-10 w-5/6 mx-auto" @submit="${(e) => e.preventDefault()}">
    ${() => 
      [`password`, `full`].includes(state.server.loginType) ? html`
        <label class="flex flex-col gap-1">
          <span class="text-sm ml-1.5 font-medium">Username</span>
          <input
            class="${() => `px-3 py-1.5 dark:bg-[#101010] dark:text-gray-200 rounded-lg focus:ring-1 focus:ring-[#00A4DC] focus:outline-none ${state.server.selectedUser ? `font-semibold text-gray-500` : `text-gray-700`}`}"
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
            class="px-3 py-1.5 dark:bg-[#101010] dark:text-gray-200 rounded-lg focus:ring-1 focus:ring-[#00A4DC] focus:outline-none"
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
            class="px-3 py-1.5 dark:bg-[#101010] dark:text-gray-200 rounded-lg focus:ring-1 focus:ring-[#00A4DC] focus:outline-none"
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

  ${() => state.error}

</div>
`

const viewImportReportForViewing = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center">
    <p class="">Have an existing Jellyfin Rewind report?</p>
    <p class="">You can import it to take another look!</p>
  </div>

  <div class="w-full flex flex-col items-center text-center mt-12">
    ${() =>
      html`
        <label for="import-file" class="${() => `px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto ${state.importingExistingReport ? `saturation-50` : ``}`}">Import Report</label>
        <input type="file" id="import-file" class="hidden" accept=".json" @change="${async (e) => {
          console.info(`Importing file...`)
          const input = e.target
          try {
            state.importingExistingReport = true
            input.disabled = true
            state.rewindReport = await importRewindReport(e.target.files[0])
            console.log(`state.rewindReport:`, state.rewindReport)
            state.currentView = `launchExistingReport`
            // state.currentView = `load`
            // const featureDelta = await getFeatureDelta(oldReport, state.rewindReport)
            // console.log(`featureDelta:`, featureDelta)
          } catch (err) {
            console.error(`Error while importing rewind report:`, err)
          }
          input.disabled = false
          state.importingExistingReport = false
        }}">

        ${() => state.importingExistingReport ? html`
          <p class="mt-8 px-10 text-xl text-balance font-semibold text-gray-600 dark:text-gray-300">Importing, please wait a few seconds...</p>
        ` : html`
          <button
            class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-700 dark:text-gray-200 mt-8 flex flex-row gap-4 items-center mx-auto hover:text-white"
            @click="${() => state.currentView = `start`}"
          >
            <span>Connect to a server instead</span>
          </button>
        `
        }
      `
    }
  </div>

</div>
`

const viewLaunchExistingReport = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center">
    <p class="">Your Rewind Report has been imported and is ready to view!</p>
  </div>

  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] disabled:bg-[#00A4DC]/30 text-white font-semibold mt-12 flex flex-row gap-4 items-center mx-auto"
    @click="${() => launchRewind()}"
    disabled="${() => !state.rewindReport || state.rewindGenerating}"
  >
    <span>${() => state.rewindGenerating ? `Generating...` : `Launch Rewind!`}</span>
    ${() => !state.rewindGenerating ? html`
      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2] icon icon-tabler icon-tabler-rocket" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path>
        <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path>
        <circle cx="15" cy="9" r="1"></circle>
      </svg>
    ` : null}
  </button>

</div>
`

const viewImportLastYearsReport = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center">
    <p class="">Awesome, you're logged in!</p>
    <p class="">You can now import last year's Jellyfin Rewind report, if you have one.</p>
    <p class="">This will give you more, and more reliable, statistics about your listening activity.</p>
  </div>

  <div class="w-full flex flex-col items-center text-center mt-12">
    ${() =>
      !state.oldReport ? html`
        <label for="import-file" class="${() => `px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto ${state.importingLastYearsReport ? `saturation-50` : ``}`}">Import Last Year's Report</label>
        <input type="file" id="import-file" class="hidden" accept=".json" @change="${async (e) => {
          console.info(`Importing file...`)
          const input = e.target
          try {
            state.importingLastYearsReport = true
            input.disabled = true
            state.oldReport = await importRewindReport(e.target.files[0])
            console.log(`state.oldReport:`, state.oldReport)
            state.currentView = `load`
            // const featureDelta = await getFeatureDelta(oldReport, state.rewindReport)
            // console.log(`featureDelta:`, featureDelta)
          } catch (err) {
            console.error(`Error while importing rewind report:`, err)
          }
          input.disabled = false
          state.importingLastYearsReport = false
        }}">

        ${() => state.importingLastYearsReport ? html`
          <p class="mt-8 px-10 text-xl text-balance font-semibold text-gray-600 dark:text-gray-300">Importing, please wait a few seconds...</p>
        ` : html`
          <button
            class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-700 dark:text-gray-200 mt-8 flex flex-row gap-4 items-center mx-auto hover:text-white"
            @click="${() => state.currentView = `load`}"
          >
            <span>Continue without last year's report</span>
          </button>
        `
        }
      ` : html`
        <button
          class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto"
          @click="${() => state.currentView = `load`}"
        >
          <span>Generate Rewind Report!</span>
          <!-- <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2] icon icon-tabler icon-tabler-rocket" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path>
            <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path>
            <circle cx="15" cy="9" r="1"></circle>
          </svg> -->
        </button>
      `
    }
  </div>

  ${() => buttonLogOut}

</div>
`

const progressBar = html`
<div class="w-5/6 mx-auto mt-10 flex h-8 flex-row gap-4 justify-left">
  <img class="${() => `inline h-full ${state.progress < 1 ? `animate-spin` : ``}`}" src="/media/jellyfin-icon-transparent.svg" />
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
    state.rewindReport = await generateRewindReport({
      progressCallback: (progress) => {
        smoothSeek(state.progress, progress, 750)
        // state.progress = progress
      },
      oldReport: state.oldReport,
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

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center">
    <p class="">Your Rewind Report is now generating. This might take a few seconds.</p>
    <p class="">Please be patient, and if nothing happens for more than 30s, reach out to me via <a class="text-[#00A4DC] hover:text-[#0085B2]" href="https://github.com/Chaphasilor/jellyfin-rewind/issues" target="_blank">GitHub</a> so that I can look into it :)</p>
  </div>

  ${() => progressBar}
  
  ${() =>
    state.rewindReport ? html`
    <button
      class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] disabled:bg-[#00A4DC]/30 text-white font-semibold mt-12 flex flex-row gap-4 items-center mx-auto"
      @click="${() => launchRewind()}"
      disabled="${() => !state.rewindReport || state.rewindGenerating}"
    >
      <span>${() => state.rewindGenerating ? `Generating...` : `Launch Rewind!`}</span>
      ${() => !state.rewindGenerating ? html`
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 stroke-[2] icon icon-tabler icon-tabler-rocket" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"></path>
          <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path>
          <circle cx="15" cy="9" r="1"></circle>
        </svg>
      ` : null}
    </button>

    ` : html`<br>`
  }

  ${() => buttonLogOut}

</div>
`

const buttonLogOut = html`
<button
  class="px-4 py-2 rounded-xl border-2 border-red-400 hover:bg-red-500 dark:border-red-600 dark:hover:bg-red-700 font-medium mt-20 flex flex-row gap-3 items-center mx-auto text-red-500 hover:text-white"
  @click="${() => {
    state.auth.destroySession()
    deleteRewind()
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
`

const viewRevisit = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-full mx-auto text-balance text-center">
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
    class="px-4 py-2 rounded-xl border-2 border-orange-400 hover:bg-orange-500 dark:border-orange-500 dark:hover:bg-orange-600 text-orange-500 font-medium mt-12 flex flex-row gap-3 items-center mx-auto hover:text-white"
    @click="${() => {
      state.currentView = `importLastYearsReport` 
    }}"
  >
    <span>Regenerate Rewind</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 stroke-[2.5] icon icon-tabler icon-tabler-refresh" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
    </svg>
  </button>

  ${() => buttonLogOut}

</div>
`

const viewRewindGenerationError = html`
<div class="p-4">

  ${() => header}

  <div class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mt-10 w-5/6 mx-auto">
    <p class="">Sorry, we couldn't generate your Rewind Report.</p>
    <p class="">Please try again later.</p>
    <p class="">If you keep seeing this message, please reach out to me on <a class="text-[#00A4DC] hover:text-[#0085B2]" href="https://github.com/Chaphasilor/jellyfin-rewind/issues" target="_blank">GitHub</a> or <a class="text-[#00A4DC] hover:text-[#0085B2]" href="https://reddit.com/u/Chaphasilor" target="_blank">Reddit</a> so that I can try to resolve the issue!</p>
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
