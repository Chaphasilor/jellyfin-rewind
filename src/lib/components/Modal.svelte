<script lang="ts">
    import type { Writable } from "svelte/store";
    import { fade } from "svelte/transition";

    export let open: Writable<boolean>;
    console.log({open})
</script>

{#if $open}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal"
        on:click={() => $open=false}
        in:fade={{delay: 0, duration: 250}}
        out:fade={{delay: 0, duration: 250}}
    >
        <div on:click|stopPropagation>
            <slot />
        </div>
    </div>
{/if}


