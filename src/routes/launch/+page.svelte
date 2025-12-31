<script lang="ts">
  import { goto } from "$app/navigation";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import { lightRewindReport } from "$lib/globals";
  import jellyfin from "$lib/jellyfin";
  import { onMount } from "svelte";

  onMount(() => {
    if (!$lightRewindReport) {
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
      //TODO this messes with the scroll snap offsets?
      // document.documentElement.requestFullscreen();
      goto("/rewind");
    }}
  >
    <span>Launch Jellyfin Rewind</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-7 h-7 stroke-[2] icon icon-tabler icon-tabler-rocket"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path
        d="M4 13a8 8 0 0 1 7 7a6 6 0 0 0 3 -5a9 9 0 0 0 6 -8a3 3 0 0 0 -3 -3a9 9 0 0 0 -8 6a6 6 0 0 0 -5 3"
      >
      </path>
      <path d="M7 14a6 6 0 0 0 -3 6a6 6 0 0 0 6 -3"></path>
      <circle cx="15" cy="9" r="1"></circle>
    </svg>
  </button>
</div>
