import { apiClient } from "@/services/API/RootClient.js";
import { videosEndpoint } from "@/services/API/Endpoints.js";

export default {
  /**
   * Creates a new video with the given details
   * @param {Object} payload - data required for creating the video
   * @returns {Promise}
   */
  async createVideo(payload) {
    var response = await apiClient().post(videosEndpoint, payload);
    return response;
  },

  /**
   * Patch a given video with the given data
   * @param {Number} videoDBId - database id of the video
   * @param {Object} payload - data with which the video needs to be updated
   */
  updateVideo(videoDBId, payload) {
    return apiClient().patch(videosEndpoint + videoDBId, payload);
  },
};
