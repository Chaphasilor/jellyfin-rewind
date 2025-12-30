<script lang="ts">
  import { page } from "$app/state";
  import { isAccuracyDisclaimerOpen } from "$lib/globals"
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
    import Modal from "$lib/components/Modal.svelte";
  import PageTransition from "$lib/components/PageTransition.svelte";
  import "./global.css";
  import "./global.scss";
</script>

<main class:noScrollBar={page.url.pathname == "/rewind"}>
  <PageTransition path={page.url.href}>
    <slot />
  </PageTransition>


  <Modal open={isAccuracyDisclaimerOpen}>
    Test
  </Modal>
</main>

