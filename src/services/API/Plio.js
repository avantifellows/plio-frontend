import { apiClient } from "@/services/API/RootClient.js";
import {
  pliosEndpoint,
  duplicateEndpoint,
  plioDataDumpEndpoint,
  settingsEndpoint,
  plioMetricsEndpoint,
  copyEndpoint,
} from "@/services/API/Endpoints.js";
import Utilities from "@/services/Functional/Utilities.js";

export default {
  /**
   * returns the details for a plio
   * @param {Number} plioId - uuid of the plio to be fetched
   * @param {Boolean} playMode - if true, all public plios are accessible to everyone; otherwise, a user can only access the plios that they have created
   * @returns {Object} data corresponding to the plio
   */
  async getPlio(plioId, playMode = false) {
    let plioEndpoint = pliosEndpoint + plioId;
    if (playMode) {
      plioEndpoint += "/play";
    }

    return apiClient()
      .get(plioEndpoint)
      .then((plio) => {
        // prepares plio details to be consumed by the components
        let plioDetails = {};
        plioDetails.itemDetails = [];
        for (let item of plio.data.items) {
          /**
           * add every item's details to an itemDetails array
           * and then, remove those details from the item object
           */
          plioDetails.itemDetails.push(item.details);
          delete item.details;
        }
        plioDetails.items = plio.data.items;
        plioDetails.videoURL = plio.data.video.url;
        plioDetails.plioTitle = plio.data.name;
        plioDetails.status = plio.data.status;
        plioDetails.updatedAt = plio.data.updated_at;
        plioDetails.plioDBId = plio.data.id;
        plioDetails.videoDBId = plio.data.video.id || null;
        plioDetails.videoDuration = plio.data.video.duration || 0;
        plioDetails.config = plio.data.config;
        return plioDetails;
      });
  },

  /**
   * returns a list of plios that the user has created
   * @param {Number} pageNumber - if provided, it returns only the plios present at the given page number
   * @param {String} searchString - if provided, returns only the plios matching the search string
   * @param {String} sortBy - if provided, sorts the list of plios based on the ordering given
   * @returns
   */
  getAllPlios(pageNumber = undefined, searchString = "", sortBy = undefined) {
    let queryParams = {};
    // add page number query param
    if (pageNumber != undefined && pageNumber >= 1)
      queryParams["page"] = pageNumber;
    // add search string query param
    if (searchString != undefined && searchString != "")
      queryParams["search"] = searchString;
    // add sort by query param
    if (sortBy != undefined) queryParams["ordering"] = sortBy;

    return apiClient().get(pliosEndpoint, { params: queryParams });
  },

  /**
   * Update a plio's settings
   * @param {String} plioId - uuid of a plio
   * @param {Object} payload - JSON object that needs to be updated
   * @returns
   */
  updatePlioSettings(plioId, payload) {
    payload = Utilities.encodeMapToPayload(payload);
    return apiClient().patch(
      pliosEndpoint + plioId + settingsEndpoint,
      payload
    );
  },

  /**
   * creates a new draft plio
   * @returns {Promise}
   */
  createPlio() {
    return apiClient().post(pliosEndpoint);
  },

  /**
   * Patch a given plio with the given data
   * @param {Number} plioId - uuid of a plio
   * @param {Object} payload - data with which the plio needs to be updated
   */
  updatePlio(plioId, payload) {
    return apiClient().patch(pliosEndpoint + plioId, payload);
  },

  /**
   * creates a clone of the plio corresponding to plioId
   * @param {Number} plioId - uuid of the plio to be duplicated
   * @returns {Promise}
   */
  duplicatePlio(plioId) {
    return apiClient().post(pliosEndpoint + plioId + duplicateEndpoint);
  },

  /**
   * deletes the plio associated with the given plioId
   * @param {Number} plioId - uuid of the plio to be deleted
   * @returns {Promise}
   */
  deletePlio(plioId) {
    return apiClient().delete(pliosEndpoint + plioId);
  },

  /**
   * Copy a given plio to another workspace
   * @param {Number} plioId - uuid of the plio
   * @param {Object} payload - params required for copying the plio
   */
  copyToWorkspace(plioId, payload) {
    return apiClient().post(pliosEndpoint + plioId + copyEndpoint, payload);
  },

  /**
   * fetches the report for a plio
   * @param {Number} plioId - uuid of the plio for which the report is to be fetched
   * @returns {Promise}
   */
  getPlioReport(plioId) {
    return apiClient().get(pliosEndpoint + plioId + plioDataDumpEndpoint, {
      responseType: "blob",
    });
  },

  /**
   * fetches the metrics for a given plio
   * @param {Number} plioId - uuid of the plio for which the metrics need to be fetched
   * @returns {Promise}
   */
  async getMetrics(plioId) {
    return apiClient().get(pliosEndpoint + plioId + plioMetricsEndpoint);
  },
};
