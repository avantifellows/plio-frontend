import { apiClient } from "@/services/API/RootClient.js";
import { itemsEndpoint } from "@/services/API/Endpoints.js";

export default {
  createItem(itemDetails) {
    // API to create an item in the DB
    return apiClient()
      .post(itemsEndpoint, itemDetails)
      .then((response) => {
        return response.data;
      });
  },

  updateItem(itemDetails) {
    // API to update an item in the DB
    return apiClient().put(itemsEndpoint + itemDetails.id, itemDetails);
  },

  deleteItem(itemId) {
    return apiClient().delete(itemsEndpoint + itemId);
  },
};
