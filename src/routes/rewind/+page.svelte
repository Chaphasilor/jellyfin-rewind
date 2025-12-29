<script lang="ts">
  import { processingResult } from "$lib/globals";
  import { processingResultToRewindReport } from "$lib/utility/convert";
  import { logAndReturn } from "$lib/utility/logging";
  import Monthly from "./renders/Monthly.svelte";

  let page = 0;
  let pages = [{
    title: "Monthly Activity",
    details: "Starting with some insight into your monthly activity",
    component: Monthly,
  }];

  async function logRewindReport() {
    const report = await processingResultToRewindReport($processingResult);
    logAndReturn("converted report", report);
  }
  logRewindReport();
</script>

<h1>
  {pages[page].title}
</h1>
<p>
  {pages[page].details}
</p>
<br>
<svelte:component this={pages[page].component} />
