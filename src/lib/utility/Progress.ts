import { writable } from "svelte/store";

export class Progress {
  name: string;
  max = writable(0);
  current = writable(0);
  constructor(name: string) {
    this.name = name;
  }
  setMax(max: number) {
    this.max.set(max);
    this.current.set(0);
  }
  async next(skipUiUpdate: boolean = false) {
    this.current.update((x) => x + 1);

    if (!skipUiUpdate) {
      if (Math.random() > 0.95) {
        await new Promise((r) => setTimeout(r, 1)); // give Ui time to update
      }
    }
  }
  reset() {
    this.max.set(0);
    this.current.set(0);
  }
}
