import { defineConfig } from "cypress";

// E2E runs locally against a running dev/preview server (not wired into CI).
// Start the app first: `npm run dev`, then `npm run e2e` or `npm run e2e:open`.
export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    supportFile: false,
    fixturesFolder: "cypress/fixtures",
    specPattern: "cypress/e2e/**/*.cy.ts",
    video: false,
    viewportWidth: 1280,
    viewportHeight: 800,
  },
});
