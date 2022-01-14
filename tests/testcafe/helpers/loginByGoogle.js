import { ClientFunction, Role } from "testcafe";
const fetch = require("node-fetch");

const setWindowAccessToken = ClientFunction((data) =>
  window.__store__.dispatch("auth/setAccessToken", data)
);

export const googleAuthUser = Role(
  `${process.env.BROWSERSTACK_BASE_URL}/login`,
  async (t) => {
    await fetch("https://www.googleapis.com/oauth2/v4/token", {
      method: "POST",
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_OAUTH2_REFRESH_TOKEN,
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then(async (data) => {
        const { access_token: socialAuthToken } = data;

        await fetch(process.env.DJANGO_CONVERT_SOCIAL_AUTH_TOKEN_URL, {
          method: "POST",
          body: JSON.stringify({
            grant_type: "convert_token",
            client_id: process.env.DJANGO_DEFAULT_OAUTH2_CLIENT_ID,
            client_secret: process.env.DJANGO_DEFAULT_OAUTH2_CLIENT_SECRET,
            backend: "google-oauth2",
            token: socialAuthToken,
          }),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then(
            async (data) => {
              await setWindowAccessToken(data);
            },
            () => {}
          );
      });
  }
);
