import { decode as decodeBlurhash } from "blurhash";
import jellyfin from "../jellyfin/index.ts";
import { checkIfOfflinePlaybackImportAvailable } from "./offlineImport.ts";
import {
  PlaybackReportingIssueAction,
  type PlaybackReportingSetupCheckResult,
} from "../types.ts";

export function loadImage(
  elements: any[],
  imageInfo: { blurhash: any; primaryTag: any; parentItemId: any },
  type = `track`,
  isDarkMode = true,
) {
  if (!Array.isArray(elements)) {
    elements = [elements];
  }

  elements = elements.filter((element: any) => !!element);

  const blurhash = imageInfo?.blurhash;
  const primaryTag = imageInfo?.primaryTag;
  const parentItemId = imageInfo?.parentItemId;
  const resolution = 256;

  if (blurhash) {
    const dataUri = blurhashToDataURI(blurhash);
    elements.forEach((element: { src: string }) => {
      element.src = dataUri;
    });
  } else {
    console.warn(`No blurhash found for item`);
    elements.forEach((element: { src: string }) => {
      switch (type) {
        case `track`:
          element.src = `/media/TrackPlaceholder${
            isDarkMode ? `-dark` : ``
          }.png`;
          break;
        case `artist`:
          element.src = `/media/ArtistPlaceholder${
            isDarkMode ? `-dark` : ``
          }.png`;
          break;
        case `album`:
          element.src = `/media/AlbumPlaceholder${
            isDarkMode ? `-dark` : ``
          }.png`;
          break;

        default:
          break;
      }
    });
  }

  if (parentItemId || type === `user`) {
    let url =
      `${jellyfin.baseurl}/Items/${parentItemId}/Images/Primary?MaxWidth=${resolution}&MaxHeight=${resolution}`;

    if (type === `user`) {
      url =
        `${jellyfin.baseurl}/Users/${parentItemId}/Images/Primary?MaxWidth=${resolution}&MaxHeight=${resolution}`;
    }

    if (primaryTag) {
      url += `&tag=${primaryTag}`;
    }

    fetch(url, {
      method: `GET`,
      headers: {
        Authorization: jellyfin.header ?? "",
      },
    })
      .then((response) => {
        if (response.ok) {
          const contentType = response.headers.get(`content-type`);
          if (contentType && contentType.includes(`image`)) {
            return response.blob();
          }
        }
      })
      .then((blob) => {
        if (blob) {
          const objectUrl = URL.createObjectURL(blob);
          elements.forEach((element: { src: string }) => {
            element.src = objectUrl;
          });
        }
      });
  } else {
    console.warn(`No primary image found for item`);
    elements.forEach((element: { src: string }) => {
      switch (type) {
        case `track`:
          element.src = `/media/TrackPlaceholder${
            isDarkMode ? `-dark` : ``
          }.png`;
          break;
        case `artist`:
          element.src = `/media/ArtistPlaceholder${
            isDarkMode ? `-dark` : ``
          }.png`;
          break;
        case `album`:
          element.src = `/media/AlbumPlaceholder${
            isDarkMode ? `-dark` : ``
          }.png`;
          break;
        case `user`:
          element.src = `/media/ArtistPlaceholder${
            isDarkMode ? `-dark` : ``
          }.png`;
          break;

        default:
          break;
      }
    });
  }
}

export async function loadAudio(
  element: {
    src: string;
    pause: () => void;
    removeAttribute: (arg0: string) => void;
    load: () => any;
  },
  audioInfo: { id: any },
) {
  // check if audio element is already loaded/playing
  if (element.src) {
    element.pause();
    element.removeAttribute(`src`);
  }

  const params = {
    "UserId": jellyfin.user?.id,
    "DeviceId": jellyfin.deviceProfile.deviceId,
    "api_key": jellyfin.token,
    "Container":
      `opus,webm|opus,mp3,aac,m4a|aac,m4b|aac,flac,webma,webm|webma,wav,ogg`, // limit to mp3 for best support
    "TranscodingContainer": `ts`,
    "TranscodingProtocol": `hls`,
    "AudioCodec": `aac`,
    "EnableRedirection": `true`,
    "EnableRemoteMedia": `true`,
  };

  element.src = `${jellyfin.baseurl}/Audio/${audioInfo.id}/universal?${
    Object.entries(params).map(([key, value]) => `${key}=${value}`).join(
      `&`,
    )
  }`;
  await element.load();
}

// a "group" is something that doesn't reference a specific track, e.g. an album, artist, playlist, genre, etc.
export function loadTracksForGroup(
  groupId: string,
  groupType: `artist` | `album` | `genre` | `playlist`,
) {
  let url = ``;

  switch (groupType) {
    case `artist`:
      url =
        `${jellyfin.baseurl}/Users/${jellyfin.user?.id}/Items?ArtistIds=${groupId}&Filters=IsNotFolder&Recursive=true&SortBy=PlayCount&MediaTypes=Audio&Limit=20&Fields=Chapters&ExcludeLocationTypes=Virtual&EnableTotalRecordCount=false&CollapseBoxSetItems=false`;
      break;
    case `album`:
      url =
        `${jellyfin.baseurl}/Users/${jellyfin.user?.id}/Items?ParentId=${groupId}&Filters=IsNotFolder&Recursive=true&SortBy=PlayCount&MediaTypes=Audio&Limit=20&Fields=Chapters&ExcludeLocationTypes=Virtual&EnableTotalRecordCount=false&CollapseBoxSetItems=false`;
      break;
    case `genre`:
      url =
        `${jellyfin.baseurl}/Users/${jellyfin.user?.id}/Items?GenreIds=${groupId}&Filters=IsNotFolder&Recursive=true&SortBy=PlayCount&MediaTypes=Audio&Limit=20&Fields=Chapters&ExcludeLocationTypes=Virtual&EnableTotalRecordCount=false&CollapseBoxSetItems=false`;
      break;
    case `playlist`:
      url =
        `${jellyfin.baseurl}/Users/${jellyfin.user?.id}/Items?ParentId=${groupId}&Filters=IsNotFolder&Recursive=true&SortBy=PlayCount&MediaTypes=Audio&Limit=20&Fields=Chapters&ExcludeLocationTypes=Virtual&EnableTotalRecordCount=false&CollapseBoxSetItems=false`;
      break;

    default:
      break;
  }
  return fetch(url, {
    method: `GET`,
    headers: {
      Authorization: jellyfin.header ?? "",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((json) => {
      return json.Items;
    });
}

export async function checkIfPlaybackReportingInstalled(): Promise<
  PlaybackReportingSetupCheckResult["setup"]
> {
  const pluginsResponse = await fetch(
    `${jellyfin.baseurl}/Plugins`,
    {
      method: `GET`,
      headers: {
        Authorization: jellyfin.header ?? "",
      },
    },
  );
  const pluginsJson = await pluginsResponse.json();

  const playbackReportingPluginInstallation = pluginsJson.find((
    plugin: { Name: string },
  ) => plugin.Name === `Playback Reporting`);
  if (!playbackReportingPluginInstallation) {
    return {
      installed: false,
      restartRequired: false,
      disabled: false,
    };
  }

  if (playbackReportingPluginInstallation.Status === `Restart`) {
    return {
      installed: true,
      version: playbackReportingPluginInstallation.Version,
      id: playbackReportingPluginInstallation.Id,
      restartRequired: true,
      disabled: false,
    };
  }

  if (playbackReportingPluginInstallation.Status === `Disabled`) {
    return {
      installed: true,
      version: playbackReportingPluginInstallation.Version,
      id: playbackReportingPluginInstallation.Id,
      restartRequired: false,
      disabled: true,
    };
  }

  const playbackReportingSettingsResponse = await fetch(
    `${jellyfin.baseurl}/System/Configuration/playback_reporting`,
    {
      method: `GET`,
      headers: {
        Authorization: jellyfin.header ?? "",
      },
    },
  );
  const playbackReportingSettingsJson = await playbackReportingSettingsResponse
    .json();

  let playbackReportingIgnoredUsersJson = [];
  try {
    const playbackReportingIgnoredUsersResponse = await fetch(
      `${jellyfin.baseurl}/user_usage_stats/user_list`,
      {
        method: `GET`,
        headers: {
          Authorization: jellyfin.header ?? "",
        },
      },
    );
    playbackReportingIgnoredUsersJson =
      await playbackReportingIgnoredUsersResponse.json();
  } catch (err) {
    console.warn(`Couldn't fetch playback reporting ignored users:`, err);
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
    ignoredUsers: playbackReportingIgnoredUsersJson.filter((
      user: { in_list: any },
    ) => user.in_list).map((user: { id: any; name: any }) => ({
      id: user.id,
      name: user.name,
    })),
  };
}

// requires administrator account
export async function installPlaybackReportingPlugin() {
  const response = await fetch(
    `${jellyfin.baseurl}/Packages/Installed/Playback%20Reporting?AssemblyGuid=5c53438191a343cb907a35aa02eb9d2c`,
    {
      method: `POST`,
      headers: {
        Authorization: jellyfin.header ?? "",
      },
    },
  );

  if (response.status === 204) {
    return true;
  } else {
    throw new Error(
      `Couldn't install Playback Reporting plugin! ${await response.text()}`,
    );
  }
}

// requires administrator account
export async function enablePlaybackReportingPlugin(
  setup: PlaybackReportingSetupCheckResult["setup"],
) {
  // TODO change these fallback values to the ones for Jellyfin 10.11
  const response = await fetch(
    `${jellyfin.baseurl}/Plugins/${
      setup?.id ?? `5c53438191a343cb907a35aa02eb9d2c`
    }/${setup?.version ?? 16}/Enable`,
    {
      method: `POST`,
      headers: {
        Authorization: jellyfin.header ?? "",
      },
    },
  );

  if (response.status === 204) {
    return true;
  } else {
    throw new Error(
      `Couldn't enable Playback Reporting plugin! ${await response.text()}`,
    );
  }
}

// requires administrator account
export async function updatePlaybackReportingSettings(settings: any) {
  const response = await fetch(
    `${jellyfin.baseurl}/System/Configuration/playback_reporting`,
    {
      method: `POST`,
      headers: {
        Authorization: jellyfin.header ?? "",
        "Content-Type": `application/json`,
      },
      body: JSON.stringify(settings),
    },
  );
  return response.status === 204;
}

// requires admin permissions
export async function fetchDevices() {
  const response = await fetch(
    `${jellyfin.baseurl}/Devices`,
    {
      method: `GET`,
      headers: {
        Authorization: jellyfin.header ?? "",
        "Content-Type": `application/json`,
      },
    },
  );
  return await response.json();
}

// requires admin permissions
export async function shutdownServer() {
  const response = await fetch(
    `${jellyfin.baseurl}/System/Shutdown`,
    {
      method: `POST`,
      headers: {
        Authorization: jellyfin.header ?? "",
      },
    },
  );
  return response.ok;
}

// requires admin permissions
export async function restartServer() {
  const response = await fetch(
    `${jellyfin.baseurl}/System/Restart`,
    {
      method: `POST`,
      headers: {
        Authorization: jellyfin.header ?? "",
      },
    },
  );
  return response.ok;
}

export function blurhashToDataURI(blurhash: string) {
  const pixels = decodeBlurhash(blurhash, 256, 256);
  const ctx = document.createElement(`canvas`).getContext(`2d`);
  if (!ctx) {
    console.error(`Couldn't create canvas context for blurhash decoding`);
    return ``;
  }
  const imageData = ctx.createImageData(256, 256);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
  return ctx.canvas.toDataURL();
}

function inspectPlaybackReportingSetup(
  playbackReportingSetup: PlaybackReportingSetupCheckResult["setup"],
): PlaybackReportingIssueAction {
  if (!playbackReportingSetup?.installed) {
    return PlaybackReportingIssueAction.INSTALL_PLUGIN;
  } else if (playbackReportingSetup.restartRequired) {
    return PlaybackReportingIssueAction.RESTART_SERVER;
  } else if (playbackReportingSetup.disabled) {
    return PlaybackReportingIssueAction.ENABLE_PLUGIN;
  } else if (
    playbackReportingSetup.version &&
    (playbackReportingSetup?.version ?? 0) < 16
  ) {
    return PlaybackReportingIssueAction.UPDATE_PLUGIN;
  } else if (
    Number(playbackReportingSetup.settings?.retentionInterval) !== -1 &&
    Number(playbackReportingSetup.settings?.retentionInterval) < 24
  ) {
    return PlaybackReportingIssueAction.RETENTION_SHORT;
  } else if (
    playbackReportingSetup.ignoredUsers?.some((user: { id: string }) =>
      user.id === jellyfin.user?.id
    )
  ) {
    return PlaybackReportingIssueAction.USER_IGNORED;
  }

  return PlaybackReportingIssueAction.CONFIGURED_CORRECTLY;

  // return inspection;
}

export async function checkPlaybackReportingSetup(
  previousResult?: PlaybackReportingSetupCheckResult,
) {
  let result: PlaybackReportingSetupCheckResult = {
    checked: false,
    issue: PlaybackReportingIssueAction.CONFIGURED_CORRECTLY,
    setup: undefined,
    checkAttempts: previousResult?.checkAttempts ?? 0,
  };
  if (jellyfin.user?.isAdmin) {
    // check if eligible for offline playback import
    // not strictly related to playback reporting, but whatever
    if (
      await checkIfOfflinePlaybackImportAvailable()
    ) {
      result.offlineImportAvailable = true;
    } else {
      result.offlineImportAvailable = false;
    }

    try {
      const playbackReportingSetup = await checkIfPlaybackReportingInstalled();
      result.setup = playbackReportingSetup;
      console.log(`playbackReportingSetup:`, playbackReportingSetup);

      const playbackReportingIssue = inspectPlaybackReportingSetup(
        playbackReportingSetup,
        // nextScreen,
      );
      console.log(`inspection:`, playbackReportingIssue);

      // state.waitingForRestart = false;

      result.issue = playbackReportingIssue;
    } catch (err) {
      console.error(
        `Failed to check the playback reporting setup, continuing without it: ${err?.toString()}`,
      );
      result.checkAttempts++;
      if (result.checkAttempts > 5) {
        return result;
      } else {
        result = await new Promise((resolve) => {
          setTimeout(
            async () => resolve(await checkPlaybackReportingSetup(result)),
            5000,
          );
        });
      }
    }
  } else {
    result.issue = PlaybackReportingIssueAction.CONFIGURED_CORRECTLY;
  }
  return result;
}
