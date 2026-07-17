const fs = require("fs");

function statuses(suite) {
  return [
    ...(suite.specs || []).flatMap((spec) =>
      spec.tests.map((test) => test.status)
    ),
    ...(suite.suites || []).flatMap(statuses),
  ];
}

function readResults(reportPaths) {
  const results = new Map();
  reportPaths.forEach((reportPath) => {
    JSON.parse(fs.readFileSync(reportPath, "utf8")).suites.forEach((suite) => {
      results.set(suite.file, [
        ...(results.get(suite.file) || []),
        ...statuses(suite),
      ]);
    });
  });
  return results;
}

function cliReportPaths(args) {
  const separator = args.indexOf("--quarantine");
  return separator < 0
    ? { reportPaths: args, quarantineReportPaths: [] }
    : {
        reportPaths: args.slice(0, separator),
        quarantineReportPaths: args.slice(separator + 1),
      };
}

function main({
  manifestPath = "tests/e2e/journeys.json",
  reportPaths = cliReportPaths(process.argv.slice(2)).reportPaths,
  quarantineReportPaths = cliReportPaths(process.argv.slice(2))
    .quarantineReportPaths,
  env = process.env,
} = {}) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const results = readResults(reportPaths);
  const quarantineResults = readResults(quarantineReportPaths);
  const files = Object.values(manifest);
  const quarantined = files.filter((file) => quarantineResults.has(file));
  const green = files.filter(
    (file) =>
      !quarantineResults.has(file) &&
      results.get(file)?.length &&
      results
        .get(file)
        .every((status) => ["expected", "flaky"].includes(status))
  );
  const missing = files.filter(
    (file) => !green.includes(file) && !quarantined.includes(file)
  );
  const summary = `${green.length}/${files.length} journeys${
    quarantined.length ? ` (${quarantined.length} quarantined)` : ""
  }`;

  if (env.GITHUB_STEP_SUMMARY) {
    const pairing =
      env.FRONTEND_PAIRING && env.BACKEND_PAIRING
        ? `\n${env.FRONTEND_PAIRING} x ${env.BACKEND_PAIRING}\n`
        : "";
    fs.appendFileSync(
      env.GITHUB_STEP_SUMMARY,
      `## E2E journey coverage\n\n${summary}\n${pairing}`
    );
  }
  // eslint-disable-next-line no-console
  console.log(summary);
  return missing.length ? 1 : 0;
}

if (require.main === module) process.exit(main());

module.exports = { main };
