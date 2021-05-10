export function uniqueUsersQuery(plioId) {
  // query to fetch the number of unique users for the given plio ID
  // reference: https://cube.dev/docs/getting-started-cubejs-schema
  return {
    measures: ["Session.uniqueUsers"],
    filters: [
      {
        member: "Plio.uuid",
        operator: "equals",
        values: [plioId],
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
