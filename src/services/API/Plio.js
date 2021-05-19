import { apiClient, analyticsAPIClient } from "@/services/API/RootClient.js";
import VideoAPIService from "@/services/API/Video.js";
import ItemAPIService from "@/services/API/Item.js";
import QuestionAPIService from "@/services/API/Question.js";
import {
  pliosEndpoint,
  itemsEndpoint,
  listPliosEndpoint,
  duplicatePlioEndpoint,
  plioDataDumpEndpoint,
} from "@/services/API/Endpoints.js";
import {
  uniqueUsersQuery,
  averageWatchTimeQuery,
  numQuestionsAnsweredQuery,
  percentageCompleteQuery,
  accuracyQuery,
  oneMinuteRetentionQuery,
  uniqueUsersListQuery,
} from "@/services/API/Queries/Plio.js";

export default {
  async getPlio(plioId, playMode = false) {
    // returns the details for one plio
    // playMode = true means that the plio is being fetched
    // to be played - in which case all public plios are accessible
    // to everyone. if playMode = false, a user can only get the
    // plios that they have created
    let plioEndpoint = pliosEndpoint + plioId;
    if (playMode) {
      plioEndpoint += "/play";
    }

    return Promise.all([
      apiClient().get(plioEndpoint),
      apiClient().get(itemsEndpoint, {
        params: { plio: plioId },
      }),
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

  getAllPlios(uuidOnly = false, pageNumber = undefined, searchString = "") {
    // returns all the plios (or just the flat list of uuids) created by the user
    // also fetches the plios at a given page number [if applicable]
    // also filters and fetches the plios that match the given search string [if applicable]
    var url = uuidOnly ? pliosEndpoint + listPliosEndpoint : pliosEndpoint;

    var queryParams = {};
    // add page number query param
    if (pageNumber != undefined && pageNumber >= 1)
      queryParams["page"] = pageNumber;
    // add search string query param
    if (searchString != undefined && searchString != "")
      queryParams["search"] = searchString;

    return apiClient().get(url, { params: queryParams });
  },

  createPlio() {
    // creates a new draft plio
    return apiClient().post(pliosEndpoint);
  },

  async updatePlio(plioValue, plioId) {
    // handle video, items and questions being updated
    plioValue.items.forEach((item) => {
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
      apiClient().put(pliosEndpoint + plioId, plioValue);
    });
  },

  duplicatePlio(plioId) {
    // create a clone of plioId plio
    return apiClient().post(pliosEndpoint + plioId + duplicatePlioEndpoint);
  },

  getPlioDataDump(plioId) {
    // get the data dump for the plio
    return apiClient().get(pliosEndpoint + plioId + plioDataDumpEndpoint, {
      responseType: "blob",
    });
  },

  async getUniqueUsersCount(plioId) {
    // get the count of unique users who watched the given plio
    // refer to this example: https://cube.dev/blog/vue-dashboard-tutorial-using-cubejs/
    // https://cube.dev/docs/@cubejs-client-core#result-set
    var resultSet = await analyticsAPIClient().load(uniqueUsersQuery(plioId));
    // https://cube.dev/docs/@cubejs-client-core#result-set-series-names
    var resultKey = resultSet.seriesNames().map((x) => x.key)[0];
    // https://cube.dev/docs/@cubejs-client-core#result-set-chart-pivot
    return resultSet.chartPivot()[0][resultKey];
  },

  async getUniqueUsersCountList(plioIds) {
    var resultSet = await analyticsAPIClient().load(
      uniqueUsersListQuery(plioIds)
    );

    // holds the mapping of plio ID to count
    var resultsMap = {};
    if (resultSet.series()[0] != undefined)
      resultSet.series()[0].series.forEach((seriesItem) => {
        resultsMap[seriesItem.x] = seriesItem.value;
      });

    // holds the final list of values to be returned
    var results = [];
    plioIds.forEach((plioId) => {
      // plios which do not have any sessions do not show up in
      // the resultMap - use a default value for those plios
      if (!(plioId in resultsMap)) results.push(0);
      else results.push(resultsMap[plioId]);
    });

    return results;
  },

  async getAverageWatchTime(plioId) {
    // get the average watch time for the given plio
    var resultSet = await analyticsAPIClient().load(
      averageWatchTimeQuery(plioId)
    );
    // extract the average watch time value
    var resultKey = resultSet.seriesNames().map((x) => x.key)[0];
    return resultSet.chartPivot()[0][resultKey];
  },

  async getNumQuestionsAnswered(plioId) {
    // get the average watch time for the given plio
    var resultSet = await analyticsAPIClient().load(
      numQuestionsAnsweredQuery(plioId)
    );
    // extract the value for number of questions answered
    var resultKey = resultSet.seriesNames().map((x) => x.key)[0];
    return resultSet.chartPivot()[0][resultKey];
  },

  async getPercentComplete(plioId) {
    // get the average watch time for the given plio
    var resultSet = await analyticsAPIClient().load(
      percentageCompleteQuery(plioId)
    );
    // extract the value for number of questions answered
    var resultKey = resultSet.seriesNames().map((x) => x.key)[0];
    return resultSet.chartPivot()[0][resultKey];
  },

  async getAccuracy(plioId) {
    // get the average watch time for the given plio
    var resultSet = await analyticsAPIClient().load(accuracyQuery(plioId));
    // extract the value for number of questions answered
    var resultKey = resultSet.seriesNames().map((x) => x.key)[0];
    return resultSet.chartPivot()[0][resultKey];
  },

  async getOneMinuteRetention(plioId) {
    // get the average watch time for the given plio
    var resultSet = await analyticsAPIClient().load(
      oneMinuteRetentionQuery(plioId)
    );
    // extract the value for number of questions answered
    var resultKey = resultSet.seriesNames().map((x) => x.key)[0];
    return resultSet.chartPivot()[0][resultKey];
  },
};
