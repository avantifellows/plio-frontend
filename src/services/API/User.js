import { apiClient } from "@/services/API/RootClient.js";
import {
  otpRequestEndpoint,
  otpVerifyEndpoint,
  userFromTokenEndpoint,
  usersEndpoint,
  userConfigEndpoint,
  convertTokenEndpoint,
  refreshTokenEndpoint,
  externalAuthTokenEndpoint,
} from "@/services/API/Endpoints.js";
import store from "@/store";

export default {
  requestOtp(mobile) {
    // request OTP for login
    return apiClient().post(otpRequestEndpoint, {
      mobile,
    });
  },

  verifyOtp(mobile, otp) {
    // verify OTP for login
    return apiClient().post(otpVerifyEndpoint, {
      mobile,
      otp,
    });
  },

  async getUserByAccessToken(token) {
    // get user details from their access token
    return apiClient().get(userFromTokenEndpoint, {
      params: {
        token,
      },
    });
  },

  async convertSocialAuthToken(socialAuthToken) {
    // converts token from social auth to internal token
    return apiClient().post(
      convertTokenEndpoint,
      {
        grant_type: "convert_token",
        client_id: process.env.VUE_APP_BACKEND_API_CLIENT_ID,
        client_secret: process.env.VUE_APP_BACKEND_API_CLIENT_SECRET,
        backend: "google-oauth2",
        token: socialAuthToken,
      },
      { baseURL: process.env.VUE_APP_BACKEND_AUTH_URL }
    );
  },

  async generateExternalAuthToken(payload) {
    // convert third party auth token into Plio's internal token
    return apiClient().post(externalAuthTokenEndpoint, payload, {
      baseURL: process.env.VUE_APP_BACKEND_AUTH_URL,
    });
  },

  getUserConfig(userId) {
    // retrieves the config for the given user ID
    return apiClient().get(usersEndpoint + userId + userConfigEndpoint);
  },

  updateUserConfig(userId, userConfig) {
    // updates the config for the given user ID
    return apiClient().patch(usersEndpoint + userId + userConfigEndpoint, {
      config: userConfig,
    });
  },

  refreshAccessToken() {
    // uses the stored refresh token to request for a new access token
    return apiClient().post(
      refreshTokenEndpoint,
      {
        grant_type: "refresh_token",
        client_id: process.env.VUE_APP_BACKEND_API_CLIENT_ID,
        client_secret: process.env.VUE_APP_BACKEND_API_CLIENT_SECRET,
        refresh_token: store.state.auth.accessToken.refresh_token,
      },
      { baseURL: process.env.VUE_APP_BACKEND_AUTH_URL }
    );
  },
};
