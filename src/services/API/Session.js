import { apiClient } from "@/services/API/RootClient.js";
import {
  sessionsEndpoint,
  sessionAnswersEndpoint,
} from "@/services/API/Endpoints.js";

export default {
  createSession(plioId) {
    // creates a new session
    return apiClient()
      .post(sessionsEndpoint, {
        plio: plioId,
      })
      .then((response) => {
        return response.data;
      });
  },

  updateSession(sessionId, sessionDetails) {
    // updates a session
    return apiClient().put(sessionsEndpoint + sessionId, sessionDetails);
  },

  updateSessionAnswer(sessionAnswerDetails) {
    // updates a session's answer
    return apiClient().put(
      sessionAnswersEndpoint + sessionAnswerDetails.id,
      sessionAnswerDetails
    );
  },
};
