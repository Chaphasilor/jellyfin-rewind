import * as Features from './features.js'

export async function connectToServer(auth, serverUrl) {
  let userInfo
  try {
    await auth.connectToServer(serverUrl)
    userInfo = await auth.fetchUsers()
    console.info(`Connected to server!`)
    console.info(`Users:`, userInfo)
  } catch (err) {
    console.error(`Error while connecting to the server:`, err)
    throw new Error(`Error while connecting to the server. Make sure your using the same protocol (https or http) as your server is using. Make sure you're not using a local IP address or mDNS hostname. For example, you could use your server's Tailscale IP address, if you use Tailscale as your VPN.`)
  }
  return userInfo
}

export async function loginViaPassword(auth, username, password) {

  await auth.authenticateUser(username, password)
  console.info(`Successfully logged in as ${username}`)
  auth.saveSession()

  return auth.config.user
  
}

export async function loginViaAuthToken(auth, authToken) {

  await auth.authenticateUserViaToken(authToken)
  console.info(`Successfully logged in as ${auth.config.name}`)
  auth.saveSession()

  return auth.config.user
  
}

export function initializeFeatureStory(report, featuresInitialized) {

  Features.openFeatures()
  
  Features.init(report, window.helper, window.jellyfinRewind.auth)
  if (!featuresInitialized) {
    Features.render()
  }

}
window.initializeFeatureStory = initializeFeatureStory

export async function restoreAndPrepareRewind() {

  let rewindReportData = null
  let staleReport = false
  try {
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
    
  } catch (err) {
    console.warn(`Couldn't restore Rewind report:`, err)
    throw new Error(`Couldn't restore Rewind report.`)
  }
  
  if (staleReport) {
    return `The stored rewind report is stale. Please re-generate it for the best experience.`
  }
  
  return {
    rewindReportData,
    staleReport
  }
}

export async function generateRewindReport() {

  let reportData
  try {
    
    reportData = await window.jellyfinRewind.generateRewindReport(Number(import.meta.env.VITE_TARGET_YEAR))
    console.info(`Report generated successfully!`)
    
  } catch (err) {
    throw new Error(`Error while generating the report:`, err)
  }
  
  try {
    window.jellyfinRewind.saveRewindReport()
    console.info(`Report saved successfully!`)
  } catch (err) {
    console.error(`Couldn't save Rewind report:`, err)
  }
  
  return reportData    

}
window.generateRewindReport = generateRewindReport
