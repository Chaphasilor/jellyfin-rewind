<script lang="ts">
  import { page } from "$app/state";
  import { isAccuracyDisclaimerOpen, year } from "$lib/globals";
  import Modal from "$lib/components/Modal.svelte";
  import PageTransition from "$lib/components/PageTransition.svelte";
  import "./global.css";
  import "./global.scss";
  import { onMount } from "svelte";
  import jellyfin from "$lib/jellyfin";

  onMount(() => {
    // init auth session
    jellyfin.load();
  });
</script>

<svelte:head>
  <title>Jellyfin Rewind {year}</title>
  <meta property="og:site_name" content="Jellyfin Rewind" />
  <meta
    property="og:title"
    content="Jellyfin Rewind - Review Your Music of {year}"
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://jellyfin-rewind.chaphasilor.xyz/" />
  <meta
    property="og:image"
    content="https://jellyfin-rewind.chaphasilor.xyz/media/banner-dark.png"
  />
  <meta
    property="og:description"
    content="Review Your Music of {year}. A 'Spotify Wrapped'-like app made for people who use Jellyfin for listening to music!"
  />
  <meta property="og:locale" content="en_US" />

  <!-- The favicon gets a random query parameter so the old svelte icon which is cached by browsers cant be reused and must be refetched-->
  <link
    rel="icon"
    href="/favicon.png?n={Date.now()}"
  />
</svelte:head>

<div class="max-w-2xl mx-auto">
  <main class:noScrollBar={page.url.pathname == "/rewind"}>
    <PageTransition path={page.url.href}>
      <slot />
    </PageTransition>
  </main>
  <!-- TODO this can't be opened from other features -->
  <Modal open={isAccuracyDisclaimerOpen}>
    <div class="flex flex-col items-center gap-2 z-20">
      <p>
        Jellyfin doesn't save any information about played tracks other than the
        number of times they were played. This means that things like the total
        playtime are only an approximation. It also means that it is <span
          class="font-semibold"
        >not possible to limit the data to {year} without
          plugins!<span></span></span>
      </p>
      <p>
        However, if you have the <span class="font-semibold"
        >"Playback Reporting"</span>
        plugin installed,
        <span class="font-semibold"
        >significantly more information can be collected</span>, such as the
        date and durations of each playback. This results in better stats,
        although it isn't perfect either. Playback reporting depends on
        applications properly reporting the current playback states, and
        currently most music players that are compatible with Jellyfin seem to
        struggle with this in one way or another.
        <span class="font-semibold"
        >Offline playback is not recorded at all</span>.
      </p>
      <p>
        Still, the best solution is to install the Playback Reporting plugin
        into your Jellyfin server if you haven't done so already. It won't take
        longer than 2 minutes, so why not do it right now? Your Jellyfin Rewind
        isn't going anywhere!
      </p>
      {#if jellyfin.user?.isAdmin}
        <a
          class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
          href={`${jellyfin.baseurl}/web/index.html#/dashboard/plugins/5c53438191a343cb907a35aa02eb9d2c?name=Playback%20Reporting`}
          target="_blank"
        >Open Plugins Page!</a>
      {:else}
        <!-- svelte-ignore a11y_missing_attribute -->
        <a
          class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC] saturate-0 opacity-50 cursor-not-allowed"
        >Open Plugins Page!</a>
        <p class="font-medium mb-6">
          You're not logged in with an administrator account, but you need to be
          an admin in order to install plugins. If you are logged into Jellyfin
          with an admin account, you can
          <a
            class="text-[#00A4DC]"
            href={`${jellyfin.baseurl}/web/index.html#/dashboard/plugins/5c53438191a343cb907a35aa02eb9d2c?name=Playback%20Reporting`}
            target="_blank"
          >click here to open the plugins page</a>. If nothing happens or
          Jellyfin just keeps loading, that means the logged-in account is not
          an administrator.
        </p>
      {/if}
      <p>
        By default, the Playback Reporting plugin only stores the last 3 months
        worth of playback data, so you definitely want to change that in the
        settings. I'd suggest keeping at least the last two years, just to be
        safe. The button below will take you directly to the settings page.
      </p>
      {#if jellyfin.user?.isAdmin}
        <a
          class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
          href={`${jellyfin.baseurl}/web/index.html#/configurationpage?name=playback_report_settings`}
          target="_blank"
        >Open Settings</a>
      {:else}
        <p class="font-medium mb-6">
          You're not logged in with an administrator account, but you need to be
          an admin in order to install plugins. If you are logged into Jellyfin
          with an admin account and already have the Playback Reporting plugin
          installed, you can
          <a
            class="text-[#00A4DC]"
            href={`${jellyfin.baseurl}/web/index.html#!/configurationpage?name=playback_report_settings`}
            target="_blank"
          >click here to open the plugin settings</a>. If nothing happens or
          Jellyfin just keeps loading, that means the logged-in account is not
          an administrator.
        </p>
      {/if}

      <p>
        For more information about the Playback Reporting plugin, you can visit
        <a
          class="text-[#00A4DC]"
          href="https://jellyfin.org/docs/general/server/plugins/#playback-reporting"
          target="_blank"
        >the Jellyfin documentation</a>.
      </p>
      <p>
        So, please treat all of this information with a grain of salt. You can
        take a look at the settings in order to choose which data will be used,
        but any information that needs to be interpolated will have a negative
        influence on the quality of these stats.
      </p>
      <p>
        I will try to offer a way to import this year's Rewind data into next
        year's Jellyfin Rewind, so that more information can be used and the
        used data can be properly limited to the current year only. Because of
        this, please <span class="font-semibold"
        >make sure to download a copy of your Rewind data at the end and store
          it until next year!</span>
      </p>
      <button
        class="px-3 py-2 my-1 mt-8 mb-20 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
        onclick={() => $isAccuracyDisclaimerOpen = false}
      >
        Understood, close!
      </button>
    </div>
  </Modal>
</div>
