<script>
  import { writable } from "svelte/store";
  import Modal from "./Modal.svelte";
    import { importRewindReport } from "$lib/utility/oldReportDelta";
    import { goto } from "$app/navigation";
    import { year } from "$lib/globals";
  let modalOpen = $state(false);
  export function closeModal() {
    modalOpen = false;
  }
</script>

<div
  class="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-12 bg-[#121212AB]"
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5 icon icon-tabler icon-tabler-info-square-rounded"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M12 8h.01"></path>
      <path d="M11 12h1v4h1"></path>
      <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z">
      </path>
    </svg>
    <span class="font-medium">Learn why</span>
  </button>
</div>

<Modal open={modalOpen}>
  <div class="flex flex-col items-start gap-2">
    <p>
      In order to make comparisons between last year and this year, you will
      need to import last year's Rewind Report.
    </p>
    <p>
      If you downloaded your Rewind Report last year and still have the <span
        class="font-mono">.json</span
      >-file around, you can simply close the report (X-button in upper right
      corner) and then click the "Regenerate Rewind" button. There you will have
      the option to select the file from last year.
    </p>
    <p>
      You'll then have to re-generate your report for this year to include the
      additional statistics.
    </p>
    <!-- svelte-ignore event_directive_deprecated -->
    <button
      class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
      on:click={() => {
        goto("/importLastYearsReport")
        modalOpen = false;
      }}>Go to Import Page!</button
    >
    <p class="mt-6">
      If you didn't use Jellyfin Rewind last year, forgot to download your
      Rewind Report, or can't find the file anymore, I'm sorry to tell you that
      this feature will be unavailable for you this year. But if you make sure
      to download this year's Rewind Report at the end and keep it safe until
      next year, you can try it out in {year}!
    </p>
  </div>
  <button on:click={() => (modalOpen = false)}>Okay!</button>
</Modal>
