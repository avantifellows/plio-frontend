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
  settingsEndpoint,
} from "@/services/API/Endpoints.js";
import SettingsUtilities from "@/services/Functional/Utilities/Settings.js";
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
    // if a refresh token exists locally,
    // use the stored refresh token to request for a new access token
    if (store.getters["auth/isRefreshTokenPresent"]) {
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
    }

    return Promise.reject("Refresh token not found in local storage");
  },

  /**
   * @param {Number} userId - id of the user whose settings need to be updated
   * @param {Map} payload - the new value for settings
   */
  updateUserSettings(userId, payload) {
    payload = SettingsUtilities.encodeMapToPayload(payload);
    return apiClient().patch(
      usersEndpoint + userId + settingsEndpoint,
      payload
    );
  },
};
