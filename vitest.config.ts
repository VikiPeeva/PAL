import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts: that config is shaped around the Tauri
// dev server (fixed port, HMR host, src-tauri watch rules), none of which
// applies to a test run.
export default defineConfig({
  test: {
    // parseXes and parsePnml use DOMParser, so tests need a real DOM.
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
