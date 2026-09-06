import { defineConfig, devices } from "@playwright/test";

// Un único config para ambas apps (client :3000, admin :3001). El prompt
// original proponía DOS archivos de config, cada uno con su propio
// `testDir`, pero el testDir del admin ("./e2e/admin") queda ANIDADO dentro
// del testDir del cliente ("./e2e") -- así que `playwright test` (config por
// defecto) recogería también las specs de admin y las correría con el
// baseURL/webServer del cliente (puerto equivocado). Los `projects` con
// testDir/baseURL propios evitan ese choque sin arrancar Playwright dos veces.
export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "client",
      testDir: "./e2e/client",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3000" },
    },
    {
      name: "admin",
      testDir: "./e2e/admin",
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3001" },
    },
  ],
  webServer: [
    {
      command: "pnpm --filter @proyecto-model/client dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "pnpm --filter @proyecto-model/admin dev",
      url: "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
