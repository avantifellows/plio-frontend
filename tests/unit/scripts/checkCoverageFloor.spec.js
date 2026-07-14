const {
  evaluateFloor,
  readMeasuredLinePct,
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
