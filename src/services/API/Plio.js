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

  async getPlio(plioId) {
    // returns the details for one plio
    return Promise.all([
      apiClient().get(process.env.VUE_APP_BACKEND_PLIOS + plioId),
      apiClient().get(process.env.VUE_APP_BACKEND_ITEMS + "?plio=" + plioId),
    ]).then(([plio, items]) => {
      // preparing plio details to be consumed by
      // the components
      var plioDetails = {};
      plioDetails.items = items.data;
      plioDetails.items.forEach((item) => {
        // convert to seconds
        // item.time = item.time / 1000;
        // convert str to int
        item.details.correct_answer = parseInt(item.details.correct_answer);
      });
      plioDetails.video_url = plio.data.video.url;
      plioDetails.plioTitle = plio.data.name;
      plioDetails.status = plio.data.status;
      plioDetails.updated_at = plio.data.updated_at;
      plioDetails.plioDBId = plio.data.id;
      return plioDetails;
    });
  },

  getAllPlios() {
    return apiClient().get(process.env.VUE_APP_BACKEND_PLIOS);
  },

  createPlio() {
    // creates a new draft plio
    var newPlioData = {
      created_by: 1,
    };
    return apiClient().post(process.env.VUE_APP_BACKEND_PLIOS, newPlioData);
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
