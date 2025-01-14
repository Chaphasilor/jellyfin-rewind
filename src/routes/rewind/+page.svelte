<script lang="ts">
    import Monthly from "./renders/Monthly.svelte";

    let page = 0;
    let pages = [{
        title: "Monthly Activity",
        details: "Starting with some insight into your monthly activity",
        component: Monthly
    }];
</script>


<h1>
    {pages[page].title}
</h1>
<p>
    {pages[page].details}
</p>
<br>
<svelte:component this={pages[page].component} />