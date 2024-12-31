import { decode as decodeBlurhash } from 'blurhash';

export default class JellyHelper {

  constructor(auth) {
    this.auth = auth;
  }
  
  loadImage(elements, imageInfo, type = `track`, isDarkMode = false) {

    if (!Array.isArray(elements)) {
      elements = [elements];
    }

    elements = elements.filter(element => !!element)
    
    const blurhash = imageInfo?.blurhash
    const primaryTag = imageInfo?.primaryTag
    const parentItemId = imageInfo?.parentItemId
    const resolution = 256
  
    if (blurhash) {
      const dataUri = blurhashToDataURI(blurhash)
      elements.forEach(element => {
        element.src = dataUri
      })
    } else {
      console.warn(`No blurhash found for item`)
      elements.forEach(element => {
        switch (type) {
          case `track`:
            element.src = `/media/TrackPlaceholder${isDarkMode ? `-dark` : ``}.png`
            break;
          case `artist`:
            element.src = `/media/ArtistPlaceholder${isDarkMode ? `-dark` : ``}.png`
            break;
          case `album`:
            element.src = `/media/AlbumPlaceholder${isDarkMode ? `-dark` : ``}.png`
          break;
        
          default:
            break;
        }
      })
    }
  
    if (primaryTag && (parentItemId || type === `user`)) {
      let url = `${this.auth.config.serverInfo.PublicAddress}/Items/${parentItemId}/Images/Primary?tag=${primaryTag}&MaxWidth=${resolution}&MaxHeight=${resolution}`
      if (type === `user`) {
        url = `${this.auth.config.serverInfo.PublicAddress}/Users/${parentItemId}/Images/Primary?tag=${primaryTag}&MaxWidth=${resolution}&MaxHeight=${resolution}`
      }
      fetch(url, {
        method: `GET`,
        headers: {
          ...this.auth.config.defaultHeaders,
        },
      })
      .then(response => {
        if (response.ok) {
          const contentType = response.headers.get(`content-type`)
          if (contentType && contentType.includes(`image`)) {
            return response.blob()
          }
        }
      })
      .then(blob => {
        if (blob) {
          const objectUrl = URL.createObjectURL(blob)
          elements.forEach(element => {
            element.src = objectUrl
          })
        }
      })
    } else {
      console.warn(`No primary image found for item`)
      elements.forEach(element => {
        switch (type) {
          case `track`:
            element.src = `/media/TrackPlaceholder${isDarkMode ? `-dark` : ``}.png`
            break;
          case `artist`:
            element.src = `/media/ArtistPlaceholder${isDarkMode ? `-dark` : ``}.png`
            break;
          case `album`:
            element.src = `/media/AlbumPlaceholder${isDarkMode ? `-dark` : ``}.png`
          break;
          case `user`:
            element.src = `/media/ArtistPlaceholder${isDarkMode ? `-dark` : ``}.png`
          break;
        
          default:
            break;
        }
      })
    }
    
  }

  async loadAudio(element, audioInfo) {

    // check if audio element is already loaded/playing
    if (element.src) {
      element.pause()
      element.removeAttribute(`src`)
    }

    const params = {
      'UserId': this.auth.config.user.id,
      'DeviceId': this.auth.config.user.deviceId,
      'api_key': this.auth.config.user.token,
      'Container': `opus,webm|opus,mp3,aac,m4a|aac,m4b|aac,flac,webma,webm|webma,wav,ogg`, // limit to mp3 for best support
      'TranscodingContainer': `ts`,
      'TranscodingProtocol': `hls`,
      'AudioCodec': `aac`,
      'EnableRedirection': `true`,
      'EnableRemoteMedia': `true`,
    }

    element.src = `${this.auth.config.serverInfo.PublicAddress}/Audio/${audioInfo.id}/universal?${Object.entries(params).map(([key, value]) => `${key}=${value}`).join(`&`)}`
    await element.load()
  }

  // a "group" is something that doesn't reference a specific track, e.g. an album, artist, playlist, genre, etc.
  loadTracksForGroup(groupId, groupType) {

    let url = ``
    
    switch (groupType) {
      case `artist`:
        url = `${this.auth.config.serverInfo.PublicAddress}/Users/${this.auth.config.user.id}/Items?ArtistIds=${groupId}&Filters=IsNotFolder&Recursive=true&SortBy=PlayCount&MediaTypes=Audio&Limit=20&Fields=Chapters&ExcludeLocationTypes=Virtual&EnableTotalRecordCount=false&CollapseBoxSetItems=false`
        break;
      case `album`:
        url = `${this.auth.config.serverInfo.PublicAddress}/Users/${this.auth.config.user.id}/Items?ParentId=${groupId}&Filters=IsNotFolder&Recursive=true&SortBy=PlayCount&MediaTypes=Audio&Limit=20&Fields=Chapters&ExcludeLocationTypes=Virtual&EnableTotalRecordCount=false&CollapseBoxSetItems=false`
        break;
      case `genre`:
        url = `${this.auth.config.serverInfo.PublicAddress}/Users/${this.auth.config.user.id}/Items?GenreIds=${groupId}&Filters=IsNotFolder&Recursive=true&SortBy=PlayCount&MediaTypes=Audio&Limit=20&Fields=Chapters&ExcludeLocationTypes=Virtual&EnableTotalRecordCount=false&CollapseBoxSetItems=false`
        break;
      case `playlist`:
        url = `${this.auth.config.serverInfo.PublicAddress}/Users/${this.auth.config.user.id}/Items?ParentId=${groupId}&Filters=IsNotFolder&Recursive=true&SortBy=PlayCount&MediaTypes=Audio&Limit=20&Fields=Chapters&ExcludeLocationTypes=Virtual&EnableTotalRecordCount=false&CollapseBoxSetItems=false`
        break;
    
      default:
        break;
    }
    return fetch(url, {
      method: `GET`,
      headers: {
        ...this.auth.config.defaultHeaders,
      },
    })
    .then(response => {
      if (response.ok) {
        return response.json()
      }
    })
    .then(json => {
      return json.Items
    })
  }

  async checkIfPlaybackReportingInstalled() {

    const pluginsResponse = await fetch(`${this.auth.config.serverInfo.PublicAddress}/Plugins`, {
      method: `GET`,
      headers: {
        ...this.auth.config.defaultHeaders,
      },
    })
    const pluginsJson = await pluginsResponse.json()

    const playbackReportingPluginInstallation = pluginsJson.find(plugin => plugin.Name === `Playback Reporting`)
    if (!playbackReportingPluginInstallation) {
      return {
        installed: false,
        restartRequired: false,
        disabled: false,
      }
    }

    if (playbackReportingPluginInstallation.Status === `Restart`) {
      return {
        installed: true,
        version: playbackReportingPluginInstallation.Version,
        id: playbackReportingPluginInstallation.Id,
        restartRequired: true,
        disabled: false,
      }
    }

    if (playbackReportingPluginInstallation.Status === `Disabled`) {
      return {
        installed: true,
        version: playbackReportingPluginInstallation.Version,
        id: playbackReportingPluginInstallation.Id,
        restartRequired: false,
        disabled: true,
      }
    }

    const playbackReportingSettingsResponse = await fetch(`${this.auth.config.serverInfo.PublicAddress}/System/Configuration/playback_reporting`, {
      method: `GET`,
      headers: {
        ...this.auth.config.defaultHeaders,
      },
    })
    const playbackReportingSettingsJson = await playbackReportingSettingsResponse.json()

    let playbackReportingIgnoredUsersJson = []
    try {
      const playbackReportingIgnoredUsersResponse = await fetch(`${this.auth.config.serverInfo.PublicAddress}/user_usage_stats/user_list`, {
        method: `GET`,
        headers: {
          ...this.auth.config.defaultHeaders,
        },
      })
      playbackReportingIgnoredUsersJson = await playbackReportingIgnoredUsersResponse.json()
    } catch (err) {
      console.warn(`Couldn't fetch playback reporting ignored users:`, err)
    }

    return {
      installed: true,
      version: playbackReportingPluginInstallation.Version,
      id: playbackReportingPluginInstallation.Id,
      restartRequired: false,
      disabled: false,
      settings: {
        raw: playbackReportingSettingsJson,
        retentionInterval: Number(playbackReportingSettingsJson.MaxDataAge),
      },
      ignoredUsers: playbackReportingIgnoredUsersJson.filter(user => user.in_list).map(user => ({ id: user.id, name: user.name })),
    }
    
  }

  // requires administrator account
  async installPlaybackReportingPlugin() {

    const response = await fetch(`${this.auth.config.serverInfo.PublicAddress}/Packages/Installed/Playback%20Reporting?AssemblyGuid=5c53438191a343cb907a35aa02eb9d2c`, {
      method: `POST`,
      headers: {
        ...this.auth.config.defaultHeaders,
      },
    })

    if (response.status === 204) {
      return true
    } else {
      throw new Error(`Couldn't install Playback Reporting plugin!`, await response.text())
    }
    
  }

  // requires administrator account
  async enablePlaybackReportingPlugin(setup) {

    const response = await fetch(`${this.auth.config.serverInfo.PublicAddress}/Plugins/${setup.id}/${setup.version}/Enable`, {
      method: `POST`,
      headers: {
        ...this.auth.config.defaultHeaders,
      },
    })

    if (response.status === 204) {
      return true
    } else {
      throw new Error(`Couldn't enable Playback Reporting plugin!`, await response.text())
    }
    
  }

  // requires administrator account
  async updatePlaybackReportingSettings(settings) {

    const response = await fetch(`${this.auth.config.serverInfo.PublicAddress}/System/Configuration/playback_reporting`, {
      method: `POST`,
      headers: {
        ...this.auth.config.defaultHeaders,
        'Content-Type': `application/json`,
      },
      body: JSON.stringify(settings),
    })
    return response.status === 204
  }

  // requires admin permissions
  async fetchDevices() {
    const response = await fetch(`${this.auth.config.serverInfo.PublicAddress}/Devices`, {
      method: `GET`,
      headers: {
        ...this.auth.config.defaultHeaders,
        'Content-Type': `application/json`,
      },
    })
    return await response.json()
  }

  // requires admin permissions
  async shutdownServer() {
      
    const response = await fetch(`${this.auth.config.serverInfo.PublicAddress}/System/Shutdown`, {
      method: `POST`,
      headers: {
        ...this.auth.config.defaultHeaders,
      },
    })
    return response.ok
  }

  // requires admin permissions
  async restartServer() {
      
    const response = await fetch(`${this.auth.config.serverInfo.PublicAddress}/System/Restart`, {
      method: `POST`,
      headers: {
        ...this.auth.config.defaultHeaders,
      },
    })
    return response.ok
  }

}

function blurhashToDataURI(blurhash) {
  const pixels = decodeBlurhash(blurhash, 256, 256)
  const ctx = document.createElement(`canvas`).getContext(`2d`)
  const imageData = ctx.createImageData(256, 256)
  imageData.data.set(pixels)
  ctx.putImageData(imageData, 0, 0)
  return ctx.canvas.toDataURL()
}
