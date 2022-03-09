import { apiClient } from "@/services/API/RootClient.js";
import { questionsEndpoint } from "@/services/API/Endpoints.js";

export default {
  /**
   * Creates a new question with the given details
   * @param {Object} payload - data required for creating the question
   */
  createQuestion(payload) {
    return apiClient()
      .post(questionsEndpoint, payload)
      .then((response) => {
        return response.data;
      });
  },

  /**
   * Patch a given question with the given data
   * @param {Number} questionId - id of the question to be updated
   * @param {Object} payload - data with which the question needs to be updated
   */
  updateQuestion(questionId, payload) {
    return apiClient().put(questionsEndpoint + questionId, payload);
  },
};
