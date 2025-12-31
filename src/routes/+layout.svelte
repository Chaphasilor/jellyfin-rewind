<script lang="ts">
  import { page } from "$app/state";
  import { isAccuracyDisclaimerOpen, year } from "$lib/globals";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import PageTransition from "$lib/components/PageTransition.svelte";
  import "./global.css";
  import "./global.scss";
</script>

<svelte:head>
    <title>{year} Jellyfin Rewind</title>
    <meta property="og:site_name" content="Jellyfin Rewind" />
    <meta property="og:title" content="Jellyfin Rewind - Review Your Music of {year}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://jellyfin-rewind.chaphasilor.xyz/" />
    <meta property="og:image" content="https://jellyfin-rewind.chaphasilor.xyz/media/banner-dark.png" />
    <meta property="og:description" content="Review Your Music of {year}. A 'Spotify Wrapped'-like app made for people who use Jellyfin for listening to music!" />
    <meta property="og:locale" content="en_US" />
</svelte:head>

<main class:noScrollBar={page.url.pathname == "/rewind"}>
  <PageTransition path={page.url.href}>
    <slot />
  </PageTransition>

  <Modal open={isAccuracyDisclaimerOpen}>
    Test
  </Modal>
</main>
