"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.uniqueUsersListQuery = uniqueUsersListQuery;
exports.dashboardSessionMetricsQuery = dashboardSessionMetricsQuery;
exports.dashboardSessionAnswerMetricsQuery = dashboardSessionAnswerMetricsQuery;

function uniqueUsersListQuery(plioIds) {
  // query to fetch the number of unique users for the given list of plio IDs
  // reference: https://cube.dev/docs/getting-started-cubejs-schema
  return {
    measures: ["Session.uniqueUsers"],
    dimensions: ["Plio.uuid"],
    filters: [
      {
        member: "Plio.uuid",
        operator: "equals",
        values: plioIds,
      },
    ],
  };
}

function dashboardSessionMetricsQuery(plioId) {
  // query to fetch session level metrics for each plio
  // reference: https://cube.dev/docs/getting-started-cubejs-schema
  return {
    measures: [
      "Session.uniqueUsers",
      "GroupedSession.averageWatchTime",
      "GroupedSessionRetention.averageOneMinuteRetention",
    ],
    filters: [
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
    ],
  };
}

function dashboardSessionAnswerMetricsQuery(plioId) {
  // query to fetch session answer level metrics for each plio
  // reference: https://cube.dev/docs/getting-started-cubejs-schema
  return {
    measures: [
      "AggregateSessionMetrics.numQuestionsAnswered",
      "AggregateSessionMetrics.completionPercentage",
      "AggregateSessionMetrics.accuracy",
    ],
    filters: [
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
    ],
  };
}
