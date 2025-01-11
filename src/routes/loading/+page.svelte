<script lang="ts">
    import Loading from "$lib/components/Loading.svelte";
    import { downloadingProgress, generatingProgress, processingProgress } from "$lib/globals";
</script>


<Loading {...$downloadingProgress} title="Downloading Data" />

<Loading {...$processingProgress} title="Processing Data" />

<Loading {...$generatingProgress} title="Generating Rewind" />