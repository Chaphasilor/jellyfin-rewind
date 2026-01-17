// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  // VSCode says Deno isn't available inside +page.svelte files, which is wrong
  declare const Deno: {
    env: {
      get: (key: string) => string;
    };
  };
}

export {};
