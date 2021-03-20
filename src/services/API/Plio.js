import { apiClient } from "@/services/API/RootClient.js";

export default {
  getPlioDetails(plioId, userId) {
    return new Promise((resolve) => {
      var response = apiClient().get(
        process.env.VUE_APP_BACKEND_PLIO_DETAILS +
          "?plioId=" +
          plioId +
          "&userId=" +
          userId
      );
      resolve(response);
    });
  },

  getAllPlios() {
    return apiClient().get(process.env.VUE_APP_BACKEND_PLIOS_LIST);
  },
};
