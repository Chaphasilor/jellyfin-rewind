<script lang="ts">
  import type { Writable } from "svelte/store";
  import { fade } from "svelte/transition";

  export let open: boolean;
  console.log({ open });
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed top-0 left-0 w-screen h-screen bg-white/10 backdrop-blur flex justify-center items-center z-50 px-8 py-12"
    on:click|stopPropagation={() => (open = false)}
    in:fade={{ delay: 0, duration: 250 }}
    out:fade={{ delay: 0, duration: 250 }}
  >
    <!-- TODO add proper close button -->
    <div
      on:click|stopPropagation
      class="w-full h-full rounded-xl shadow-lg pt-8 p-4 bg-gray-900 text-white"
    >
      <slot />
    </div>
  </div>
{/if}
