export function dashboardSessionMetricsQuery(plioId) {
  // query to fetch session level metrics for given plio
  // reference: https://cube.dev/docs/getting-started-cubejs-schema
  return {
    measures: ["Session.uniqueUsers", "GroupedSession.averageWatchTime"],
    filters: [
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
    ],
  };
}

export function oneMinuteRetentionQuery(plioId) {
  // query to fetch one minute retention for given plio
  // reference: https://cube.dev/docs/getting-started-cubejs-schema
  return {
    measures: ["GroupedSessionRetention.averageOneMinuteRetention"],
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
