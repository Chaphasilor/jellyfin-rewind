<script lang="ts">
  import { page } from "$app/state";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import PageTransition from "$lib/components/PageTransition.svelte";
  import "./global.css";
  import "./global.scss";
</script>

<main>
  <PageTransition path={page.url.href}>
    <slot />
  </PageTransition>

  <p>Github</p>
</main>

<style>
  p {
    margin: auto;
    margin-bottom: 0;
  }
</style>
