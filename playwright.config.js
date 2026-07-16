const { defineConfig } = require("@playwright/test");
require("dotenv").config({ quiet: true });

const baseURL = process.env.VUE_APP_FRONTEND || "http://localhost:8080";
const authFile = "playwright/.auth/user.json";

module.exports = defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL, headless: true },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.js/,
    },
    {
      name: "chromium",
      testMatch: /journeys\/.*\.spec\.js/,
      use: { browserName: "chromium", storageState: authFile },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run serve",
    url: baseURL,
    reuseExistingServer: true,
  },
});
