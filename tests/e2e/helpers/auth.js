const path = require("path");

const authFile = path.resolve("playwright/.auth/user.json");

async function getPlioAccessToken(request) {
  const requiredEnv = [
    "GOOGLE_OAUTH2_CLIENT_ID",
    "GOOGLE_OAUTH2_CLIENT_SECRET",
    "GOOGLE_OAUTH2_REFRESH_TOKEN",
    "VUE_APP_BACKEND_AUTH_URL",
    "VUE_APP_BACKEND_API_CLIENT_ID",
    "VUE_APP_BACKEND_API_CLIENT_SECRET",
  ];
  const missingEnv = requiredEnv.filter((name) => !process.env[name]);
  if (missingEnv.length) {
    throw new Error(
      `Missing e2e environment variables: ${missingEnv.join(", ")}`
    );
  }

  const googleResponse = await request.post(
    "https://oauth2.googleapis.com/token",
    {
      form: {
        grant_type: "refresh_token",
        client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_OAUTH2_REFRESH_TOKEN,
      },
    }
  );
  if (!googleResponse.ok()) {
    throw new Error(`Google token mint failed with ${googleResponse.status()}`);
  }

  const { access_token: googleAccessToken } = await googleResponse.json();
  const convertResponse = await request.post(
    `${process.env.VUE_APP_BACKEND_AUTH_URL}/convert-token/`,
    {
      data: {
        grant_type: "convert_token",
        client_id: process.env.VUE_APP_BACKEND_API_CLIENT_ID,
        client_secret: process.env.VUE_APP_BACKEND_API_CLIENT_SECRET,
        backend: "google-oauth2",
        token: googleAccessToken,
      },
    }
  );
  if (!convertResponse.ok()) {
    throw new Error(
      `Backend token conversion failed with ${convertResponse.status()}`
    );
  }

  return convertResponse.json();
}

module.exports = { authFile, getPlioAccessToken };
