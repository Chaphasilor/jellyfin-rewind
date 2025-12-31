<script lang="ts">
  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import Error from "$lib/components/Error.svelte";
  import {
    lightRewindReport,
    playbackReportingInspectionResult,
    processingResult,
  } from "$lib/globals";
  import jellyfin from "$lib/jellyfin";
  import processing from "$lib/jellyfin/queries/local/processing";
  import { PlaybackReportingIssueAction } from "$lib/types";
  import { processingResultToRewindReport } from "$lib/utility/convert";
  import { checkPlaybackReportingSetup } from "$lib/utility/jellyfin-helper";

  let serverUrl: string = "";
  let userName: string = "";
  let userPassword: string = "";

  async function proceed() {
    playbackReportingInspectionResult.set(
      await checkPlaybackReportingSetup(),
    );
    if (
      $playbackReportingInspectionResult.issue !==
        PlaybackReportingIssueAction.CONFIGURED_CORRECTLY
    ) {
      goto("/playbackReportingIssues");
    } else if ($playbackReportingInspectionResult.offlineImportAvailable) {
      goto("/importOfflinePlayback");
    } else {
      goto("/importLastYearsReport");
    }
  }

  // only when devin' attempt an auto login
  if (dev) {
    import("$env/static/public").then(async (i) => {
      serverUrl = i.PUBLIC_JELLYFIN_SERVER_URL;
      userName = i.PUBLIC_JELLYFIN_USERNAME;
      userPassword = i.PUBLIC_JELLYFIN_PASSWORD;
      if (!serverUrl || !userName || !userPassword) return;
      await pingServer();
      await authenticate();
      proceed();
    });
  }

  let error: string | undefined = $state(undefined);
  let serverValid: boolean = $state(false);
  let loginValid: boolean = $state(false);
  let connectingToServer = $state(false);
  let loggingIn = $state(false);

  async function pingServer() {
    connectingToServer = true;
    const ping = await jellyfin.connectToURL(serverUrl);
    serverValid = ping.success;
    connectingToServer = false;
    if (ping.success) {
      error = undefined;
    } else {
      error = ping.reason;
      throw ping.reason;
    }
  }

  async function authenticate() {
    loggingIn = true;
    await pingServer();
    if (error != undefined) return;
    const auth = await jellyfin.userLogin(userName, userPassword);
    loginValid = auth.success;
    loggingIn = false;
    if (auth.success) {
      error = undefined;
    } else {
      throw auth.reason;
    }
  }

  let lastKeyPress = 0;
  function handleServerInput() {
    lastKeyPress = Date.now();
    setTimeout(async () => {
      if (Date.now() - lastKeyPress > 1200) {
        await pingServer();
      }
    }, 2100);
  }

  function handleLoginInput() {
    if (!userName || !userPassword) return;
    lastKeyPress = Date.now();
    connectingToServer = true;
    // setTimeout(async () => {
    //   if (Date.now() - lastKeyPress > 900) {
    //     await authenticate();
    //     loading = false;
    //   }
    // }, 1000);
  }

  function tryLogIn() {
    authenticate().then(() => {
      proceed();
    });
  }
</script>

<h1>Login</h1>
<p>
  And here we go! As stated before all communication will only involve your
  browser and your jellyfin server. The Username/Password fields will unlock
  once the Server URL is identified as an jellyfin server.
</p>
<form class="form px-3" on:submit={tryLogIn}>
  <label class="relative flex flex-col" for="serverUrl">
    <small>Server URL</small>
    <input
      name="serverUrl"
      type="url"
      placeholder="https://demo.jellyfin.org"
      bind:value={serverUrl}
      on:keyup={handleServerInput}
    />
    <span class="absolute right-2 top-1/2 -translate-y-1/2 text-green-500">
      {#if serverValid}
        <svg
          class="text-green-500 icon icon-tabler icons-tabler-outline icon-tabler-check"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M5 12l5 5l10 -10"
          />
        </svg>
      {:else if serverUrl && serverUrl.length > 3 && !connectingToServer}
        <svg
          class="text-red-500 icon icon-tabler icons-tabler-outline icon-tabler-check"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M18 6l-12 12"
          />
          <path d="M6 6l12 12" />
        </svg>
      {/if}
    </span>
  </label>

  <label for="username" class="relative flex flex-col">
    <small>Username</small>
    <input name="username" bind:value={userName} on:keyup={handleLoginInput} />
  </label>

  <label for="password" class="relative flex flex-col">
    <small>Password</small>
    <input
      name="password"
      type="password"
      bind:value={userPassword}
      on:keyup={handleLoginInput}
    />
  </label>
</form>
<br />

{#if !serverValid || !loginValid || !userName || !userPassword}
  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto"
    on:click={tryLogIn}
  >
    <span>{loggingIn ? `Logging in...` : `Log In`}</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-7 h-7 stroke-[2.5] icon icon-tabler icon-tabler-arrow-big-right"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path
        d="M4 9h8v-3.586a1 1 0 0 1 1.707 -.707l6.586 6.586a1 1 0 0 1 0 1.414l-6.586 6.586a1 1 0 0 1 -1.707 -.707v-3.586h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1z"
      >
      </path>
    </svg>
  </button>
{:else}
  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto"
    on:click={() => proceed()}
  >
    Continue To Rewind
  </button>
{/if}

<Error {error} />

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
