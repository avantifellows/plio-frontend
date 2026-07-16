const { defineConfig } = require("@playwright/test");
require("dotenv").config({ quiet: true });
const { authFile } = require("./tests/e2e/helpers/auth");

const baseURL = process.env.VUE_APP_FRONTEND || "http://localhost:8080";

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
      testIgnore: /sso-learner-entry\.spec\.js/,
      use: { browserName: "chromium", storageState: authFile },
      dependencies: ["setup"],
    },
    {
      name: "sso",
      testMatch: /sso-learner-entry\.spec\.js/,
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run serve",
    url: baseURL,
    reuseExistingServer: true,
  },
});
