import { apiClient } from "@/services/API/RootClient.js";
import axios from "axios";

export default {
  postUserResponse(userResponse) {
    return apiClient().post(
      process.env.VUE_APP_BACKEND_UPDATE_ENTRY,
      userResponse
    );
  },

  requestOtp(mobile) {
    return apiClient().post(process.env.VUE_APP_BACKEND + "/otp/request", {
      mobile,
    });
  },

  verifyOtp(mobile, otp) {
    return apiClient().post(process.env.VUE_APP_BACKEND + "/otp/verify", {
      mobile,
      otp,
    });
  },

  async getUserByAccessToken(token) {
    return apiClient().post(process.env.VUE_APP_BACKEND + "/users/token", {
      token,
    });
  },

  async convertSocialAuthToken(socialAuthToken) {
    return await axios.post(process.env.VUE_APP_BACKEND_AUTH_URL, {
      grant_type: "convert_token",
      client_id: process.env.VUE_APP_BACKEND_API_CLIENT_ID,
      client_secret: process.env.VUE_APP_BACKEND_API_CLIENT_SECRET,
      backend: "google-oauth2",
      token: socialAuthToken,
    });
  },

  loginUser(userCreds) {
    return apiClient().post(process.env.VUE_APP_BACKEND_LOGIN_USER, userCreds);
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
