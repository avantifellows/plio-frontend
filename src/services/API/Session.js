import { apiClient } from "@/services/API/RootClient.js";
import { sessionsEndpoint } from "@/services/API/Endpoints.js";

export default {
  createSession(plioId, userId) {
    // creates a new session
    return apiClient()
      .post(sessionsEndpoint, {
        plio: plioId,
        user: userId,
      })
      .then((response) => {
        return response.data;
      });
  },
};
