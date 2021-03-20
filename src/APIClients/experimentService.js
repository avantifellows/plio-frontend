import { apiClient } from "@/APIClients/rootAPIClient.js";

export default {
  getExperimentAssignment(experimentId, userId) {
    return apiClient().get(
      process.env.VUE_APP_BACKEND_EXPERIMENT_ASSIGNMENT +
        "?experimentId=" +
        experimentId +
        "&userId=" +
        userId
    );
  },
};
