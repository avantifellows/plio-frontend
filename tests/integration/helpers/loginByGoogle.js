import { ClientFunction, Role } from "testcafe";
const axios = require("axios");

const setWindowAccessToken = ClientFunction((data) =>
  window.__store__.dispatch("auth/setAccessToken", data)
);

export const googleAuthUser = Role(
  `${process.env.BROWSERSTACK_BASE_URL}/login`,
  async (testcafe) => {
    let headers = { "Content-Type": "application/json" };
    await axios
      .post(
        "https://www.googleapis.com/oauth2/v4/token",
        JSON.stringify({
          grant_type: "refresh_token",
          client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID,
          client_secret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
          refresh_token: process.env.GOOGLE_OAUTH2_REFRESH_TOKEN,
        }),
        { headers }
      )
      .then(async (response) => {
        const socialAuthToken = response.data.access_token;

        await axios
          .post(
            process.env.BACKEND_CONVERT_SOCIAL_AUTH_TOKEN_URL,
            JSON.stringify({
              grant_type: "convert_token",
              client_id: process.env.BACKEND_DEFAULT_OAUTH2_CLIENT_ID,
              client_secret: process.env.BACKEND_DEFAULT_OAUTH2_CLIENT_SECRET,
              backend: "google-oauth2",
              token: socialAuthToken,
            }),
            { headers }
          )
          .then(async (response) => {
            await setWindowAccessToken(response.data);
          });
      });
  }
);
