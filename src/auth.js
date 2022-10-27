export default class Auth {

  constructor() {
    this.config = {
      baseUrl: ``,
      serverInfo: null,
      user: null,
      defaultHeaders: {},
    }
  }

  async connectToServer(serverUrl) {
    
    this.config.baseUrl = serverUrl;

    let data;

    try {

      const response = await fetch(`${this.config.baseUrl}/System/Info/Public`, {
        method: 'GET',
        headers: {...this.config.defaultHeaders},
      })

      data = await response.json()
      data.PublicAddress = serverUrl;
      this.setDefaultHeaders()
      
    } catch (err) {
      throw new Error(err);
    }

    const semverMajor = parseInt(data.Version?.split('.')[0]);
    const semverMinor = parseInt(data.Version?.split('.')[1]);
    const isServerVersionSupported =
      semverMajor > 10 || (semverMajor === 10 && semverMinor >= 7);

    if (isServerVersionSupported) {
      if (!data.StartupWizardCompleted) {
        throw new Error(`You need to complete the startup wizard before using Jellyfin Rewind`);
      } else {
        
        if (!this.config.serverInfo) {
          this.config.serverInfo = data;
        }

      }
    } else {
      throw new Error('Server version is too low');
    }
  }

  setDefaultHeaders(accessToken = ``) {

    if (!accessToken) {
      accessToken = this.config.user?.token || ``;
    }

    const deviceProfile = {
      clientName: `Jellyfin Rewind`,
      clientVersion: `0.1.0`,
      deviceName: `Chrome`,
      deviceId: `90a83627-401a-4f19-bf93-be8ccf521b27`,
    }

    const token = `MediaBrowser Client="${deviceProfile.clientName}", Device="${deviceProfile.deviceName}", DeviceId="${deviceProfile.deviceId}", Version="${deviceProfile.clientVersion}", Token="${accessToken}"`;

    this.config.defaultHeaders['X-Emby-Authorization'] = token;
  }

  async fetchUsers() {

    const response = await fetch(`${this.config.baseUrl}/Users/Public`, {
      method: 'GET',
      headers: {
        ...this.config.defaultHeaders,
        'Content-Type': `application/json`,
      },
    })

    const json = await response.json()
    return json

  }

  async authenticateUser(username, password) {

    console.log(`this.config.defaultHeaders:`, this.config.defaultHeaders)
    
    const response = await fetch(`${this.config.baseUrl}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        ...this.config.defaultHeaders,
        'Content-Type': `application/json`,
      },
      body: JSON.stringify({
        Username: username,
        Pw: password,
      }),
    })

    const json = await response.json()
    
    if (response.status !== 200) {
      throw new Error(`Authentication failed: ${response.json()}`);
    }
    
    this.config.user = {
      token: json.AccessToken,
      id: json.User.Id,
      primaryImageTag: json.User.PrimaryImageTag,
      sessionId: json.SessionInfo.Id,
    };

    this.setDefaultHeaders(this.config.user.token);

  }

  saveSession() {
    localStorage.setItem('session', JSON.stringify(this.config));
  }

  restoreSession() {
    const session = localStorage.getItem('session');
    if (session) {
      this.config = JSON.parse(session);
      this.setDefaultHeaders();
      return true;
    }
    return false
  }

  destroySession() {
    localStorage.removeItem('session');
    this.config = null;
  }

}
