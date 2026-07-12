// Throwaway spike config for avantifellows/plio-backend#371. Never merge.
const { defineConfig } = require("@playwright/test");

// Browser leg of the spike matrix, driven by the workflow:
//   chromium — Playwright's bundled Chromium (no proprietary H.264/AAC codecs;
//              YouTube usually serves VP9, so it MAY work — that's spike data)
//   chrome   — Google Chrome stable via channel:'chrome' (preinstalled on
//              ubuntu-latest; full codec support — the recommended media path)
const SPIKE_BROWSER = process.env.SPIKE_BROWSER || "chromium";

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: "playback.spec.js",
  timeout: 180000,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: SPIKE_BROWSER,
      use: {
        browserName: "chromium",
        ...(SPIKE_BROWSER === "chrome" ? { channel: "chrome" } : {}),
        headless: true,
        launchOptions: {
          // Survey finding (#371): Playwright does not pass Chromium's
          // autoplay flag by default; TestCafe/Cypress do. Playwright's
          // defaults already disable background throttling — no extra flags.
          args: ["--autoplay-policy=no-user-gesture-required"],
        },
      },
    },
  ],
  webServer: {
    // The harness must be served over http://localhost (never file://) so the
    // YouTube embed sees a proper referrer — Nov-2025 enforcement returns
    // Error 153 on missing/blocked referrers. python3's http.server sends no
    // Referrer-Policy header (do NOT add one). python3 is present on
    // ubuntu-latest and avoids extra npm deps.
    command: "python3 -m http.server 4173",
    cwd: __dirname,
    url: "http://localhost:4173/harness.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
