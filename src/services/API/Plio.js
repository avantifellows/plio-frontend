import { apiClient } from "@/services/API/RootClient.js";
import VideoService from "@/services/API/Video.js";
import ItemService from "@/services/API/Item.js";
import QuestionService from "@/services/API/Question.js";

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
      apiClient().get(process.env.VUE_APP_BACKEND_PLIOS + plioId + "/"),
      apiClient().get(process.env.VUE_APP_BACKEND_ITEMS + "?plio=" + plioId),
    ]).then(([plio, items]) => {
      // preparing plio details to be consumed by
      // the components
      var plioDetails = {};
      plioDetails.items = items.data;
      plioDetails.items.forEach((item) => {
        // convert to seconds
        item.time = item.time / 1000;
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
    return apiClient().get(process.env.VUE_APP_BACKEND_PLIOS);
  },

  createPlio() {
    // creates a new draft plio
    var newPlioData = {
      created_by: 1,
    };
    return apiClient().post(process.env.VUE_APP_BACKEND_PLIOS, newPlioData);
  },

  async updatePlio(value, plioId) {
    // handle items and questions being updated
    value.items.forEach((item) => {
      // pass a deepclone and not the reference
      var cloneDeep = require("lodash.clonedeep");
      var itemClone = cloneDeep(item);
      ItemService.updateItem(itemClone);
      QuestionService.updateQuestion(itemClone.details);
    });

    // prepare the payload for plio
    var plioObject = {};

    // handle (plio_title, status, created_by) being updated
    plioObject.name = value.plio_title;
    plioObject.status = value.status;
    plioObject.created_by = 1; // TODO - HARDCODED FOR NOW

    return new Promise((resolve) => {
      // handle video url/duration being updated
      var isVideoLinked = value.videoDBId != null;
      var isVideoURLEmpty = value.video_url == "";
      if (!isVideoURLEmpty) {
        var videoDetails = {
          url: value.video_url,
          duration: value.video_duration * 1000,
        };
        // create video and save the video db id
        if (!isVideoLinked) {
          VideoService.createVideo(videoDetails).then((createdVideoId) => {
            plioObject.video = createdVideoId;
            resolve(
              apiClient().put(
                process.env.VUE_APP_BACKEND_PLIOS + plioId + "/",
                plioObject
              )
            );
          });
        }
        // update video
        else {
          VideoService.updateVideo(value.videoDBId, videoDetails);
          resolve(
            apiClient().put(
              process.env.VUE_APP_BACKEND_PLIOS + plioId + "/",
              plioObject
            )
          );
        }
      }
    });
  },
};
