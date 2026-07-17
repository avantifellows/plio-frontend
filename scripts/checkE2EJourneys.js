const fs = require("fs");

// The decided journey inventory (plio-backend#369) — like coverage floors,
// this number only grows. Shrinking the manifest must fail the gate, not
// silently lower the denominator.
const REQUIRED_JOURNEY_COUNT = 9;

function statuses(suite) {
  return [
    ...(suite.specs || []).flatMap((spec) =>
      spec.tests.map((test) => {
        // test.fail() reports aggregate status "expected" while the actual
        // run failed — only a genuinely passing final result counts green
        const results = test.results || [];
        const lastResult = results[results.length - 1];
        return ["expected", "flaky"].includes(test.status) &&
          lastResult?.status !== "passed"
          ? "expected-but-not-passed"
          : test.status;
      })
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
  requiredCount = REQUIRED_JOURNEY_COUNT,
} = {}) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const targets = Object.values(manifest);
  if (new Set(targets).size !== targets.length) {
    const duplicated = `journey manifest maps multiple keys to the same spec file — every journey needs its own spec, duplicates cannot inflate the count`;
    if (env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(
        env.GITHUB_STEP_SUMMARY,
        `## E2E journey coverage\n\n${duplicated}\n`
      );
    }
    // eslint-disable-next-line no-console
    console.log(duplicated);
    return 1;
  }
  if (Object.keys(manifest).length < requiredCount) {
    const shrunk = `journey manifest lists ${
      Object.keys(manifest).length
    } journeys, fewer than the required ${requiredCount} — the decided inventory only grows`;
    if (env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(
        env.GITHUB_STEP_SUMMARY,
        `## E2E journey coverage\n\n${shrunk}\n`
      );
    }
    // eslint-disable-next-line no-console
    console.log(shrunk);
    return 1;
  }
  const results = readResults(reportPaths);
  const quarantineResults = readResults(quarantineReportPaths);
  const files = Object.values(manifest);
  // a file counts as quarantined only when it has NO blocking results —
  // if it also ran blocking tests, those must still pass — and its
  // quarantine run genuinely attempted something: a skipped/fixme-only
  // quarantine result means the journey never executed at all
  const quarantined = files.filter((file) => {
    const quarantineStatuses = quarantineResults.get(file);
    return (
      quarantineStatuses?.length &&
      quarantineStatuses.some((status) => status !== "skipped") &&
      !results.has(file)
    );
  });
  const green = files.filter((file) => {
    if (quarantined.includes(file)) return false;
    const blockingStatuses = results.get(file);
    if (!blockingStatuses?.length) return false;
    if (
      !blockingStatuses.every((status) =>
        ["expected", "flaky"].includes(status)
      )
    ) {
      return false;
    }
    // a skipped/fixme-only quarantine result means a quarantined test in
    // this file never executed — passing blocking tests alone don't make
    // the journey fully covered
    const quarantineStatuses = quarantineResults.get(file);
    if (
      quarantineStatuses?.length &&
      quarantineStatuses.every((status) => status === "skipped")
    ) {
      return false;
    }
    return true;
  });
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
