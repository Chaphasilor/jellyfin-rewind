<script lang="ts">
    import { page } from "$app/state";
    import JfRecap from "$lib/components/JFRecap.svelte";
    import PageTransition from "$lib/components/PageTransition.svelte";
    import "./global.scss";
</script>

<main>
    <JfRecap />

    <PageTransition path={page.url.href}>
        <slot />
    </PageTransition>

    <p>Github</p>
</main>

<style>
    p {
        margin: auto;
        margin-bottom: 0;
    }
</style>
