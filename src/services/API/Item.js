import { apiClient } from "@/services/API/RootClient.js";
import { itemsEndpoint, duplicateEndpoint } from "@/services/API/Endpoints.js";

export default {
  /**
   * Creates a new item with the given details
   * @param {Object} payload data required for creating the item
   * @returns {Promise}
   */
  createItem(payload) {
    return apiClient()
      .post(itemsEndpoint, payload)
      .then((response) => {
        return response.data;
      });
  },

  /**
   * updates the item corresponding to itemId with payload
   * @param {Number} itemId id of the item to be updated
   * @param {Object} payload data with which the item needs to be updated
   * @returns {Promise}
   */
  updateItem(itemId, payload) {
    return apiClient().put(itemsEndpoint + itemId, payload);
  },

  /**
   * deletes the item corresponding to itemId
   * @param {Number} itemId id of the item to be deleted
   * @returns {Promise}
   */
  deleteItem(itemId) {
    return apiClient().delete(itemsEndpoint + itemId);
  },

  /**
   * Duplicates the item corresponding to itemId and links the duplicated item to plioDBId
   * @param {Number} itemId id of the item to duplicate
   * @param {Number} plioDBId database id of the plio to which the newly created item should be linked
   * @returns {Promise}
   */
  duplicateItem(itemId, plioDBId) {
    return apiClient().post(itemsEndpoint + itemId + duplicateEndpoint, {
      plioId: plioDBId,
    });
  },
};
