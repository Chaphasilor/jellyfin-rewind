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
