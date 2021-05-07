export function uniqueUsersQuery(plioId) {
  // query to fetch the number of unique users for the given plio ID
  // this is the query in the CubeJS Data Schema which is automatically
  // converted to SQL by CubeJS: https://cube.dev/docs/getting-started-cubejs-schema
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
