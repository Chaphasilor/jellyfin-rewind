# Development

## Requirements

The [Deno](https://deno.com/) runtime, others might/should work but I build it
with Deno and havent tried others. Sooo yeah

## Setup

Install the required modules by doing `deno install --allow-scripts`

## Run

Run the dev server by doing `deno task dev`, this will also fix all problems
that might be detected by the VSC Svelte Extension because some code generation
stuff.

You can now click the link and see the wonderful Dev UI which is currently just
a button and three values, everything actually useful happens in the console
currently

## Format

just run `deno task format`

## File System

```
/src <------------------ Codebase
  /lib <---------------- Usually Server side code, this project doesn't allow server code so here are all important things for the Frontend
    /jellyfin
      /queries <-------- Gathering the data to later do funny math with to make nice statistics
        /api <---------- SQL Queries to the Playback Report plugin
        /local <-------- Place to do local processing
      index.ts <-------- The jellyfin interface/api thing
    /utility <--------- A collection of generally useful functions and classes
    globals.ts <-------- Globally used values
    types.ts <---------- All existing types in one place
  /routes <------------- The place where the frontend exists
    /welcome <---------- The landing page
    /login
    +layout.svelte <---- The layout of the whole site, will be useful later
    +layout.ts <-------- This is required to disable SSR (Server Side Rendering) to prevent the server from receiving sensitive data
    +page.svelte <------ The Homepage (currently placeholder)
    global.scss <------- The stylesheet
/static <--------------- Place for assets like pngs or svgs, in other words the "public" folder
.env <------------------ Login data for your jellyfin to make automated testing work
```

## Code and Logs

When a functions returns the universal `Result<T>` type it should do so via the
`logAndReturn(id: string, result:T)` functions, this way its easy to see where
something might have gone wrong but this function can take any datatype as
input, not just Result. The Goal is for any failed Result to be send to the UI
by moving up the callstack, this should make error management easier.

Here an example:

```ts
function game(): Result<boolean> {
    const number = Math.random();
    if (number < 0.5) {
        return logAndReturn('game', {
            success: false,
            reason: 'Number was too small',
        });
    }

    return logAndReturn('game', { success: true, data: number }); // data is optional
}
```

The output of this might be

```
[game] success: 0.859684783
```

Where `[game]` is gray and `success:` green

Or It might log

```
[game] failed: Number was too small
```

Where `[game]` is gray and `failed:` red

If the input isnt a Result object the function will print the following

```
[game] returned: true
```

Where `[game]` is gray and `returned:` pink/light-red and the returned value
will be a normal console.log() like print where you can interact with the object
n stuff

## Tests

Here an example:

```ts
let v = await game() // returns Result object;
if (!test('Random Game', v)) return;
console.log('All tests completed');
```

The output could be

```
{Random Game} success
```

Where `{Random Game}` is yellow and `success` is green

Or

```
{Random Game} failed: Number was too small
```

Where `{Random Game}` is yellow and `failed: Number was too small` is darkred

## Frontend

The frontend is just Svelte, if you never worked with it the most important
things are these:

#### 0. Hot reloading

Just works out of the box not problem as long as you dont use intervals

#### 1. reactive states

As you can see in the current `+page.svelte` there are variables prefixed by `$`
which means these variables are stores. When those stores get updated the ui
will automagicly update/rerender!

#### 2. Typescript

You can use typescript script blocks and import stuff from all other `.ts`
files!

#### 3. Components

Files like `ProgressBar.svelte` can be imported from anywhere, these contain
stuff like a normal `+page.svelte` but additionally have properties like
`progress`. This example file could look like

```svelte
<script lang="ts">
    export let progress: number
</script>

<div style="width: {progress}%">
```

And be Used like

```svelte
<script lang="ts">
    import Progress from './ProgressBar.svelte';
    let progress = 0;
</script>

<Progress {progress} />
<br />
<button
    on:click={() => {
        progress += 0.1;
    }}
/>
```

And you guessed it, clicking the button will lengthen the div!

## Current State

Currently the login flow works (welcome > login > rewind)

Though the rewind itself is highly temporary and currently only servers the purpose to debug the rewinding logic 