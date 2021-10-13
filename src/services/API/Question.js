import { apiClient } from "@/services/API/RootClient.js";
import { questionsEndpoint } from "@/services/API/Endpoints.js";

export default {
  createQuestion(questionDetails) {
    // API to create a question in the DB
    return apiClient()
      .post(questionsEndpoint, questionDetails)
      .then((response) => {
        return response.data;
      });
  },

  /**
   * Patch a given question with the given data
   * @param {Number} questionId - The database id of a question
   * @param {Object} questionDetails - The payload containing the data that needs to be patched
   */
  updateQuestion(questionId, questionDetails) {
    // API to update a question in the DB
    var cloneDeep = require("lodash.clonedeep");
    var questionDetailsClone = cloneDeep(questionDetails);
    if ("image" in questionDetails && questionDetails["image"] != undefined) {
      var imageId = questionDetails["image"]["id"];
      questionDetailsClone["image"] = imageId;
    }
    return apiClient().put(
      questionsEndpoint + questionId,
      questionDetailsClone
    );
  },

  /**
   * creates a clone of the question corresponding to questionId and links it to the provided itemId
   * @param {Number} questionId id of the question to be duplicated
   * @param {Number} itemId id of the item to which the duplicated question should be linked
   * @returns
   */
  duplicateQuestion(questionId, itemId) {
    return apiClient().post(questionsEndpoint + questionId + "/duplicate/", {
      itemId: itemId,
    });
  },
};
