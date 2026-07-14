// Enforce the committed frontend-unit coverage floor.
//
// Reads istanbul's json-summary (coverage/coverage-summary.json), compares the
// total line % against the committed floor (coverage-floor.json), writes
// "measured X% vs floor Y%" to the GitHub Actions job summary, and exits
// non-zero when coverage has eroded below the floor. The gate lives here, in
// the repo's own CI step — Codecov is visibility only and is never consulted,
// so enforcement holds even when Codecov is unreachable.
const fs = require("fs");

// How far measured must exceed the floor (percentage points) before we nudge
// maintainers to ratchet the floor up.
const NUDGE_THRESHOLD = 2;

const DEFAULT_SUMMARY_PATH = "coverage/coverage-summary.json";
const DEFAULT_FLOOR_PATH = "coverage-floor.json";

function evaluateFloor({ measured, floor, nudgeThreshold = NUDGE_THRESHOLD }) {
  const pass = measured >= floor;
  const gap = measured - floor;
  const nudge =
    pass && gap > nudgeThreshold
      ? `Coverage exceeds the floor by ${gap.toFixed(
          2
        )}% — bump the floor in this PR to ratchet it up.`
      : null;
  return {
    pass,
    measured,
    floor,
    gap,
    summaryLine: `measured ${measured}% vs floor ${floor}%`,
    nudge,
  };
}

// Extract the total line coverage percentage from istanbul's json-summary
// report (coverage/coverage-summary.json).
function readMeasuredLinePct(summary) {
  return summary.total.lines.pct;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

// Read the committed floor (single global line %) from coverage-floor.json.
function readFloor(floorPath) {
  return readJson(floorPath).lines;
}

// Append markdown to the GitHub Actions job summary, when running in CI.
function appendJobSummary(markdown, env) {
  const summaryFile = env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    fs.appendFileSync(summaryFile, `${markdown}\n`);
  }
}

// CLI entry point. Returns the process exit code (0 = at/above floor).
function main({
  summaryPath = DEFAULT_SUMMARY_PATH,
  floorPath = DEFAULT_FLOOR_PATH,
  env = process.env,
} = {}) {
  const measured = readMeasuredLinePct(readJson(summaryPath));
  const floor = readFloor(floorPath);
  const result = evaluateFloor({ measured, floor });

  const report = ["### Frontend unit coverage floor", "", result.summaryLine];
  if (result.nudge) report.push("", result.nudge);
  if (!result.pass) {
    report.push(
      "",
      "❌ Coverage is below the committed floor — failing the build."
    );
  }
  appendJobSummary(report.join("\n"), env);

  // eslint-disable-next-line no-console
  console.log(result.summaryLine);
  if (result.nudge) {
    // eslint-disable-next-line no-console
    console.log(result.nudge);
  }
  if (!result.pass) {
    // eslint-disable-next-line no-console
    console.error(
      `Coverage floor not met: ${result.summaryLine}. Add tests or investigate the regression.`
    );
    return 1;
  }
  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = {
  evaluateFloor,
  readMeasuredLinePct,
  readFloor,
  main,
  DEFAULT_SUMMARY_PATH,
  DEFAULT_FLOOR_PATH,
};
