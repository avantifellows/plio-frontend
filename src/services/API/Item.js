import { apiClient } from "@/services/API/RootClient.js";

export default {
  createItem(itemDetails) {
    // API to create an item in the DB
    // converting time from seconds to milliseconds
    itemDetails.time = itemDetails.time * 1000;
    return apiClient()
      .post(process.env.VUE_APP_BACKEND_ITEMS, itemDetails)
      .then((response) => {
        response.data.time = response.data.time / 1000;
        return response.data;
      });
  },

  updateItem(itemDetails) {
    // API to update an item in the DB
    itemDetails.time = itemDetails.time * 1000;
    return apiClient().put(
      process.env.VUE_APP_BACKEND_ITEMS + itemDetails.id + "/",
      itemDetails
    );
  },
};
