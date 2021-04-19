import { apiClient } from "@/services/API/RootClient.js";
import {
  otpRequestEndpoint,
  otpVerifyEndpoint,
  userFromTokenEndpoint,
  usersEndpoint,
  userConfigEndpoint,
} from "@/services/API/Endpoints.js";

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
    return apiClient().post(process.env.VUE_APP_BACKEND_AUTH_URL, {
      grant_type: "convert_token",
      client_id: process.env.VUE_APP_BACKEND_API_CLIENT_ID,
      client_secret: process.env.VUE_APP_BACKEND_API_CLIENT_SECRET,
      backend: "google-oauth2",
      token: socialAuthToken,
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
};
