import { apiClient } from "@/services/API/RootClient.js";
import VideoAPIService from "@/services/API/Video.js";
import ItemAPIService from "@/services/API/Item.js";
import QuestionAPIService from "@/services/API/Question.js";
import { pliosEndpoint, itemsEndpoint } from "@/services/API/Endpoints.js";

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
      apiClient().get(pliosEndpoint + plioId + "/"),
      apiClient().get(itemsEndpoint + "?plio=" + plioId),
    ]).then(([plio, items]) => {
      // preparing plio details to be consumed by
      // the components
      var plioDetails = {};
      plioDetails.items = items.data;
      plioDetails.items.forEach((item) => {
        // convert str to int
        item.details.correct_answer = parseInt(item.details.correct_answer);
      });
      plioDetails.video_url = plio.data.video.url;
      plioDetails.plioTitle = plio.data.name;
      plioDetails.status = plio.data.status;
      plioDetails.updated_at = plio.data.updated_at;
      plioDetails.plioDBId = plio.data.id;
      plioDetails.videoDBId = plio.data.video.id || null;
      return plioDetails;
    });
  },

  getAllPlios() {
    return apiClient().get(pliosEndpoint);
  },

  createPlio() {
    // creates a new draft plio
    var newPlioData = {
      created_by: 1,
    };
    return apiClient().post(pliosEndpoint, newPlioData);
  },

  async updatePlio(plioValue, plioId) {
    // var cloneDeep = require("lodash.clonedeep");

    // handle items and questions being updated
    plioValue.items.forEach((item) => {
      // pass a deepclone and not the reference
      // var itemClone = cloneDeep(item);
      ItemAPIService.updateItem(item);
      QuestionAPIService.updateQuestion(item.details);
    });

    // handle video url/duration being updated
    var isVideoLinked = plioValue.videoDBId != null;
    var videoDetails = {
      url: plioValue.url,
      duration: plioValue.duration,
    };

    return new Promise((resolve) => {
      if (!isVideoLinked) {
        // create video and save the video db id
        VideoAPIService.createVideo(videoDetails).then((createdVideo) => {
          plioValue.video = createdVideo.data.id;
          resolve();
        });
      } else {
        // update the video object with the new details
        VideoAPIService.updateVideo(plioValue.videoDBId, videoDetails);
        resolve();
      }
    }).then(() => {
      apiClient().put(pliosEndpoint + plioId + "/", plioValue);
    });
  },
};
