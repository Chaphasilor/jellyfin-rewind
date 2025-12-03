import { defineConfig } from 'vite';
import * as child from 'node:child_process';

const commitHash = child.execSync("git rev-parse --short HEAD").toString().trim()

export default defineConfig({
  define: {
    __COMMITHASH__: JSON.stringify(commitHash),
  }
})

console.log(`commitHash:`, commitHash)
