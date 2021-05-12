import { apiClient } from "@/services/API/RootClient.js";
import { analyticsAccessTokenEndpoint } from "@/services/API/Endpoints.js";

export default {
  async getAnalyticsAccessToken() {
    // fetches the access token to make API calls to the CubeJS analytics
    return apiClient().post(
      analyticsAccessTokenEndpoint,
      {},
      { baseURL: process.env.VUE_APP_BACKEND_AUTH_URL }
    );
  },
};
