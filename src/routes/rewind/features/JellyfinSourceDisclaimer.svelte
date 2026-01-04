<script lang="ts">
  import { year } from "$lib/globals";
  import { onMount } from "svelte";
  import type { FeatureProps } from "$lib/types";
  import JellyfinRewindLogo from "$lib/components/JellyfinRewindLogo.svelte";
  import jellyfin from "$lib/jellyfin";
  import { goto } from "$app/navigation";

  const {
    informationSource,
    rankingMetric,
    extraFeatures,
    onNextFeature,
  }: FeatureProps = $props();

  export function onEnter() {}
  export function onExit() {}

  onMount(() => {});
</script>

<div class="p-4 pt-10">
  <div class="mt-6 w-full flex flex-col items-center mb-8">
    <JellyfinRewindLogo />
  </div>

  <div
    class="flex flex-col gap-4 text-md font-medium leading-6 text-gray-400 mt-4 w-full mx-auto text-balance text-center"
  >
    <p>
      The data in your Jellyfin Rewind Report is sourced from Jellyfin directly,
      because Jellyfin Rewind couldn't access the Playback Reporting plugin, or
      it hasn't been installed for most of the year.
    </p>
    <p>
      This means that the data displayed in this report <b
        class="font-bold text-orange-400!"
      >may not be as accurate or comprehensive as it could be</b>. Jellyfin
      doesn't remember <i>when</i> you played something, only when you <i
      >last</i> played it. That means it's not possible to properly limit
      playback data to just {year}.
    </p>
    <p>
      For next year, you should definitely install the Playback Reporting plugin
      for Jellyfin, and set its data retention duration to at least 2 years, or
      to forever.<br />
      If the plugin wasn't set up correctly yet, you should've seen a prompt
      during login already :)
    </p>
  </div>
  {#if !jellyfin.user?.isAdmin}
    <button
      class="px-2 py-1 rounded-lg text-sm border-[#00A4DC] border-2 hover:bg-[#0085B2] font-medium text-gray-200 mt-6 flex flex-row gap-4 items-center mx-auto hover:text-white"
      on:click={() => goto("/adminLogin")}
    >
      <span>Log in as admin</span>
    </button>
  {/if}
  <!-- svelte-ignore event_directive_deprecated -->
  <button
    class="px-7 py-3 rounded-2xl text-[1.4rem] bg-[#00A4DC] hover:bg-[#0085B2] text-white font-semibold mt-6 flex flex-row gap-4 items-center mx-auto"
    on:click|stopPropagation={() => onNextFeature()}
  >
    Understood, continue!
  </button>
</div>
