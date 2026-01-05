<script lang="ts">
  import { goto } from "$app/navigation";
  import RocketIcon from "$lib/components/icons/RocketIcon.svelte";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import { rewindReport } from "$lib/globals";
  import jellyfin from "$lib/jellyfin";
  import { onMount } from "svelte";

  onMount(() => {
    if (!$rewindReport) {
      if (jellyfin.baseurl && jellyfin.user) {
        goto("/loading");
      } else {
        goto("/welcome");
      }
    }
  });
</script>

<div class="p-6 text-center flex flex-col items-center">
  <JellyfinRewindLogo />

  <div class="mt-8">
    <h2>Your Rewind Report is ready!</h2>
    <p>Click the button below to start exploring and reliving.</p>
  </div>

  <div class="info mt-8 text-start flex flex-col gap-2">
    <h4 class="text-xl font-semibold">Before You Launch...</h4>
    <p>
      This year we've completely re-made Jellyfin Rewind from scratch, to make
      it more maintainable for the future.
    </p>
    <p>
      Like always, we barely finished it in time, so there might be more bugs
      than usual.
    </p>
    <p>
      If you find any bugs, please let us know over on <a
        class="text-[#00A4DC] font-bold underline hover:text-[#0085B2]"
        href="https://github.com/Chaphasilor/jellyfin-rewind/issues"
        target="_blank"
      >our GitHub repo</a>!
    </p>
    <!--TODO fix mobile/touchpad For the best Experience we also recommend checking out your Rewind on a PC or Laptop. -->
  </div>

  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] disabled:bg-[#00A4DC]/30 text-white font-semibold mt-12 flex flex-row gap-4 items-center mx-auto"
    on:click={() => {
      document.documentElement.requestFullscreen();
      goto("/rewind");
    }}
  >
    <span>Launch Jellyfin Rewind</span>
    <RocketIcon />
  </button>
</div>
