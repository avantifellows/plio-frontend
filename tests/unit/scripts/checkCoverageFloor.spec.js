const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  evaluateFloor,
  readMeasuredLinePct,
  main,
} = require("../../../scripts/checkCoverageFloor");

describe("evaluateFloor", () => {
  it("fails when measured line coverage is below the floor", () => {
    expect(evaluateFloor({ measured: 80, floor: 85 }).pass).toBe(false);
  });

  it("passes when measured line coverage equals the floor", () => {
    expect(evaluateFloor({ measured: 85, floor: 85 }).pass).toBe(true);
  });

  it("passes when measured line coverage is above the floor", () => {
    expect(evaluateFloor({ measured: 90, floor: 85 }).pass).toBe(true);
  });

  it("reports the measured-vs-floor summary line", () => {
    expect(evaluateFloor({ measured: 90, floor: 85 }).summaryLine).toBe(
      "measured 90% vs floor 85%"
    );
  });

  it("nudges to bump the floor when measured exceeds it by more than 2%", () => {
    expect(evaluateFloor({ measured: 90, floor: 85 }).nudge).toMatch(
      /bump the floor/i
    );
  });

  it("does not nudge when the gap above the floor is 2% or less", () => {
    expect(evaluateFloor({ measured: 86, floor: 85 }).nudge).toBeNull();
  });

  it("does not nudge when below the floor", () => {
    expect(evaluateFloor({ measured: 80, floor: 85 }).nudge).toBeNull();
  });
});

describe("readMeasuredLinePct", () => {
  it("reads the total line percentage from an istanbul json-summary", () => {
    const summary = {
      total: {
        lines: { total: 100, covered: 84, skipped: 0, pct: 84.21 },
        statements: { pct: 83.5 },
        functions: { pct: 80 },
        branches: { pct: 75 },
      },
    };
    expect(readMeasuredLinePct(summary)).toBe(84.21);
  });
});

describe("main fails closed on malformed inputs", () => {
  const writeJson = (dir, name, content) => {
    const filePath = path.join(dir, name);
    fs.writeFileSync(filePath, JSON.stringify(content));
    return filePath;
  };
  const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "floor-spec-"));

  it("fails when the committed floor is null", () => {
    const dir = tempDir();
    const summaryPath = writeJson(dir, "summary.json", {
      total: { lines: { pct: 90 } },
    });
    // valid JSON, but a null floor must not coerce to a passing 0
    const floorPath = writeJson(dir, "floor.json", { lines: null });
    expect(main({ summaryPath, floorPath, env: {} })).toBe(1);
  });

  it("fails when the measured percentage is not numeric", () => {
    const dir = tempDir();
    const summaryPath = writeJson(dir, "summary.json", {
      total: { lines: { pct: "not-a-number" } },
    });
    const floorPath = writeJson(dir, "floor.json", { lines: 73.41 });
    expect(main({ summaryPath, floorPath, env: {} })).toBe(1);
  });

  it("fails when the floor is negative", () => {
    const dir = tempDir();
    const summaryPath = writeJson(dir, "summary.json", {
      total: { lines: { pct: 90 } },
    });
    const floorPath = writeJson(dir, "floor.json", { lines: -1 });
    expect(main({ summaryPath, floorPath, env: {} })).toBe(1);
  });

  it("still passes on well-formed inputs above the floor", () => {
    const dir = tempDir();
    const summaryPath = writeJson(dir, "summary.json", {
      total: { lines: { pct: 90 } },
    });
    const floorPath = writeJson(dir, "floor.json", { lines: 89.5 });
    expect(main({ summaryPath, floorPath, env: {} })).toBe(0);
  });
});
