import { apiClient } from "@/services/API/RootClient.js";

export default {
  getPlioDetails(plioId, userId) {
    // returns the details for one plio-user session
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
    // returns the list of all plios
    return apiClient().get(process.env.VUE_APP_BACKEND_PLIOS_LIST);
  },

  createPlio() {
    // creates a new draft plio
    var newPlioData = {
      value: {
        status: "draft",
      },
      bucket: "plio-test-data",
    };
    console.log(newPlioData);
    return apiClient().post(
      process.env.VUE_APP_BACKEND_CREATE_PLIO,
      newPlioData
    );
  },
};
