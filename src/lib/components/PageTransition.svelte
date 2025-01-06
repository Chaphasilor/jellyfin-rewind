<script>
    import { fly } from "svelte/transition";
    export let path;
</script>

{#key path}
    <div
        in:fly={{ duration: 300, delay: 400 }}
        out:fly={{ duration: 50 }}
        class="content"
    >
        <slot />
    </div>
{/key}
