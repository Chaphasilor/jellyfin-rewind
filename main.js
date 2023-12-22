import './style.css'

import { reactive, watch, html, } from '@arrow-js/core'

import * as jellyfinRewind from './src/rewind.js'
import JellyHelper from './src/jelly-helper.js'

import * as Onboarding from './src/onboarding.js'
import * as Features from './src/features.js'

document.querySelector('#app').innerHTML = `
`
// {/* <div>
//   <a href="https://vitejs.dev" target="_blank">
//     <img src="/vite.svg" class="logo" alt="Vite logo" />
//   </a>
//   <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//     <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//   </a>
//   <h1>Hello Vite!</h1>
//   <div class="card">
//     <button id="counter" type="button"></button>
//   </div>
//   <p class="read-the-docs">
//     Click on the Vite logo to learn more
//   </p>
// </div> */}

let userInfo = null;
let helper = null;

const connectToServerButton = document.querySelector(`#connectToServer`)
const serverUrl = document.querySelector(`#serverUrl`)
const serverConfig = document.querySelector(`#server-config`)
const userSelect = document.querySelector(`#user-select`)
const userLogin = document.querySelector(`#user-login`)
const usernameInput = document.querySelector(`#username-input`)
const authTokenInput = document.querySelector(`#auth-token-input`)
const passwordInput = document.querySelector(`#password-input`)
const username = document.querySelector(`#username`)
const password = document.querySelector(`#password`)
const authToken = document.querySelector(`#auth-token`)
const authenticateUser = document.querySelector(`#authenticateUser`)
const showReport = document.querySelector(`#show-report`)
const generateReport = document.querySelector(`#generate-report`)
const loadingSpinner = document.querySelector(`#loading-spinner`)
const output = document.querySelector(`#output`)
const loggedInInfo = document.querySelector(`#logged-in-info`)
const logOutButton = document.querySelector(`#log-out`)
const loggedInUserInfo = document.querySelector(`#logged-in-user`)
const loggedInServerInfo = document.querySelector(`#logged-in-server`)
const infoOutput = document.querySelector(`#info`)

let selectedUsername = ``
let featuresInitialized = false
let staleReport = false

window.onload = async () => {

  window.jellyfinRewind = jellyfinRewind
  
  console.log(`target year:`, import.meta.env.VITE_TARGET_YEAR)
  console.log(`commit hash:`, __COMMITHASH__)

  if (jellyfinRewind.auth.restoreSession()) {
    console.info(`Session restored!`)
    enableLogout()
    serverConfig.classList.add(`hidden`)
    init()
  }

  helper = new JellyHelper(jellyfinRewind.auth)
  window.helper = helper

  await Onboarding.init(jellyfinRewind.auth)
  Onboarding.render()
  
}

function enableLogout() {
  loggedInInfo.classList.remove(`hidden`)
  logOutButton.addEventListener(`click`, () => {
    jellyfinRewind.auth.destroySession()
    window.location.reload()
  })

  loggedInUserInfo.innerText = jellyfinRewind.auth.config.user.name
  loggedInServerInfo.innerText = jellyfinRewind.auth.config.serverInfo.ServerName
}

connectToServerButton.addEventListener(`click`, connectToServer)
serverUrl.addEventListener(`keydown`, (event) => {
  if (event.key === `Enter`) {
    connectToServer()
  }
})

async function connectToServer() {
  try {
    await jellyfinRewind.auth.connectToServer(serverUrl.value)
    userInfo = await jellyfinRewind.auth.fetchUsers()
    console.info(`Connected to server!`)
    console.info(`Users:`, userInfo)
    serverConfig.classList.add(`hidden`)
    showUsers()
  } catch (err) {
    console.error(`Error while connecting to the server:`, err)
    infoOutput.innerText = `Error while connecting to the server. Make sure your using the same protocol (https or http) as your server is using. Make sure you're not using a local IP address or mDNS hostname. For example, you could use your server's Tailscale IP address, if you use Tailscale as your VPN.`
  }
}

function showUsers() {

  userSelect.classList.remove(`hidden`)

  html`
    ${() => userInfo.map(user => html`
      <li>
        <button
          class="rounded-xl p-2 w-full flex flex-row items-center justify-start gap-4 bg-white dark:bg-[#00A4DC] cursor-pointer focus:bg-[#0085B2] hover:bg-[#0085B2]"
          data-user-id=${user.Id}
          @click="${() => {
            selectedUsername = user.Name
            console.info(`User selected:`, user)
            password.removeEventListener(`keydown`, login(user.Id))
            password.addEventListener(`keydown`, login(user.Id))
            authenticateUser.removeEventListener(`click`, login(user.Id))
            authenticateUser.addEventListener(`click`, login(user.Id))
            userLogin.classList.remove(`hidden`)
            passwordInput.classList.remove(`hidden`)
            userSelect.classList.add(`hidden`)
          }}"
        >
          <img class="w-12 h-12 rounded-md" src="${() => user.PrimaryImageTag ? `${jellyfinRewind.auth.config.baseUrl}/Users/${user.Id}/Images/Primary?tag=${user.PrimaryImageTag}` : `/media/ArtistPlaceholder.png`}" />
          <span class="text-lg">${user.Name}</span>
        </button>
      </li>
      `)}

    <li>
      <button
        class="rounded-xl p-2 w-full flex flex-row items-center justify-center gap-4 bg-white dark:bg-[#00A4DC] cursor-pointer focus:bg-[#0085B2] hover:bg-[#0085B2]"
        @click="${() => {
          userLogin.classList.remove(`hidden`)
          usernameInput.classList.remove(`hidden`)
          passwordInput.classList.remove(`hidden`)
          userSelect.classList.add(`hidden`)
          username.addEventListener(`keyup`, () => {
            if (username.value.length > 0) {
              authenticateUser.classList.remove(`hidden`)
              selectedUsername = username.value
            } else {
              authenticateUser.classList.add(`hidden`)
            }
          })
          password.removeEventListener(`keydown`, login(``))
          password.addEventListener(`keydown`, login(``))
          authenticateUser.removeEventListener(`click`, login(``))
          authenticateUser.addEventListener(`click`, login(``))
        }}"
        >
        <span class="italic">Manually enter username</span>
      </button>
    </li>

    <li>
      <button
        class="rounded-xl p-2 w-full flex flex-row items-center justify-center gap-4 bg-white dark:bg-[#00A4DC] cursor-pointer focus:bg-[#0085B2] hover:bg-[#0085B2]"
        @click="${() => {
          userLogin.classList.remove(`hidden`)
          authTokenInput.classList.remove(`hidden`)
          userSelect.classList.add(`hidden`)
          authToken.removeEventListener(`keydown`, loginWithAuthToken())
          authToken.addEventListener(`keydown`, loginWithAuthToken())
          authenticateUser.removeEventListener(`click`, loginWithAuthToken())
          authenticateUser.addEventListener(`click`, loginWithAuthToken())
        }}"
        >
        <span class="italic">Log in via auth token</span>
      </button>
    </li>
  `(userSelect)
  
  // manualUser.addEventListener(`click`, () => {
  //   userLogin.classList.remove(`hidden`)
  //   usernameInput.classList.remove(`hidden`)
  //   userSelect.classList.add(`hidden`)
  //   username.addEventListener(`keyup`, () => {
  //     selectedUsername = username.value
  //   })
  //   authenticateUser.removeEventListener(`click`, login(``))
  //   authenticateUser.addEventListener(`click`, login(``))
  //   password.removeEventListener(`keydown`, login(``))
  //   password.addEventListener(`keydown`, login(``))
  // })
  
  // userInfo.forEach(user => {
  //   const li = document.createElement(`li`)
  //   const button = document.createElement(`button`)
  //   button.textContent = user.Name
  //   button.setAttribute(`data-user-id`, user.Id)
  //   button.classList.add(`rounded-md`, `p-2`, `cursor-pointer`, `focus:bg-blue-200`, `hover:bg-blue-200`)
  //   button.addEventListener(`click`, () => {
  //     userLogin.classList.remove(`hidden`)
  //     selectedUsername = user.Name
  //     console.info(`User selected:`, user)
  //     userSelect.classList.add(`hidden`)
  //     authenticateUser.removeEventListener(`click`, login(user.Id))
  //     authenticateUser.addEventListener(`click`, login(user.Id))
  //     password.removeEventListener(`keydown`, login(user.Id))
  //     password.addEventListener(`keydown`, login(user.Id))
  //   })
  //   li.appendChild(button)
  //   userSelect.appendChild(li)
  // })
}

const login = (userId) => async (event) => {

  if (event.type !== `click` && event.key !== `Enter`) {
    return
  } 
  
  try {

    await jellyfinRewind.auth.authenticateUser(selectedUsername, password.value)
    console.info(`Successfully logged in as ${selectedUsername}`)
    jellyfinRewind.auth.saveSession()
    enableLogout()

    userLogin.classList.add(`hidden`)
    init()
    
  } catch (err) {
    console.error(`Error while logging in:`, err)
  }
}

const loginWithAuthToken = () => async (event) => {

  if (event.type !== `click` && event.key !== `Enter`) {
    return
  } 
  
  try {

    await jellyfinRewind.auth.authenticateUserViaToken(authToken.value)
    console.info(`Successfully logged in as ${jellyfinRewind.auth.config.name}`)
    jellyfinRewind.auth.saveSession()
    enableLogout()

    userLogin.classList.add(`hidden`)
    init()
    
  } catch (err) {
    console.error(`Error while logging in:`, err)
  }
}

function init() {
  showReport.addEventListener(`click`, async () => {
    let rewindReportData = null
    try {
      loadingSpinner.classList.remove(`hidden`)
      rewindReportData = {
        jellyfinRewindReport: jellyfinRewind.restoreRewindReport()
      }

      if (rewindReportData.jellyfinRewindReport.commit !== __COMMITHASH__) {
        staleReport = true
      }
      // check if the report is for the previous year and it's after February
      if (rewindReportData.jellyfinRewindReport.year !== new Date().getFullYear() && new Date().getMonth() > 1) {
        staleReport = true
      }
      
      loadingSpinner.classList.add(`hidden`)
    } catch (err) {
      console.warn(`Couldn't restore Rewind report:`, err)
      console.info(`Generating new report...`)
      rewindReportData = await generateRewindReport()
    }

    if (staleReport) {
      infoOutput.innerText = `The stored rewind report is stale. Please re-generate it for the best experience.`
    }

    // showRewindReport(rewindReport)
    initializeFeatureStory(rewindReportData)

  })
  generateReport.addEventListener(`click`, async () => {
    console.info(`Generating new report...`)
    featuresInitialized = false // reset features
    let rewindReportData = await generateRewindReport()

    // showRewindReport(rewindReport)
    initializeFeatureStory(rewindReportData)

  })
  generateReport.classList.remove(`hidden`)
  showReport.classList.remove(`hidden`)
}

async function generateRewindReport() {

  let reportData
  try {
    
    loadingSpinner.classList.remove(`hidden`)
    reportData = await jellyfinRewind.generateRewindReport({
      year: Number(import.meta.env.VITE_TARGET_YEAR)
    })
    console.info(`Report generated successfully!`)
    loadingSpinner.classList.add(`hidden`)
    
  } catch (err) {
    console.error(`Error while generating the report:`, err)
  }
  
  try {
    jellyfinRewind.saveRewindReport()
    console.info(`Report saved successfully!`)
  } catch (err) {
    console.error(`Couldn't save Rewind report:`, err)
  }
  
  return reportData    

}

function testShowRewindReport(report) {

  output.value = JSON.stringify(report, null, 2)

  const topSongByDuration = report.jellyfinRewindReport.tracks?.[`topTracksByPlayCount`]?.[0]

  if (topSongByDuration) {
    document.querySelector('#app').innerHTML += `
      <div class="m-4 text-gray-800">
        <h3 class="text-xl">Your Top Song of the Year</h3>
        <div class="flex mt-4 flex-col">
          <img id="test-image" class="w-64 h-auto rounded-md" />
          <span class="font-semibold mt-2">${topSongByDuration?.name}</span>
          <span class="italic pl-3 mt-1">by ${topSongByDuration.artistsBaseInfo.reduce((acc, cur, index) => index > 0 ? `${acc} & ${cur.name}` : cur.name, ``)}</span>
        </div>
      </div>
    `
    const testImage = document.querySelector(`#test-image`)
    helper.loadImage(testImage, topSongByDuration.image)
  }
  
}

function initializeFeatureStory(report) {

  Features.openFeatures()
  
  Features.init(report, helper, jellyfinRewind.auth)
  if (!featuresInitialized) {
    Features.render()
    featuresInitialized = true
  }

}

function downloadRewindReportData(reportData, skipVerification) {
  if (reportData.rawData || skipVerification || confirm(`The report you're about to download is incomplete and missing some data. Please re-generate and download the report without reloading the page in-between. Do you want to download the incomplete report anyway?`)) {
    const reportDataString = JSON.stringify(reportData, null, 2)
    const blob = new Blob([reportDataString], {type: `application/json`})
    const url = URL.createObjectURL(blob)
    const a = document.createElement(`a`)
    a.href = url
    a.download = `jellyfin-rewind-report-${reportData.jellyfinRewindReport.year}_for-${jellyfinRewind.auth.config.user.name}-at-${jellyfinRewind.auth.config.serverInfo.name}_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

}
window.downloadRewindReportData = downloadRewindReportData
