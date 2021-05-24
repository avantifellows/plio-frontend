"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = void 0;

var _RootClient = require("@/services/API/RootClient.js");

var _Video = _interopRequireDefault(require("@/services/API/Video.js"));

var _Item = _interopRequireDefault(require("@/services/API/Item.js"));

var _Question = _interopRequireDefault(require("@/services/API/Question.js"));

var _Endpoints = require("@/services/API/Endpoints.js");

var _Plio = require("@/services/API/Queries/Plio.js");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _slicedToArray(arr, i) {
  return (
    _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest()
  );
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _iterableToArrayLimit(arr, i) {
  if (
    !(
      Symbol.iterator in Object(arr) ||
      Object.prototype.toString.call(arr) === "[object Arguments]"
    )
  ) {
    return;
  }
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (
      var _i = arr[Symbol.iterator](), _s;
      !(_n = (_s = _i.next()).done);
      _n = true
    ) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

var _default = {
  getPlio: function getPlio(plioId) {
    var playMode,
      plioEndpoint,
      _args = arguments;
    return regeneratorRuntime.async(function getPlio$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            playMode =
              _args.length > 1 && _args[1] !== undefined ? _args[1] : false;
            // returns the details for one plio
            // playMode = true means that the plio is being fetched
            // to be played - in which case all public plios are accessible
            // to everyone. if playMode = false, a user can only get the
            // plios that they have created
            plioEndpoint = _Endpoints.pliosEndpoint + plioId;

            if (playMode) {
              plioEndpoint += "/play";
            }

            return _context.abrupt(
              "return",
              Promise.all([
                (0, _RootClient.apiClient)().get(plioEndpoint),
                (0, _RootClient.apiClient)().get(_Endpoints.itemsEndpoint, {
                  params: {
                    plio: plioId,
                  },
                }),
              ]).then(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                  plio = _ref2[0],
                  items = _ref2[1];

                // preparing plio details to be consumed by
                // the components
                var plioDetails = {};
                plioDetails.items = items.data;
                plioDetails.items.forEach(function (item) {
                  // convert str to int
                  item.details.correct_answer = parseInt(
                    item.details.correct_answer
                  );
                });
                plioDetails.video_url = plio.data.video.url;
                plioDetails.plioTitle = plio.data.name;
                plioDetails.status = plio.data.status;
                plioDetails.updated_at = plio.data.updated_at;
                plioDetails.plioDBId = plio.data.id;
                plioDetails.videoDBId = plio.data.video.id || null;
                return plioDetails;
              })
            );

          case 4:
          case "end":
            return _context.stop();
        }
      }
    });
  },
  getAllPlios: function getAllPlios() {
    var uuidOnly =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var pageNumber =
      arguments.length > 1 && arguments[1] !== undefined
        ? arguments[1]
        : undefined;
    var searchString =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    // returns all the plios (or just the flat list of uuids) created by the user
    // also fetches the plios at a given page number [if applicable]
    // also filters and fetches the plios that match the given search string [if applicable]
    var url = uuidOnly
      ? _Endpoints.pliosEndpoint + _Endpoints.listPliosEndpoint
      : _Endpoints.pliosEndpoint;
    var queryParams = {}; // add page number query param

    if (pageNumber != undefined && pageNumber >= 1)
      queryParams["page"] = pageNumber; // add search string query param

    if (searchString != undefined && searchString != "")
      queryParams["search"] = searchString;
    return (0, _RootClient.apiClient)().get(url, {
      params: queryParams,
    });
  },
  createPlio: function createPlio() {
    // creates a new draft plio
    return (0, _RootClient.apiClient)().post(_Endpoints.pliosEndpoint);
  },
  updatePlio: function updatePlio(plioValue, plioId) {
    var isVideoLinked, videoDetails;
    return regeneratorRuntime.async(function updatePlio$(_context2) {
      while (1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            // handle video, items and questions being updated
            plioValue.items.forEach(function (item) {
              _Item["default"].updateItem(item);

              _Question["default"].updateQuestion(item.details);
            }); // handle video url/duration being updated

            isVideoLinked = plioValue.videoDBId != null;
            videoDetails = {
              url: plioValue.url,
              duration: plioValue.duration,
            };
            return _context2.abrupt(
              "return",
              new Promise(function (resolve) {
                if (!isVideoLinked) {
                  // create video and save the video db id
                  _Video["default"]
                    .createVideo(videoDetails)
                    .then(function (createdVideo) {
                      plioValue.video = createdVideo.data.id;
                      resolve();
                    });
                } else {
                  // update the video object with the new details
                  _Video["default"].updateVideo(
                    plioValue.videoDBId,
                    videoDetails
                  );

                  resolve();
                }
              }).then(function () {
                (0, _RootClient.apiClient)().put(
                  _Endpoints.pliosEndpoint + plioId,
                  plioValue
                );
              })
            );

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    });
  },
  duplicatePlio: function duplicatePlio(plioId) {
    // create a clone of plioId plio
    return (0, _RootClient.apiClient)().post(
      _Endpoints.pliosEndpoint + plioId + _Endpoints.duplicatePlioEndpoint
    );
  },
  getPlioDataDump: function getPlioDataDump(plioId) {
    // get the data dump for the plio
    return (0, _RootClient.apiClient)().get(
      _Endpoints.pliosEndpoint + plioId + _Endpoints.plioDataDumpEndpoint,
      {
        responseType: "blob",
      }
    );
  },
  getUniqueUsersCountList: function getUniqueUsersCountList(plioIds) {
    var resultSet, resultsMap, results;
    return regeneratorRuntime.async(function getUniqueUsersCountList$(
      _context3
    ) {
      while (1) {
        switch ((_context3.prev = _context3.next)) {
          case 0:
            if (!(plioIds.length == 0)) {
              _context3.next = 2;
              break;
            }

            return _context3.abrupt("return", []);

          case 2:
            _context3.next = 4;
            return regeneratorRuntime.awrap(
              (0, _RootClient.analyticsAPIClient)().load(
                (0, _Plio.uniqueUsersListQuery)(plioIds)
              )
            );

          case 4:
            resultSet = _context3.sent;
            // holds the mapping of plio ID to count
            resultsMap = {};
            if (resultSet.series()[0] != undefined)
              resultSet.series()[0].series.forEach(function (seriesItem) {
                resultsMap[seriesItem.x] = seriesItem.value;
              }); // holds the final list of values to be returned

            results = [];
            plioIds.forEach(function (plioId) {
              // plios which do not have any sessions do not show up in
              // the resultMap - use a default value for those plios
              if (!(plioId in resultsMap)) results.push(0);
              else results.push(resultsMap[plioId]);
            });
            return _context3.abrupt("return", results);

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    });
  },
  getDashboardMetrics: function getDashboardMetrics(plioId) {
    var metrics, resultSet, resultKeys, resultChartPivot;
    return regeneratorRuntime.async(function getDashboardMetrics$(_context4) {
      while (1) {
        switch ((_context4.prev = _context4.next)) {
          case 0:
            // get the average watch time for the given plio
            metrics = {}; // get session level metrics

            _context4.next = 3;
            return regeneratorRuntime.awrap(
              (0, _RootClient.analyticsAPIClient)().load(
                (0, _Plio.dashboardSessionMetricsQuery)(plioId)
              )
            );

          case 3:
            resultSet = _context4.sent;
            resultKeys = resultSet.seriesNames().map(function (x) {
              return x.key;
            });
            resultChartPivot = resultSet.chartPivot()[0];
            resultKeys.forEach(function (key) {
              metrics[key] = resultChartPivot[key];
            }); // get session answer level metrics

            _context4.next = 9;
            return regeneratorRuntime.awrap(
              (0, _RootClient.analyticsAPIClient)().load(
                (0, _Plio.dashboardSessionAnswerMetricsQuery)(plioId)
              )
            );

          case 9:
            resultSet = _context4.sent;
            resultKeys = resultSet.seriesNames().map(function (x) {
              return x.key;
            });
            resultChartPivot = resultSet.chartPivot()[0];
            resultKeys.forEach(function (key) {
              metrics[key] = resultChartPivot[key];
            });
            return _context4.abrupt("return", metrics);

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    });
  },
};
exports["default"] = _default;
