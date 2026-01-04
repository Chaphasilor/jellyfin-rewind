<script>
  import Modal from "./Modal.svelte";
  import InfoIcon from "./icons/InfoIcon.svelte";
  const { children } = $props();

  let modalOpen = $state(false);
  export function closeModal() {
    modalOpen = false;
  }
</script>

<div
  class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-12 bg-[#121212]/50 backdrop-blur-xs"
>
  <span class="text-4xl text-[#00A4DC] tracking-wider font-semibold -rotate-15">
    Unavailable
  </span>
  <button
    on:click|stopPropagation={() => {
      modalOpen = true;
    }}
    class="w-32 rounded-md flex flex-row items-center justify-around px-2 py-1 bg-white text-gray-900"
  >
    <InfoIcon />
    <span class="font-medium">Learn why</span>
  </button>
</div>

<Modal open={modalOpen}>
  {@render children()}
</Modal>
