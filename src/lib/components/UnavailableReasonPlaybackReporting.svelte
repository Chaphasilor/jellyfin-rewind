<script lang="ts">
  import jellyfin from "$lib/jellyfin";

  const { closeModal }: { closeModal: () => void } = $props();
</script>

<div class="flex flex-col items-start gap-2">
  <p>
    This feature depends on the 'Playback Reporting' plugin, which is either not
    installed on your Jellyfin server or hasn't been installed for long enough.
  </p>
  <p>
    You can install the Playback Reporting plugin into your Jellyfin server by
    clicking the button below. It won't take longer than 5 minutes, so why not
    do it right now? Your Jellyfin Rewind isn't going anywhere!
  </p>
  {#if jellyfin.user?.isAdmin}
    <a
      class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
      href={`${jellyfin.baseurl}/web/index.html#/dashboard/plugins/5c53438191a343cb907a35aa02eb9d2c?name=Playback%20Reporting`}
      target="_blank"
    >Open Plugins Page!</a>
  {:else}
    <a
      class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC] saturate-0 opacity-50 cursor-not-allowed"
    >Open Plugins Page!</a>
    <p class="font-medium mb-6">
      You're not logged in with an administrator account, but you need to be an
      admin in order to install plugins. If you are logged into Jellyfin with an
      admin account, you can
      <a
        class="text-[#00A4DC]"
        href={`${jellyfin.baseurl}/web/index.html#/dashboard/plugins/5c53438191a343cb907a35aa02eb9d2c?name=Playback%20Reporting`}
        target="_blank"
      >click here to open the plugins page</a>. If nothing happens or Jellyfin
      just keeps loading, that means the logged-in account is not an
      administrator.
    </p>
  {/if}
  <p>
    By default, the Playback Reporting plugin only stores the last 3 months
    worth of playback data, so you definitely want to change that in the
    settings. I'd suggest keeping at least the last two years, just to be safe.
    The button below will take you directly to the settings page.
  </p>
  {#if jellyfin.user?.isAdmin}
    <a
      class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
      href={`${jellyfin.baseurl}/web/index.html#/configurationpage?name=playback_report_settings`}
      target="_blank"
    >Open Settings</a>
  {:else}
    <a
      class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC] saturate-0 opacity-50 cursor-not-allowed"
    >Open Settings!</a>
    <p class="font-medium mb-6">
      You're not logged in with an administrator account, but you need to be an
      admin in order to install plugins. If you are logged into Jellyfin with an
      admin account and already have the Playback Reporting plugin installed,
      you can
      <a
        class="text-[#00A4DC]"
        href={`${jellyfin.baseurl}/web/index.html#!/configurationpage?name=playback_report_settings`}
        target="_blank"
      >click here to open the plugin settings</a>. If nothing happens or
      Jellyfin just keeps loading, that means the logged-in account is not an
      administrator.
    </p>
  {/if}
  <p>
    For more information about the Playback Reporting plugin, you can visit <a
      class="text-[#00A4DC]"
      href="https://jellyfin.org/docs/general/server/plugins/#playback-reporting"
      target="_blank"
    >the Jellyfin documentation</a>.
  </p>
</div>
<button
  class="px-3 py-2 my-1 mt-8 mb-20 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
  on:click={() => closeModal()}
>
  Understood, close!
</button>
