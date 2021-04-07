import { apiClient } from "@/services/API/RootClient.js";

export default {
  createSession(plioId, userId) {
    // creates a new session
    var newPlioData = {
      created_by: 1,
    };
    return apiClient().post(process.env.VUE_APP_BACKEND_PLIOS, newPlioData);
  },
};
