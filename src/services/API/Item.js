import { apiClient } from "@/services/API/RootClient.js";
import { itemsEndpoint, duplicateEndpoint } from "@/services/API/Endpoints.js";

export default {
  createItem(itemDetails) {
    // API to create an item in the DB
    return apiClient()
      .post(itemsEndpoint, itemDetails)
      .then((response) => {
        return response.data;
      });
  },

  updateItem(itemId, itemDetails) {
    // API to update an item in the DB
    return apiClient().put(itemsEndpoint + itemId, itemDetails);
  },

  deleteItem(itemId) {
    return apiClient().delete(itemsEndpoint + itemId);
  },

  duplicateItem(itemId, plioDBId) {
    // Create a clone of itemId and link it to the provided plio's DB ID
    return apiClient().post(itemsEndpoint + itemId + duplicateEndpoint, {
      plioId: plioDBId,
    });
  },
};
