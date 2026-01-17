type FN = {
  call: (a: unknown, e: Event) => unknown;
};
export function preventDefault(fn?: FN) {
  return (event: Event) => {
    event.preventDefault();
    // @ts-expect-error idk why "this" makes TS cry but svelte migration guided did it like this, so it must be fine
    if (fn) fn.call(this, event);
  };
}
export function stopPropagation(fn?: FN) {
  return (event: Event) => {
    event.stopPropagation();
    // @ts-expect-error idk why "this" makes TS cry but svelte migration guided did it like this, so it must be fine
    if (fn) fn.call(this, event);
  };
}
