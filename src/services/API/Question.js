import { apiClient } from "@/services/API/RootClient.js";

export default {
  createQuestion(questionDetails) {
    // API to create a question in the DB
    return apiClient()
      .post(process.env.VUE_APP_BACKEND_QUESTIONS, questionDetails)
      .then((response) => {
        return response.data;
      });
  },

  updateQuestion(questionDetails) {
    // API to update a question in the DB
    return apiClient().put(
      process.env.VUE_APP_BACKEND_QUESTIONS + questionDetails.id + "/",
      questionDetails
    );
  },
};
