const base = require("@playwright/test");

const analyticsDomains = ["mixpanel.com", "mxpnl.com"];

const test = base.test.extend({
  blockAnalytics: [
    async ({ context }, use) => {
      await context.route(
        (url) =>
          analyticsDomains.some(
            (domain) =>
              url.hostname === domain || url.hostname.endsWith(`.${domain}`)
          ),
        (route) => route.abort()
      );
      await use();
    },
    { auto: true },
  ],
});

module.exports = { test, expect: base.expect };
