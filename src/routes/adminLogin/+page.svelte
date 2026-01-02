<script lang="ts">
  import { dev } from "$app/environment";
  import { goto } from "$app/navigation";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import {
    playbackReportingInspectionResult,
    processingResult,
    rewindReport,
  } from "$lib/globals";
  import jellyfin from "$lib/jellyfin";
  import processing from "$lib/jellyfin/queries/local/processing";
  import { PlaybackReportingIssueAction } from "$lib/types";
  import { processingResultToRewindReport } from "$lib/utility/convert";
  import { checkPlaybackReportingSetup } from "$lib/utility/jellyfin-helper";
  import { onMount } from "svelte";

  let serverUrl: string = $state("");
  let adminUserName: string = $state("");
  let adminUserPassword: string = $state("");
  let connectionHelpOpen = $state(false);

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

  //TODO offer logging into an admin account to get playback reporting data somehow?
  // maybe with a token, second login, or just by prompting the user during login?
  // but then again, it should be possible for people to use a regular account for listening, log in with that account, and still get the playback reporting data. so a secondary admin login is needed for that

  // only when devin' attempt an auto login
  if (dev) {
    import("$env/static/public").then(async (i) => {
      serverUrl = i.PUBLIC_JELLYFIN_SERVER_URL;
      adminUserName = i.PUBLIC_JELLYFIN_ADMIN_USERNAME;
      adminUserPassword = i.PUBLIC_JELLYFIN_ADMIN_PASSWORD;
      if (!serverUrl || !adminUserName || !adminUserPassword) return;
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
    const auth = await jellyfin.adminUserLogin(
      adminUserName,
      adminUserPassword,
    );
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
    if (!adminUserName || !adminUserPassword) return;
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

  onMount(async () => {
    await jellyfin.load();
    if (jellyfin.baseurl) {
      serverUrl = jellyfin.baseurl;
      serverValid = true;
    }
  });
</script>

<div class="max-w-xl mx-auto p-6 text-center flex flex-col items-center gap-2">
  <JellyfinRewindLogo />

  <h1 class="mt-8 text-3xl font-semibold">Admin Login</h1>
  <div
    class="mt-6 flex flex-col gap-6 text-lg font-medium leading-6 text-gray-500 dark:text-gray-400 mb-4 max-w-lg w-full mx-auto text-balance text-center px-2"
  >
    <p class="">
      You didn't log in with an administrator account. Using a <b
        class="font-quicksand-bold"
      >non</b>-admin account is indeed the recommended way for listening to
      music on Jellyfin, <b class="font-quicksand-bold">but</b> without
      administrator access, Jellyfin Rewind can't read data from the Playback
      Reporting plugin.
    </p>
    <p class="text-sm">
      You can skip this step if you're not comfortable logging in with an admin
      account or don't have the credentials, but keep in mind that this will
      reduce the quality and accuracy of your Jellyfin Rewind Report!
    </p>
  </div>
  <form class="form px-3" on:submit={tryLogIn}>
    <label for="username" class="relative flex flex-col">
      <small>Admin Username</small>
      <input
        name="username"
        bind:value={adminUserName}
        on:keyup={handleLoginInput}
      />
    </label>

    <label for="password" class="relative flex flex-col">
      <small>Admin Password</small>
      <input
        name="password"
        type="password"
        bind:value={adminUserPassword}
        on:keyup={handleLoginInput}
        on:keydown={(e) => {
          if (e.key === "Enter") {
            tryLogIn();
          }
        }}
      />
    </label>
  </form>

  {#if error}
    <div class="warning mb-4">
      <div
        class="flex flex-col items-start gap-1 text-base font-medium leading-6 text-red-100 w-5/6 mx-auto"
      >
        <p class="">There was an error while connecting to the server.</p>
        <p class="font-mono mx-auto">{error.toString()}</p>
        <!-- svelte-ignore event_directive_deprecated -->
        <button
          class="self-center mt-2 text-[#00A4DC] font-semibold px-3 py-1 rounded-md bg-orange-500 text-white"
          on:click={() => (connectionHelpOpen = true)}
        >
          Help me!?
        </button>
      </div>
    </div>
  {/if}

  {#if !serverValid || !loginValid || !adminUserName || !adminUserPassword}
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

  <button
    class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-200 mt-8 flex flex-row gap-4 items-center mx-auto hover:text-white"
    on:click={() => proceed()}
  >
    <span>Continue without administrator access<br />(not recommended)</span>
  </button>

  <Modal bind:open={connectionHelpOpen}>
    <div
      class="relative w-full flex flex-row justify-center items-center px-2 pt-4 pb-2"
    >
      <h3 class="text-center text-lg font-quicksand font-medium text-[#00A4DC]">
        How to Connect?
      </h3>
      <!-- svelte-ignore event_directive_deprecated -->
    </div>
    <div class="w-full h-full overflow-x-auto p-4">
      <div class="flex flex-col items-start gap-2">
        <p>
          Because Jellyfin Rewind is web-based and (for now at least) not
          available as a plugin, it might be a bit tricky to get your browser to
          communicate with your Jellyfin server. The problem is that browsers
          won't allow "insecure" requests (HTTP) from a "secure" website
          (HTTP<span
            class="font-semibold"
          >S</span>), or requests from a non-private context (website not within
          your network) to a private context (Jellyfin server accessed over a
          local IP address within your network).
        </p>
        {#if window.location.protocol === `https:`}
          <p>
            Make sure that your Jellyfin server is accessible via <b>HTTPS</b>.
            If your server is only available via regular HTTP, try going to
            <a
              class="text-[#00A4DC]"
              href="http://jellyfin-rewind-http.chaphasilor.xyz"
            >http://jellyfin-rewind-http.chaphasilor.xyz</a>
          </p>
        {/if}
        <p>
          So make sure you're not using a local IP address (starts with <span
            class="font-mono"
          >192.168.</span>) or mDNS hostname (something like
          <span class="font-mono">jellyfin.local</span>). If you use something
          like Tailscale as your VPN, you could use your server's Tailscale IP
          address.
        </p>
        <p>
          Therefore, <span class="font-semibold"
          >if you're unsure what your Jellyfin server is using, but your
            Jellyfin server is accessible over the internet, simply use the
            first link</span> (http)!
        </p>
        <p>
          If your server <span class="font-semibold">is NOT</span>
          accessible over the internet, you could self-host the Jellyfin Rewind
          website on your local network, for example on the same server that is
          running Jellyfin. For that, check out the
          <a
            class="text-[#00A4DC]"
            href="https://github.com/Chaphasilor/jellyfin-rewind/releases"
            target="_blank"
          >GitHub releases page</a> and either download the zip-archive or use
          the provided Docker image. The zip-archive will need to be extracted
          into a folder that is served by a web server, like Apache or Nginx.
          The Docker image will need a to have port 80 exposed instead.
        </p>
      </div>
    </div>
  </Modal>
</div>

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
</style>
