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

let featuresInitialized = false

window.onload = async () => {

  let config = {
    targetRange: {
      start: `${import.meta.env.VITE_TARGET_YEAR}-01-01`,
      end: `${import.meta.env.VITE_TARGET_YEAR}-12-31`
    },
    server: {
      url: ``,
      apiKey: null,
    }
  }
  try {
    config = await (await fetch(`/config.json`)).json()
  } catch (err) {
    console.warn(`Couldn't fetch config:`, err);
  }
  console.log(`config:`, config)

  window.jellyfinRewind = jellyfinRewind
  
  // console.log(`target year:`, import.meta.env.VITE_TARGET_YEAR)
  console.log(`commit hash:`, __COMMITHASH__)

  jellyfinRewind.auth.config.baseUrl = config?.server?.url ?? ``

  if (jellyfinRewind.auth.restoreSession()) {
    console.info(`Session restored!`)
  }

  helper = new JellyHelper(jellyfinRewind.auth)
  window.helper = helper

  await Onboarding.init(jellyfinRewind.auth)
  Onboarding.render()
  
}

function downloadRewindReportData(reportData, skipVerification) {
  if (reportData.rawData || skipVerification || confirm(`The report you're about to download is incomplete and missing some data. Please re-generate and download the report without reloading the page in-between. Do you want to download the incomplete report anyway?`)) {
    const reportDataString = JSON.stringify(reportData, null, 2)
    const blob = new Blob([reportDataString], {type: `application/json`})
    const url = URL.createObjectURL(blob)
    const a = document.createElement(`a`)
    console.log(`jellyfinRewind.auth.config:`, jellyfinRewind.auth.config)
    a.href = url
    a.download = `jellyfin-rewind-report-${reportData.jellyfinRewindReport.year}_for-${jellyfinRewind.auth.config.user.name}-at-${jellyfinRewind.auth.config.serverInfo.ServerName}_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

}
window.downloadRewindReportData = downloadRewindReportData
