<script lang="ts">
    import { initTasksDone, initTasksTodo, processTaskTodo, processTaskDone, fetchingTaskDone, fetchingTaskTodo } from "$lib/globals";
    import {run} from "$lib/simulator"
    // setTimeout(()=>run(), 1000) // auto run the simulator
</script>

<button on:click={run}>
    Start Simulating and Dont spam :(
</button>
<br><br>

Fetch <br>
{$fetchingTaskDone} / {$fetchingTaskTodo} ({$fetchingTaskDone/$fetchingTaskTodo})
<br> <br>
Init <br>
{$initTasksDone} / {$initTasksTodo} ({$initTasksDone/$initTasksTodo})
<br> <br>
Work <br>
{$processTaskDone} / {$processTaskTodo}  ({$processTaskDone/$processTaskTodo})