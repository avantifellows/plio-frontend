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
        // convert string answers to int
        var sessionDetails = response.data;
        sessionDetails.session_answers.forEach((sessionAnswer) => {
          if (sessionAnswer.answer != null)
            sessionAnswer.answer = parseInt(sessionAnswer.answer);
        });
        return sessionDetails;
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

  getUniqueUsersCount(plioId) {
    // get the count of unique users who watched the given plio
    return apiClient().get(sessionsEndpoint + "unique_users", {
      params: { plio: plioId },
    });
  },
};
