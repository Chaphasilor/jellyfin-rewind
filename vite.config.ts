import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), {
    // required for deno to exit properly after building
    name: "force-close",
    closeBundle() {
      if (process.env.NODE_ENV === "production") {
        setTimeout(() => process.exit(0), 100);
      }
    },
  }],
});
