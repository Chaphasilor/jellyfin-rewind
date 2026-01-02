<script lang="ts">
  import { goto } from "$app/navigation";
  import { year } from "$lib/globals";

  const { closeModal }: { closeModal: () => void } = $props();
</script>

<div class="flex flex-col items-start gap-2">
  <p>
    In order to make comparisons between last year and this year, you will need
    to import last year's Rewind Report.
  </p>
  <p>
    If you downloaded your Rewind Report last year and still have the <span
      class="font-mono"
    >.json</span>-file around, you can simply close the report (X-button in
    upper right corner) and then click the "Regenerate Rewind" button. There you
    will have the option to select the file from last year.
  </p>
  <p>
    You'll then have to re-generate your report for this year to include the
    additional statistics.
  </p>
  <!-- svelte-ignore event_directive_deprecated -->
  <button
    class="px-3 py-2 my-1 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
    on:click={() => {
      goto("/importLastYearsReport");
      closeModal();
    }}
  >
    Go to Import Page!
  </button>
  <p class="mt-6">
    If you didn't use Jellyfin Rewind last year, forgot to download your Rewind
    Report, or can't find the file anymore, I'm sorry to tell you that this
    feature will be unavailable for you this year. But if you make sure to
    download this year's Rewind Report at the end and keep it safe until next
    year, you can try it out in {year}!
  </p>
</div>
<button
  class="px-3 py-2 my-1 mt-8 mb-20 mx-auto rounded-md text-white font-semibold bg-[#00A4DC]"
  on:click={() => closeModal()}
>
  Understood, close!
</button>
