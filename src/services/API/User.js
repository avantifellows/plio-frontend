import { apiClient } from "@/services/API/RootClient.js";
import {
  otpRequestEndpoint,
  otpVerifyEndpoint,
  userFromTokenEndpoint,
} from "@/services/API/Endpoints.js";

export default {
  postUserResponse(userResponse) {
    return apiClient().post(
      process.env.VUE_APP_BACKEND_UPDATE_ENTRY,
      userResponse
    );
  },

  requestOtp(mobile) {
    return apiClient().post(process.env.VUE_APP_BACKEND + otpRequestEndpoint, {
      mobile,
    });
  },

  verifyOtp(mobile, otp) {
    return apiClient().post(process.env.VUE_APP_BACKEND + otpVerifyEndpoint, {
      mobile,
      otp,
    });
  },

  async getUserByAccessToken(token) {
    return apiClient().get(
      process.env.VUE_APP_BACKEND + userFromTokenEndpoint,
      {
        params: {
          token,
        },
      }
    );
  },

  async convertSocialAuthToken(socialAuthToken) {
    // converts token from social auth to internal token
    return apiClient().post(process.env.VUE_APP_BACKEND_AUTH_URL, {
      grant_type: "convert_token",
      client_id: process.env.VUE_APP_BACKEND_API_CLIENT_ID,
      client_secret: process.env.VUE_APP_BACKEND_API_CLIENT_SECRET,
      backend: "google-oauth2",
      token: socialAuthToken,
    });
  },

  getUserConfig(userId) {
    return apiClient().get(
      process.env.VUE_APP_BACKEND_USER_CONFIG + "?user-id=" + userId
    );
  },

  updateUserConfig(userConfig) {
    return apiClient().post(
      process.env.VUE_APP_BACKEND_UPDATE_USER_CONFIG,
      userConfig
    );
  },
};
