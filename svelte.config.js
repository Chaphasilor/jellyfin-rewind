import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import * as child from "node:child_process";

function getCommitHash() {
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA;
  }

  if (process.env.CI_COMMIT_SHORT_SHA) {
    return process.env.CI_COMMIT_SHORT_SHA;
  }

  if (process.env.VITE_COMMIT_HASH) {
    return process.env.VITE_COMMIT_HASH;
  }

  try {
    return child.execSync("git rev-parse --short HEAD").toString().trim();
  } catch (e) {
    console.warn("Cannot retrieve git commit hash:", e.message);
    return "unknown";
  }
}

const commitHash = getCommitHash().substring(0, 7);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    version: {
      name: commitHash,
    },
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      precompress: true,
      strict: true,
      pages: "dist",
    }),
  },
};

export default config;
