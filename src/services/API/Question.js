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

  updateQuestion(questionDetails) {
    // API to update a question in the DB
    var cloneDeep = require("lodash.clonedeep");
    var questionDetailsClone = cloneDeep(questionDetails);
    if ("image" in questionDetails && questionDetails["image"] != undefined) {
      var imageId = questionDetails["image"]["id"];
      questionDetailsClone["image"] = imageId;
    }
    return apiClient().put(
      questionsEndpoint + questionDetails.id,
      questionDetailsClone
    );
  },

  duplicateQuestion(questionId, itemId) {
    // create a clone of questionId and link it to the provided "itemId"
    return apiClient().post(questionsEndpoint + questionId + "/duplicate/", {
      itemId: itemId,
    });
  },
};
