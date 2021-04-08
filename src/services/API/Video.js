import { apiClient } from "@/services/API/RootClient.js";
import { videosEndpoint } from "@/services/API/Endpoints.js";

export default {
  async createVideo(videoDetails) {
    // API to create a video object in the DB
    var response = await apiClient().post(videosEndpoint, videoDetails);
    return response;
  },

  updateVideo(videoDBId, videoDetails) {
    // API to update a video object in the DB
    return apiClient().put(videosEndpoint + videoDBId + "/", videoDetails);
  },
};
