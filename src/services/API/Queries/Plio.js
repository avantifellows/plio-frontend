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

export function dashboardMetricsQuery(plioId) {
  // query to fetch the number of unique users for the given plio ID
  // reference: https://cube.dev/docs/getting-started-cubejs-schema
  return {
    measures: [
      "Session.uniqueUsers",
      "GroupedSession.averageWatchTime",
      // "AggregateSessionMetrics.numQuestionsAnswered",
      // "AggregateSessionMetrics.completionPercentage",
      // "AggregateSessionMetrics.accuracy", "GroupedSessionRetention.averageOneMinuteRetention"
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
        // }, {
        //     member: "Plio.uuid",
        //     operator: "equals",
        //     values: [plioId],
        // }, {
        //     member: "Plio.uuid",
        //     operator: "equals",
        //     values: [plioId],
        // }, {
        //     member: "Plio.uuid",
        //     operator: "equals",
        //     values: [plioId],
        // }, {
        //     member: "Plio.uuid",
        //     operator: "equals",
        //     values: [plioId],
      },
    ],
  };
}

export function averageWatchTimeQuery(plioId) {
  return {
    measures: ["GroupedSession.averageWatchTime"],
    filters: [
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
    ],
  };
}

export function numQuestionsAnsweredQuery(plioId) {
  return {
    measures: ["AggregateSessionMetrics.numQuestionsAnswered"],
    filters: [
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
    ],
  };
}

export function percentageCompleteQuery(plioId) {
  return {
    measures: ["AggregateSessionMetrics.completionPercentage"],
    filters: [
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
    ],
  };
}

export function accuracyQuery(plioId) {
  return {
    measures: ["AggregateSessionMetrics.accuracy"],
    timeDimensions: [],
    order: {},
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
  return {
    measures: ["GroupedSessionRetention.averageOneMinuteRetention"],
    timeDimensions: [],
    order: {},
    filters: [
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
      },
    ],
  };
}
