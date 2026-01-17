<script lang="ts">
  import { goto } from "$app/navigation";
  import Header from "$lib/components/Header.svelte";
  import CloseIcon from "$lib/components/icons/CloseIcon.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { playbackReportingInspectionResult, year } from "$lib/globals";
  import jellyfin from "$lib/jellyfin";
  import { PlaybackReportingIssueAction } from "$lib/types";
  import {
    checkPlaybackReportingSetup,
    enablePlaybackReportingPlugin,
    installPlaybackReportingPlugin,
    restartServer,
    updatePlaybackReportingSettings,
  } from "$lib/utility/jellyfin-helper";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  let playbackReportingDialogOpen = writable(false);
  let waitingForRestart = $state(false);

  const issueDescription = $derived.by(() => {
    let description: string;
    switch ($playbackReportingInspectionResult?.issue) {
      case PlaybackReportingIssueAction.CONFIGURED_CORRECTLY:
        description =
          `Your Playback Reporting setup looks good! No issues were detected.`;
        break;
      case PlaybackReportingIssueAction.INSTALL_PLUGIN:
        description = `The Playback Reporting plugin is not installed.`;
        break;
      case PlaybackReportingIssueAction.ENABLE_PLUGIN:
        description =
          `The Playback Reporting plugin is installed, but disabled.`;
        break;
      case PlaybackReportingIssueAction.RESTART_SERVER:
        description =
          `The Playback Reporting plugin is installed, but the Jellyfin server needs to be restarted in order to activate it.`;
        break;
      case PlaybackReportingIssueAction.UPDATE_PLUGIN:
        description =
          `The Playback Reporting plugin is installed and active, but there is a newer version available. Please update the plugin to the latest version to make sure everything is working correctly.`;
        break;
      case PlaybackReportingIssueAction.RETENTION_SHORT:
        description =
          `The Playback Reporting plugin is installed, but the retention interval is short (${$playbackReportingInspectionResult.setup?.settings?.retentionInterval} months).`;
        break;
      case PlaybackReportingIssueAction.USER_IGNORED:
        description =
          `The Playback Reporting plugin is installed and active, but your user account is ignored. Please remove your user from the list of ignored users so that listening activity is recorded for your account.`;
        break;
      case undefined:
        description =
          `An unknown error occurred while checking the Playback Reporting setup.`;
        break;
    }
    return description;
  });

  function checkIfCanContinue() {
    if (
      $playbackReportingInspectionResult.issue ===
        PlaybackReportingIssueAction.CONFIGURED_CORRECTLY
    ) {
      goto("/importLastYearsReport");
    }
  }

  onMount(async () => {
    // update the inspection result in case of page refresh
    playbackReportingInspectionResult.set(
      await checkPlaybackReportingSetup(),
    );
    waitingForRestart = false;
    checkIfCanContinue();
  });
</script>

<div class="p-4">
  <Header />

  <div
    class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-400 mt-10 w-full mx-auto text-balance text-center"
  >
    <p class="">
      It seems like the Playback Reporting plugin isn't set up correctly.
    </p>
    <p class="">The following problem was detected:</p>
  </div>

  <div
    class="w-full px-6 flex flex-col gap-3 items-center text-center mt-10 text-gray-300 text-balance text-center"
  >
    <p class="w-full text-lg text-balance font-semibold text-red-400">
      {issueDescription}
    </p>
    <!-- actions -->
    {#if jellyfin.user?.isAdmin}
      {#if       $playbackReportingInspectionResult.issue ===
        PlaybackReportingIssueAction.INSTALL_PLUGIN}
        <!-- svelte-ignore event_directive_deprecated -->
        <button
          class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
          onclick={async () => {
            try {
              await installPlaybackReportingPlugin();
              playbackReportingInspectionResult.set(
                await checkPlaybackReportingSetup(),
              );
              checkIfCanContinue();
            } catch (err) {
              console.error(
                `Couldn't set up Playback Reporting Plugin!:`,
                err,
              );
            }
          }}
        >
          Install Playback Reporting Plugin!
        </button>
      {:else if       $playbackReportingInspectionResult.issue ===
        PlaybackReportingIssueAction.RESTART_SERVER}
        <!-- svelte-ignore event_directive_deprecated -->
        <button
          class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
          onclick={async () => {
            try {
              await restartServer();
              waitingForRestart = true;
              setTimeout(async () => {
                playbackReportingInspectionResult.set(
                  await checkPlaybackReportingSetup(),
                );
                waitingForRestart = false;
                checkIfCanContinue();
              }, 15000);
            } catch (err) {
              console.error(
                `Couldn't set up Playback Reporting Plugin!:`,
                err,
              );
            }
          }}
        >
          {
            waitingForRestart
              ? `Server is restarting...`
              : `Restart Jellyfin Server`
          }
        </button>
      {:else if       $playbackReportingInspectionResult.issue ===
          PlaybackReportingIssueAction.ENABLE_PLUGIN &&
        $playbackReportingInspectionResult.setup}
        <!-- svelte-ignore event_directive_deprecated -->
        <button
          class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
          onclick={async () => {
            try {
              await enablePlaybackReportingPlugin(
                $playbackReportingInspectionResult.setup,
              );
              playbackReportingInspectionResult.set(
                await checkPlaybackReportingSetup(),
              );
              checkIfCanContinue();
            } catch (err) {
              console.error(
                `Couldn't set up Playback Reporting Plugin!:`,
                err,
              );
            }
          }}
        >
          Enable Playback Reporting Plugin!
        </button>
      {:else if       $playbackReportingInspectionResult.issue ===
        PlaybackReportingIssueAction.UPDATE_PLUGIN}
        <a
          class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
          href="{jellyfin.baseurl}/web/#/dashboard/plugins/${$playbackReportingInspectionResult
            ?.setup?.id ??
            `5c53438191a343cb907a35aa02eb9d2c`}?name=Playback%20Reporting"
          target="_blank"
        >Update Playback Reporting Plugin!</a>
        <!-- svelte-ignore event_directive_deprecated -->
        <button
          class="px-2 py-1 rounded-lg text-sm font-semibold border-2 border-orange-500 hover:bg-orange-600 text-orange-500 hover:text-white"
          onclick={async () => {
            playbackReportingInspectionResult.set(
              await checkPlaybackReportingSetup(),
            );
            checkIfCanContinue();
          }}
        >
          Check Again
        </button>
      {:else if       $playbackReportingInspectionResult.issue ===
        PlaybackReportingIssueAction.RETENTION_SHORT}
        <!-- svelte-ignore event_directive_deprecated -->
        <button
          class="px-3 py-2 my-1 mx-auto rounded-lg text-white font-semibold bg-[#00A4DC] hover:bg-[#0085B2]"
          onclick={async () => {
            try {
              const newSettings = {
                ...($playbackReportingInspectionResult?.setup?.settings ??
                  {}),
                MaxDataAge: "-1",
              };
              updatePlaybackReportingSettings(newSettings);
              playbackReportingInspectionResult.set(
                await checkPlaybackReportingSetup(),
              );
              checkIfCanContinue();
            } catch (err) {
              console.error(
                `Couldn't set up Playback Reporting Plugin!:`,
                err,
              );
            }
          }}
        >
          Set retention interval to forever
        </button>
        <!-- svelte-ignore event_directive_deprecated -->
        <button
          class="px-2! py-1! mt-1 mx-auto rounded-lg! text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-200 flex flex-row gap-4 items-center mx-auto hover:text-white"
          onclick={async () => {
            try {
              const newSettings = {
                ...($playbackReportingInspectionResult?.setup?.settings ??
                  {}),
                MaxDataAge: 24,
              };
              updatePlaybackReportingSettings(newSettings);
              playbackReportingInspectionResult.set(
                await checkPlaybackReportingSetup(),
              );
              checkIfCanContinue();
            } catch (err) {
              console.error(
                `Couldn't set up Playback Reporting Plugin!:`,
                err,
              );
            }
          }}
        >
          Set retention interval to 2 years
        </button>
      {:else if       $playbackReportingInspectionResult.issue ===
        PlaybackReportingIssueAction.USER_IGNORED}
        <a
          class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
          href={`${jellyfin.baseurl}/web/index.html#!/configurationpage?name=playback_report_settings`}
          target="_blank"
        >Open Playback Reporting Settings!</a>
        <!-- svelte-ignore event_directive_deprecated -->
        <button
          class="px-2 py-1 rounded-lg text-sm font-semibold border-2 border-orange-500 hover:bg-orange-600 text-orange-500 hover:text-white"
          onclick={async () => {
            playbackReportingInspectionResult.set(
              await checkPlaybackReportingSetup(),
            );
            checkIfCanContinue();
          }}
        >
          Check Again
        </button>
      {/if}
    {:else}
      Log into your Jellyfin server as an administrator to fix these issues.
    {/if}
  </div>

  <button
    class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-200 text-balance text-center mt-12 flex flex-row gap-4 items-center mx-auto hover:text-white"
    onclick={() => ($playbackReportingDialogOpen = true)}
  >
    <span>More Information about why this is important</span>
  </button>

  <button
    class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-200 mt-24 flex flex-row gap-4 items-center mx-auto hover:text-white"
    onclick={() => goto("/importLastYearsReport")}
  >
    <span>Continue anyway (not recommended!)</span>
  </button>
</div>

<Modal open={playbackReportingDialogOpen}>
  <div
    class="w-full h-full bg-black/90 text-white pb-20 backdrop-blur backdrop-blur-sm rounded-xl"
  >
    <div
      class="relative w-full flex flex-row justify-center items-center px-2 pt-4 pb-2"
    >
      <h3 class="text-center text-lg font-quicksand font-medium text-[#00A4DC]">
        Setting up Playback Reporting
      </h3>
      <button
        onclick={() => ($playbackReportingDialogOpen = false)}
        class="absolute right-2 text-[#00A4DC] hover:text-[#0085B2]"
        title="Close"
      >
        <CloseIcon />
      </button>
    </div>
    <div class="w-full h-full overflow-x-auto p-4">
      <div class="flex flex-col items-start gap-2">
        <p>
          Jellyfin doesn't save any information about played tracks other than
          the number of times they were played. This means that things like the
          total playtime are only an approximation. It also means that it is
          <span
            class="font-semibold"
          >not possible to limit the data to a specific time frame, like {year}
            only!<span></span></span>
        </p>
        <p>
          However, if you have the "Playback Reporting" plugin installed,
          significantly more information can be collected, such as the date and
          durations of each playback. This results in better stats, although it
          isn't perfect either. Playback reporting depends on applications
          properly reporting the current playback states, and currently most
          music players that are compatible with Jellyfin seem to struggle with
          this in one way or another. Especially offline playback is
          challenging, because the players have to "simulate" the playback after
          the device reconnects to the server.
        </p>
        <p>
          Still, the best solution is to install the Playback Reporting plugin
          into your Jellyfin server if you haven't done so already. It won't
          take longer than 2 minutes, so why not do it right now?
        </p>
        {#if jellyfin.baseurl && jellyfin.user?.isAdmin}
          <a
            class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
            href={`${jellyfin.baseurl}/web/index.html#/dashboard/plugins/5c53438191a343cb907a35aa02eb9d2c?name=Playback%20Reporting`}
            target="_blank"
          >Open Plugins Page!</a>
        {:else}
          <!-- TODO give options to login and then open the right spot when adding the parking page -->
          <p>
            Since you are not logged in as an admin user here, you'll need to
            manually log into your Jellyfin server as an admin user to install
            and configure the Playback Reporting plugin.
          </p>
        {/if}
        <p>
          By default, the Playback Reporting plugin only stores the last 3
          months worth of playback data, so you definitely want to change that
          in the settings. I'd suggest keeping at least the last two years, just
          to be safe. The button below will take you directly to the settings
          page.
        </p>
        {#if jellyfin.baseurl && jellyfin.user?.isAdmin}
          <!-- TODO handle this case? -->
          <a
            class="px-3 py-2 my-1 rounded-md text-white font-semibold bg-[#00A4DC]"
            href={`${jellyfin.baseurl}/web/index.html#!/configurationpage?name=playback_report_settings`}
            target="_blank"
          >Open Playback Reporting Settings!</a>
        {:else}
          <!-- TODO give options to login and then open the right spot when adding the parking page -->
          <p>
            Since you are not logged in as an admin user here, you'll need to
            manually log into your Jellyfin server as an admin user to change
            the Playback Reporting plugin settings.
          </p>
        {/if}

        <p>
          For more information about the Playback Reporting plugin, you can
          visit <a
            class="text-[#00A4DC]"
            href="https://jellyfin.org/docs/general/server/plugins/#playback-reporting"
            target="_blank"
          >its entry in the official Jellyfin Docs</a>.
        </p>
        <p>
          I will try to again offer a way to import {year}'s Rewind data into
          Jellyfin Rewind {year + 1}, so that more information can be used and
          the used data can be properly limited to the current year only.
        </p>
      </div>
    </div>
  </div>
  <button onclick={() => ($playbackReportingDialogOpen = false)}>Okay!</button>
</Modal>
