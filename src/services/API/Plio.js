import { apiClient } from "@/services/API/RootClient.js";

export default {
  getPlioDetails(plioId, userId) {
    // returns the details for one plio-user session
    return apiClient().get(
      process.env.VUE_APP_BACKEND_PLIO_DETAILS +
        "?plioId=" +
        plioId +
        "&userId=" +
        userId
    );
  },

  getPlio(plioId) {
    // returns the details for one plio
    return apiClient().get(
      process.env.VUE_APP_BACKEND_PLIO_DETAILS +
        "?plioId=" +
        plioId +
        "&bucket=plio-test-data"
    );
  },

  getAllPlios() {
    return apiClient().get(process.env.VUE_APP_BACKEND_PLIOS);
  },

  createPlio() {
    // creates a new draft plio
    var newPlioData = {
      value: {
        status: "draft",
      },
      bucket: "plio-test-data",
    };
    return apiClient().post(
      process.env.VUE_APP_BACKEND_CREATE_PLIO,
      newPlioData
    );
  },
  updatePlio(value, plioId) {
    // creates a new draft plio
    var plioData = {
      value: value,
      plio_id: plioId,
      bucket: "plio-test-data",
    };
    return apiClient().post(process.env.VUE_APP_BACKEND_CREATE_PLIO, plioData);
  },
};
