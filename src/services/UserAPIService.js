import { apiClient } from "@/services/RootApiClient.js";

export default {
  postUserResponse(userResponse) {
    return apiClient().post(
      process.env.VUE_APP_BACKEND_UPDATE_ENTRY,
      userResponse
    );
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
