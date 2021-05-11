import { apiClient } from "@/services/API/RootClient.js";

export default {
  async getAnalyticsAccessToken() {
    return apiClient().post(
      "/cubejs-token",
      {},
      { baseURL: process.env.VUE_APP_BACKEND_AUTH_URL }
    );
  },
};
