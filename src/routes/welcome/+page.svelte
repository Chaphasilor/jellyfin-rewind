<script>
  import { goto } from "$app/navigation";
  import LogoutOrInIcon from "$lib/components/icons/LogoutOrInIcon.svelte";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import { playbackReportingInspectionResult, year } from "$lib/globals";
  import jellyfin from "$lib/jellyfin";
  import { PlaybackReportingIssueAction } from "$lib/types";
  import { checkPlaybackReportingSetup } from "$lib/utility/jellyfin-helper";
  import { onMount } from "svelte";

  let loggedIn = $state(false);

  onMount(async () => {
    await jellyfin.load();
    loggedIn = !!jellyfin.baseurl && !!jellyfin.user && !!jellyfin.userId;
  });
</script>

<div class="max-w-xl mx-auto p-6 text-center flex flex-col items-center gap-8">
  <JellyfinRewindLogo />

  <div class="flex flex-col items-center gap-2">
    <h1 class="text-4xl font-semibold">Welcome!</h1>
    <h2 class="text-2xl font-medium">
      to Jellyfin Rewind <span class="font-bold text-[#00A4DC]">{year}</span>!
    </h2>
  </div>
  <p class="mb-8">
    Just follow the guide to log into your server, but don't worry all the
    communication stays between your server and your browser.<br />
    <br />
    If you are paranoid (as you generally should be), feel free to monitor the
    network traffic in the devtools or even checkout the
    <a
      class="text-[#00A4DC] underline hover:text-[#0085B2]"
      href="https://github.com/Chaphasilor/jellyfin-rewind/issues"
      target="_blank"
      on:click|stopPropagation={() => {}}
    >code on GitHub</a>!
  </p>

  {#if loggedIn}
    <p class="mb-4">
      You are currently logged in to<br />
      <strong class="font-mono">{jellyfin.baseurl}</strong><br />as<br />
      <strong>{jellyfin.targetUser?.name ?? jellyfin.user?.name}</strong>.
    </p>
    <!-- svelte-ignore event_directive_deprecated -->
    <button
      class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto"
      on:click={async () => {
        if (!jellyfin.user?.isAdmin) {
          goto("/adminLogin");
          return;
        }

        playbackReportingInspectionResult.set(
          await checkPlaybackReportingSetup(),
        );
        if (
          $playbackReportingInspectionResult.issue !==
            PlaybackReportingIssueAction.CONFIGURED_CORRECTLY
        ) {
          goto("/playbackReportingIssues");
        } else if (
          $playbackReportingInspectionResult.offlineImportAvailable
        ) {
          goto("/importOfflinePlayback");
        } else {
          goto("/importLastYearsReport");
        }
      }}
    >
      Continue as {jellyfin.targetUser?.name ?? jellyfin.user?.name}
    </button>

    <!-- svelte-ignore event_directive_deprecated -->
    <button
      class="px-4 py-2 rounded-xl border-2 border-red-400 hover:bg-red-500 dark:border-red-600 dark:hover:bg-red-700 font-medium mt-12 flex flex-row gap-3 items-center mx-auto text-red-500 hover:text-white"
      on:click={async () => {
        await jellyfin.terminateSession();
        loggedIn = false;
        //TODO await deleteRewind()
      }}
    >
      <span>Log out</span>
      <LogoutOrInIcon />
    </button>
  {:else}
    <button
      class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold flex flex-row gap-4 items-center mx-auto"
      on:click={() => goto("/login")}
    >
      Proceed to Login
    </button>
  {/if}
</div>
