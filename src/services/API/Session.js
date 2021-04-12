import { apiClient } from "@/services/API/RootClient.js";
import {
  sessionsEndpoint,
  sessionAnswersEndpoint,
} from "@/services/API/Endpoints.js";

export default {
  createSession(plioId, userId) {
    // creates a new session
    return apiClient()
      .post(sessionsEndpoint, {
        plio: plioId,
        user: userId,
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
};
