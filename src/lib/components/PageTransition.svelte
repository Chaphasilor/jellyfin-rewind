<script>
  import { fly } from "svelte/transition";
  export let path;
</script>

{#key path}
  <div
    in:fly={{ y: 200, duration: 300, delay: 300 }}
    out:fly={{ y: -200, duration: 300 }}
    class="content"
  >
    <slot />
  </div>
{/key}
