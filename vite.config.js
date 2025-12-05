import { defineConfig } from 'vite';
import * as child from 'node:child_process';

function getCommitHash() {
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA.substring(0, 7)
  }
  
  if (process.env.CI_COMMIT_SHORT_SHA) {
    return process.env.CI_COMMIT_SHORT_SHA
  }
  
  if (process.env.VITE_COMMIT_HASH) {
    return process.env.VITE_COMMIT_HASH
  }

  try {
    return child.execSync('git rev-parse --short HEAD').toString().trim()
  } catch (e) {
    console.warn('Cannot retrieve git commit hash:', e.message)
    return 'unknown'
  }
}


const commitHash = getCommitHash()

export default defineConfig({
  define: {
    __COMMITHASH__: JSON.stringify(commitHash),
  }
})

console.log(`commitHash:`, commitHash)
