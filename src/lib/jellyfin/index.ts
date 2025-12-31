import { endSql, startSql, year } from "$lib/globals.ts";
import type {
  JellyfinResponse_SystemInfoPublic,
  JellyfinResponse_UsersAuthenticateByName,
  JellyfinResponse_UsersMe,
  Result,
  User,
} from "$lib/types.ts";
import { logAndReturn } from "$lib/utility/logging.ts";
import { stringToUrl } from "$lib/utility/other.ts";

class Jellyfin {
  token?: string;
  baseurl?: string;
  user?: User;
  header?: string;

  constructor() {
    // this.load();
  }

  async connectToURL(url: string): Promise<Result<undefined>> {
    const url_ = stringToUrl(url);
    if (!url_.success) return url_; // invalid URL

    this.baseurl = url_.data!.origin;

    const ping = await this.pingServer();
    if (!ping.success) return ping; // invalid Server

    if (!this.isServerSupported(ping.data)) {
      return logAndReturn("connectToUrl", {
        success: false,
        reason: "The server does meat the version requirements",
      });
    }

    if (!ping.data.StartupWizardCompleted) {
      return logAndReturn("connectToUrl", {
        success: false,
        reason:
          "The servers setup appears to be not completed yet. Please Complete the Startup Wizard",
      });
    }

    this.updateHeader();

    return logAndReturn("connectToUrl", { success: true });
  }

  async getData(route: string): Promise<Result<object>> {
    if (!this.baseurl) {
      return {
        success: false,
        reason: "No URL given.",
      };
    }

    return logAndReturn(
      "getData",
      (await fetch(`${this.baseurl}/${route}`, {
        headers: {
          Authorization: this.header ?? "",
        },
      })
        .then(async (response) => {
          if (response.status != 200) {
            return {
              success: false,
              reason:
                `Server didnt respond with code 200 but instead with ${response.status}: ${response.statusText}`,
            };
          }
          return {
            success: true,
            data: await response.json(),
          };
        })
        .catch((err) => ({
          success: false,
          reason: err,
        }))) as Result<Response>,
    );
  }

  async fetchData(route: string, data: object): Promise<Result<any>> {
    if (!this.baseurl) {
      return {
        success: false,
        reason: "No URL given.",
      };
    }

    return logAndReturn(
      "fetchData",
      (await fetch(`${this.baseurl}/${route}`, {
        method: "POST",
        headers: {
          Authorization: this.header ?? "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(async (response) => {
          if (response.status == 401) {
            return {
              success: false,
              reason:
                "Authentication Failed. Token expired? You might need to login again.",
            };
          }
          if (response.status != 200) {
            return {
              success: false,
              reason:
                `Server didnt respond with code 200 but instead with ${response.status}: ${response.statusText}`,
            };
          }
          return {
            success: true,
            data: await response.json(),
          };
        })
        .catch((err) => ({
          success: false,
          reason: err,
        }))) as Result<any>,
    );
  }

  async pingServer(): Promise<Result<JellyfinResponse_SystemInfoPublic>> {
    const data = await this.getData("System/Info/Public");
    if (!data.success) return data;

    // be really sure its a Jellyfin server
    const localAddress = Object.hasOwn(data.data, "LocalAddress");
    const startup = Object.hasOwn(data.data, "StartupWizardCompleted");
    const isJellyfin = localAddress && startup;
    if (!isJellyfin) {
      return logAndReturn("pingServer", {
        success: false,
        reason:
          "Could not determine with confidence that the given url leads to a jellyfin endpoint",
      });
    }

    return logAndReturn("pingServer", {
      success: true,
      data: data.data as JellyfinResponse_SystemInfoPublic,
    });
  }

  private isServerSupported(json: JellyfinResponse_SystemInfoPublic) {
    const [majorV, minorV, _] = json.Version.split(".").map(Number);
    return logAndReturn(
      "isServerSupported",
      majorV > 10 || (majorV == 10 && minorV >= 7),
    );
  }

  get deviceProfile() {
    return {
      clientName: `Jellyfin Rewind`,
      clientVersion: `0.${year}.0`,
      deviceName: `Chrome`,
      deviceId: `90a83627-401a-4f19-bf93-be8ccf521b27`,
    };
  }

  private updateHeader(token: string = this.token || "") {
    this.header = "MediaBrowser ";
    this.header += `Client="${this.deviceProfile.clientName}", `;
    this.header += `Device="${this.deviceProfile.deviceName}", `;
    this.header += `DeviceId="${this.deviceProfile.deviceId}", `;
    this.header += `Version="${this.deviceProfile.clientVersion}", `;
    this.header += `Token="${token}", `;
    logAndReturn("updateHeader", this.header);
  }

  async userLogin(Username: string, Pw: string): Promise<Result<undefined>> {
    const auth = (await this.fetchData("Users/AuthenticateByName", {
      Username,
      Pw,
    })) as Result<JellyfinResponse_UsersAuthenticateByName>;

    if (!auth.success) {
      return logAndReturn("userLogin", auth);
    }

    this.token = auth.data.AccessToken;
    this.user = {
      id: auth.data.User.Id,
      name: auth.data.User.Name,
      isAdmin: auth.data.User.Policy.IsAdministrator,
      PrimaryImageTag: auth.data.User.PrimaryImageTag,
    };

    this.updateHeader();
    this.saveToLocalStorage();

    return logAndReturn("userLogin", { success: true });
  }

  async tokenLogin(token: string): Promise<Result<undefined>> {
    const tmpToken = this.token;
    this.token = token; // temporary change token
    this.updateHeader(); // and thus update the header

    const auth = (await this.getData(
      "Users/Me",
    )) as Result<JellyfinResponse_UsersMe>;

    if (!auth.success) {
      this.token = tmpToken; // revert token
      this.updateHeader(); // and header
      return logAndReturn("tokenLogin", auth);
    }

    this.user = {
      id: auth.data.Id,
      name: auth.data.Name,
      isAdmin: auth.data.Policy.IsAdministrator,
      PrimaryImageTag: auth.data.PrimaryImageTag,
    };

    this.updateHeader();
    this.saveToLocalStorage();

    return logAndReturn("tokenLogin", { success: true });
  }

  private saveToLocalStorage(): Result<undefined> {
    if (!this.token) {
      return logAndReturn("save", {
        success: false,
        reason: "Storing a session without a token is unnecessary",
      });
    }
    localStorage.setItem(
      "session",
      JSON.stringify({
        token: this.token,
        url: this.baseurl,
      }),
    );
    return logAndReturn("save", { success: true });
  }

  async load() {
    const storedData = localStorage.getItem("session");
    if (storedData == null) {
      return logAndReturn("load", {
        success: false,
        reason: "No session stored",
      });
    }
    const { token, url } = JSON.parse(storedData);
    const connection = await this.connectToURL(url);
    if (!connection.success) {
      return logAndReturn("load", connection);
    }
    return logAndReturn("load", await this.tokenLogin(token));
  }

  terminateSession() {
    delete this.token;
    delete this.baseurl;
    delete this.user;
    delete this.header;
    localStorage.removeItem("session");
    logAndReturn("terminate", "jellyfin object reset");
  }

  async queryPlaybackReporting<
    O extends {
      conditions: string[];
      groupBy: string | false;
      orderBy: string | false;
      ascending: boolean;
      limit: number | false;
      toInt: string[];
      toDate: string[];
    },
  >(options?: Partial<O>): Promise<Result<object[]>> {
    const headers = [
      "rowid",
      "ItemId",
      "ItemName",
      "DateCreated",
      "PlayDuration",
      "DeviceName",
      "ClientName",
      "PlaybackMethod",
    ];

    // have default values and overwrite them
    const modifiers = Object.assign(
      {
        conditions: [],
        groupBy: false,
        orderBy: false,
        ascending: false,
        limit: false,
        toInt: ["PlayDuration"],
        toDate: ["DateCreated"],
      },
      options,
    ) as unknown as O;

    // always limit to Date, User and Audio
    modifiers.conditions.push(
      `DateCreated >= '${startSql}'`,
      `DateCreated <= '${endSql}'`,
      `UserId = '${this.user?.id}'`,
      `ItemType='Audio'`,
      // `PlayDuration > 0`, actually, we want to be able to tell how many tracks were completely skipped, including within one second
    );

    // make sql query
    let query = `SELECT ${headers.join(", ")} FROM PlaybackActivity`;
    query += ` WHERE ${modifiers.conditions.join(" AND ")}`;
    query += modifiers.groupBy ? ` GROUP BY ${modifiers.groupBy}` : "";
    query += modifiers.orderBy ? ` ORDER BY ${modifiers.orderBy}` : "";
    query += modifiers.orderBy ? modifiers.ascending ? " ASC" : " DESC" : "";
    query += modifiers.limit ? ` LIMIT ${modifiers.limit}` : "";

    logAndReturn("query Playback Reporting", query);

    const path = `user_usage_stats/submit_custom_query?stamp=${Date.now()}`;
    const body = { CustomQueryString: query };
    const resultData = (await this.fetchData(path, body)) as Result<{
      colums: string[]; //!!! the plugin returns the data with a typo
      results: string[];
      message: "";
    }>;

    if (!resultData.success) {
      return logAndReturn("query Playback Reporting", resultData);
    }

    const data = resultData.data;
    // message usually mean an error has occurred
    if (data.message != "") {
      return logAndReturn("query Playback Reporting", {
        success: false,
        reason: data.message,
      });
    }

    const { colums: columns, results } = data;

    const mapped = results.map((row) => {
      const item = {};
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];

        const cell = row[i];
        const value = modifiers.toInt.includes(column)
          ? Number(cell)
          : modifiers.toDate.includes(column)
          ? new Date(cell.replace(" ", "T") + "Z") //!!! the plugin doesn't return proper ISO strings, so JavaScript assumes local time when parsing
          : cell;
        // @ts-ignore
        item[column] = value;
      }
      return item;
    });

    return logAndReturn("query Playback Reporting", {
      success: true,
      data: mapped,
    });
  }
}

export default new Jellyfin();
