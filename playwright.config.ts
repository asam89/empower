import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
export const E2E_DEMO_CODE = "e2e-demo-code";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      DEMO_ACCESS_CODE: E2E_DEMO_CODE,
      ADMIN_USERNAME: "e2e-admin",
      ADMIN_PASSWORD: "e2e-password-not-real",
    },
  },
});
