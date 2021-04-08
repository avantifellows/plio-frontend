import { apiClient } from "@/services/API/RootClient.js";

export default {
  createSession(plioId, userId) {
    // creates a new session
    return apiClient().post(process.env.VUE_APP_BACKEND_PLIOS, {
      plio: plioId,
      user: userId,
    });
  },
};
