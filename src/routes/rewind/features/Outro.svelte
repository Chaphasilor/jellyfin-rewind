<script lang="ts">
  import type { FeatureProps } from "$lib/types";
  import { rewindReport, year } from "$lib/globals";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { reset } from "$lib/jellyfin/queries/local/processing/functions";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import jellyfin from "$lib/jellyfin";
  import DownloadIcon from "$lib/components/icons/DownloadIcon.svelte";
  import { stopPropagation } from "$lib/utility/handlers";
  import { writable } from "svelte/store";

  const {}: FeatureProps = $props();

  let rewindReportDownloaded = $state(false);

  function download() {
    const filename =
      `jellyfin-rewind-report-${$rewindReport.jellyfinRewindReport.year}_for-${
        jellyfin.user?.name ?? ``
      }_${new Date().toISOString().slice(0, 10)}.json`;
    const data = new Blob([JSON.stringify(
      $rewindReport.jellyfinRewindReport,
    )], {
      type: "text/json",
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = window.URL.createObjectURL(data);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(
      ":",
    );
    const evt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(evt);
    link.remove();

    rewindReportDownloaded = true;
  }
  function close(logout: boolean = false) {
    if (logout) {
      jellyfin.terminateSession();
    }
    reset().then(() => {
      goto("/welcome");
    });
  }

  export function onEnter() {
  }
  export function onExit() {
  }

  onMount(() => {});
</script>

<div class="p-4 pt-10">
  <h2
    class="text-[1.65rem] leading-8 text-center mt-4 font-semibold text-gray-100"
  >
    That was
  </h2>

  <div class="mt-4 w-full flex flex-col items-center">
    <JellyfinRewindLogo />
  </div>

  <div
    class="flex flex-col gap-3 text-lg font-medium leading-6 text-gray-400 mt-8 w-5/6 mx-auto"
  >
    <p class="">
      Thank you so much for checking it out, I hope you had fun and saw some
      interesting stats!
    </p>
    <p class="">Please make sure to</p>
  </div>
  <!-- svelte-ignore event_directive_deprecated -->
  <button
    class="px-6 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-3 flex flex-row gap-4 items-center mx-auto"
    onclick={stopPropagation(() => {
      download();
    })}
  >
    <span class="leading-7">Download Your<br />Rewind Report</span>
    <DownloadIcon />
  </button>

  <div
    class="flex flex-col gap-4 text-lg font-medium leading-6 text-gray-500 text-gray-400 mt-3 w-5/6 mx-auto text-center"
  >
    <p class="">
      and <span class="font-bold text-orange-600"
      >store it until next year</span> because it might help to show you even
      more insights next time around!
    </p>
    <p class="">
      We'd love to hear your feedback on <a
        class="text-[#00A4DC] hover:text-[#0085B2]"
        href="https://github.com/Chaphasilor/jellyfin-rewind/issues"
        target="_blank"
        onclick={stopPropagation()}
      >GitHub</a>!<br />Feel free to leave suggestions or report bugs :)
    </p>
    <p>
      See you next year!<br>
      <span class="italic right-0 bottom-0">
        - Chaphasilor, Floschy, 1hitsong, and all other contributors
      </span>
    </p>
  </div>
</div>
