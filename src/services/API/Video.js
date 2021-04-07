import { apiClient } from "@/services/API/RootClient.js";

export default {
  async createVideo(videoDetails) {
    // API to create a video object in the DB
    var response = await apiClient().post(
      process.env.VUE_APP_BACKEND_VIDEOS,
      videoDetails
    );
    return response.data.id;
  },

  updateVideo(videoDBId, videoDetails) {
    // API to update a video object in the DB
    return apiClient().patch(
      process.env.VUE_APP_BACKEND_VIDEOS + videoDBId + "/",
      videoDetails
    );
  },
};
