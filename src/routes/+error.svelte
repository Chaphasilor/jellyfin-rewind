<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  onMount(() => {
    if (page.status == 404) goto("/welcome");
  });
</script>

<div class="text-center">
  <h1>{page.status}</h1>
  <code>{page.error?.message}</code>
</div>
