import { apiClient, analyticsAPIClient } from "@/services/API/RootClient.js";
import {
  pliosEndpoint,
  listPliosEndpoint,
  duplicateEndpoint,
  plioDataDumpEndpoint,
} from "@/services/API/Endpoints.js";
import {
  dashboardSessionMetricsQuery,
  oneMinuteRetentionQuery,
  dashboardSessionAnswerMetricsQuery,
  uniqueUsersListQuery,
} from "@/services/API/Queries/Plio.js";

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
        return plioDetails;
      });
  },

  /**
   * returns a list of plios that the user has created
   * @param {Boolean} uuidOnly - whether to return only UUIDs instead of the details for each plio
   * @param {Number} pageNumber - if provided, it returns only the plios present at the given page number
   * @param {String} searchString - if provided, returns only the plios matching the search string
   * @param {String} sortBy - if provided, sorts the list of plios based on the ordering given
   * @returns
   */
  getAllPlios(
    uuidOnly = false,
    pageNumber = undefined,
    searchString = "",
    sortBy = undefined
  ) {
    var url = uuidOnly ? pliosEndpoint + listPliosEndpoint : pliosEndpoint;

    var queryParams = {};
    // add page number query param
    if (pageNumber != undefined && pageNumber >= 1)
      queryParams["page"] = pageNumber;
    // add search string query param
    if (searchString != undefined && searchString != "")
      queryParams["search"] = searchString;
    // add sort by query param
    if (sortBy != undefined) queryParams["ordering"] = sortBy;

    return apiClient().get(url, { params: queryParams });
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
   * fetches the number of unique users who have watched each plio given a list of plio ids
   * @param {Array} plioIds - list of plio uuids for whom the count needs to be fetched
   * @returns {Array}
   */
  async getUniqueUsersCountList(plioIds) {
    if (plioIds.length == 0) return [];

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

  /**
   * fetches the dashboard metrics for the given plio
   * @param {Number} plioId - uuid of the plio for which the metrics need to be fetched
   * @returns {Object} key-value pairs of metrics
   */
  async getDashboardMetrics(plioId) {
    var metrics = {};

    // get session level metrics (except 1-minute retention)
    var resultSet = await analyticsAPIClient().load(
      dashboardSessionMetricsQuery(plioId)
    );
    var resultKeys = resultSet.seriesNames().map((x) => x.key);
    var resultChartPivot = resultSet.chartPivot()[0];
    resultKeys.forEach((key) => {
      metrics[key] = resultChartPivot[key];
    });

    /**
     * get 1-minute retention separately as this value becomes NaN
     * for some users and while calculating the average, those rows are
     * omitted; this affects the calculation of the total number of unique
     * viewers;
     */
    resultSet = await analyticsAPIClient().load(
      oneMinuteRetentionQuery(plioId)
    );
    resultKeys = resultSet.seriesNames().map((x) => x.key);
    resultChartPivot = resultSet.chartPivot()[0];
    resultKeys.forEach((key) => {
      metrics[key] = resultChartPivot[key];
    });

    // get session answer level metrics
    resultSet = await analyticsAPIClient().load(
      dashboardSessionAnswerMetricsQuery(plioId)
    );
    resultKeys = resultSet.seriesNames().map((x) => x.key);
    resultChartPivot = resultSet.chartPivot()[0];
    resultKeys.forEach((key) => {
      metrics[key] = resultChartPivot[key];
    });
    return metrics;
  },
};
