<script lang="ts">
  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import Error from "$lib/components/Error.svelte";
  import { processingResult } from "$lib/globals";
  import jellyfin from "$lib/jellyfin";
  import processing from "$lib/jellyfin/queries/local/processing";

  let serverUrl: string = "";
  let userName: string = "";
  let userPassword: string = "";

  function proceedToLoading() {
    processing()
      .then((result) => {
        if (result.success) {
          processingResult.set(result.data);
          goto("/rewind");
        }
      });
    goto("/loading");
  }

  // only when devin' attempt an auto login
  if (dev) {
    import("$env/static/public").then(async (i) => {
      serverUrl = i.PUBLIC_JELLYFIN_SERVER_URL;
      userName = i.PUBLIC_JELLYFIN_USERNAME;
      userPassword = i.PUBLIC_JELLYFIN_PASSWORD;
      await pingServer();
      await authenticate();
      proceedToLoading();
    });
  }

  let error: string | undefined = undefined;
  let serverValid: boolean = false;
  let loginValid: boolean = false;
  let loading = false;
  let hasStored = localStorage.getItem("session") != null;

  async function pingServer() {
    const ping = await jellyfin.connectToURL(serverUrl);
    serverValid = ping.success;
    if (ping.success) error = undefined;
    else error = ping.reason;
  }

  async function authenticate() {
    const auth = await jellyfin.userLogin(userName, userPassword);
    loginValid = auth.success;
    if (auth.success) error = undefined;
    else error = auth.reason;
  }

  let lastKeyPress = 0;
  function handleServerInput() {
    lastKeyPress = Date.now();
    loading = true;
    setTimeout(async () => {
      if (Date.now() - lastKeyPress > 900) {
        await pingServer();
        loading = false;
      }
    }, 1000);
  }

  function handleLoginInput() {
    if (!userName || !userPassword) return;
    lastKeyPress = Date.now();
    loading = true;
    setTimeout(async () => {
      if (Date.now() - lastKeyPress > 900) {
        await authenticate();
        loading = false;
      }
    }, 1000);
  }
</script>

<Error {error} />
<h1>Login</h1>
<p>
  And here we go! As stated before all communication will only involve your
  browser and your jellyfin server. The Username/Password fields will unlock
  once the Server URL is identified as an jellyfin server.
</p>
<div class="form">
  <small>Server url {loading ? "..." : ""}</small>
  <input
    type="url"
    placeholder="https://demo.jellyfin.org"
    bind:value={serverUrl}
    on:keyup={handleServerInput}
  />

  <small>Username {loading ? "..." : ""}</small>
  <input
    disabled={!serverValid || loading}
    bind:value={userName}
    on:keyup={handleLoginInput}
  />

  <small>Password {loading ? "..." : ""}</small>
  <input
    type="password"
    disabled={!serverValid || loading}
    bind:value={userPassword}
    on:keyup={handleLoginInput}
  />
</div>
<br />
{#if hasStored}
  <div class="info">
    <h3>Session found</h3>
    Hey, your browser has a session stored!<br />
    Do you want to try to login using this stored session?
    <div class="split">
      <button
        on:click={() => {
          jellyfin.terminateSession();
          hasStored = false;
        }}
      >
        Delete Session
      </button>

      <button
        on:click={async () => {
          loading = true;
          const auth = await jellyfin.load();
          loading = false;
          hasStored = false;

          loginValid = auth.success;
          if (auth.success) {
            error = undefined;
            proceedToLoading();
            return;
          }
          jellyfin.terminateSession();
          error = auth.reason;
        }}
      >
        Try Session
      </button>
    </div>
  </div>
  <br />
{/if}

<button
  disabled={!serverValid || !loginValid || !userName || !userPassword}
  on:click={() => proceedToLoading}
>
  Continue To Rewind
</button>

<style lang="scss">
  .form {
    display: flex;
    flex-direction: column;
    column-gap: 2rem;
    text-align: left;
    width: 100%;
    max-width: 400px;
    margin: auto;
    input {
      margin-bottom: 1rem;
    }
  }
  p {
    margin: 2rem;
  }
</style>
