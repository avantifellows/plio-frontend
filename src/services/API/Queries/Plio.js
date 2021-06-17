export function uniqueUsersListQuery(plioIds) {
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

export function dashboardSessionMetricsQuery(plioId) {
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
    ],
  };
}

export function dashboardSessionAnswerMetricsQuery(plioId) {
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
    ],
  };
}
