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
    on:scroll|stopPropagation={() => {}}
    on:wheel|stopPropagation={() => {}}
    in:fade={{ delay: 0, duration: 250 }}
    out:fade={{ delay: 0, duration: 250 }}
  >
    <!-- TODO add proper close button -->
    <div
      on:click|stopPropagation
      class="relative w-full h-full rounded-xl shadow-lg pt-12 p-4 bg-gray-900 text-white overflow-y-auto"
    >
      <button
        class="absolute top-4 right-4 text-white"
        title="Close dialog"
        on:click={() => (open = false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-x"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M18 6l-12 12"
          />
          <path d="M6 6l12 12" />
        </svg>
      </button>

      <slot />
    </div>
  </div>
{/if}
