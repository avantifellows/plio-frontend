import { apiClient } from "@/services/API/RootClient.js";
import {
  questionsEndpoint,
  duplicateEndpoint,
} from "@/services/API/Endpoints.js";

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

  /**
   * creates a clone of the question corresponding to questionId and links it to the provided itemId
   * @param {Number} questionId - id of the question to be duplicated
   * @param {Number} itemId - id of the item to which the duplicated question should be linked
   */
  duplicateQuestion(questionId, itemId) {
    return apiClient().post(
      questionsEndpoint + questionId + duplicateEndpoint,
      {
        itemId: itemId,
      }
    );
  },
};
