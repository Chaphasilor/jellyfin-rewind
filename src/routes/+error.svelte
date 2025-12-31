<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  if (page.status == 404) {
    goto("/welcome");
  }
</script>

<div class="text-center">
  <h1>{page.status} {page.error.message}</h1>
</div>
