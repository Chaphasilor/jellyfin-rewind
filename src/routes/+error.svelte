<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  if (page.status == 404) {
    setTimeout(() => {
      goto("/welcome");
    }, 10000);
  }
</script>

<div class="text-center">
  <h1>{page.status}</h1>
  <code>{page.error?.message}</code>
</div>
