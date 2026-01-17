<script lang="ts">
  import { stopPropagation } from "$lib/utility/handlers";
  import { fade } from "svelte/transition";

  export let open: boolean;
</script>

{#if open}
  <div
    class="fixed top-0 left-0 w-screen h-screen bg-white/10 backdrop-blur flex justify-center items-center z-50 px-8 py-12"
    onkeypress={stopPropagation(() => open = false)}
    onclick={stopPropagation(() => open = false)}
    onscroll={stopPropagation()}
    onwheel={stopPropagation()}
    in:fade={{ delay: 0, duration: 250 }}
    out:fade={{ delay: 0, duration: 250 }}
    role="button"
    aria-roledescription="Dismiss the Modal"
    tabindex="0"
  >
    <div
      onkeypress={stopPropagation(() => open = false)}
      onclick={stopPropagation()}
      class="relative w-full max-w-2xl h-full rounded-xl shadow-lg pt-16 p-4 bg-gray-900 text-white overflow-y-auto"
      role="button"
      tabindex="0"
    >
      <button
        class="fixed top-16 right-12 text-white bg-black/50 p-2 rounded-lg"
        title="Close dialog"
        aria-roledescription="Dismiss the Modal"
        onclick={stopPropagation(() => open = false)}
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
