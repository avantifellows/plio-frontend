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
    return apiClient().put(
      questionsEndpoint + questionDetails.id,
      questionDetails
    );
  },

  duplicateQuestion(questionId) {
    // create a clone of question with questionId
    return apiClient().post(questionsEndpoint + questionId + "/duplicate");
  },
};
