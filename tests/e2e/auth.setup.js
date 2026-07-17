const { test: setup } = require("./fixtures/test");
const fs = require("fs");
const path = require("path");
const { authFile, getPlioAccessToken } = require("./helpers/auth");

setup("authenticate with Google", async ({ page, request }) => {
  const plioAccessToken = await getPlioAccessToken(request);
  await page.goto("/login");
  await page.evaluate(
    (token) => window.__store__.dispatch("auth/setAccessToken", token),
    plioAccessToken
  );
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
