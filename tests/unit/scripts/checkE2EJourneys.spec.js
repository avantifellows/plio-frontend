const fs = require("fs");
const os = require("os");
const path = require("path");

const { main } = require("../../../scripts/checkE2EJourneys");

describe("e2e journey coverage", () => {
  const writeJson = (dir, name, value) => {
    const filePath = path.join(dir, name);
    fs.writeFileSync(filePath, JSON.stringify(value));
    return filePath;
  };

  it("fails when a manifested journey has no result", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "auth-google-login": "journeys/auth-google-login.spec.js",
    });

    expect(main({ manifestPath, reportPaths: [], env: {} })).toBe(1);
  });

  it("fails when a manifested journey is skipped", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "auth-google-login": "journeys/auth-google-login.spec.js",
    });
    const reportPath = writeJson(dir, "report.json", {
      suites: [
        {
          file: "journeys/auth-google-login.spec.js",
          specs: [{ tests: [{ status: "skipped" }] }],
        },
      ],
    });

    expect(main({ manifestPath, reportPaths: [reportPath], env: {} })).toBe(1);
  });

  it("reports a quarantined journey separately without blocking a pull request", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "auth-google-login": "journeys/auth-google-login.spec.js",
    });
    const quarantineReportPath = writeJson(dir, "quarantine.json", {
      suites: [
        {
          file: "journeys/auth-google-login.spec.js",
          specs: [{ tests: [{ status: "unexpected" }] }],
        },
      ],
    });
    const summaryPath = path.join(dir, "summary.md");

    expect(
      main({
        manifestPath,
        reportPaths: [],
        quarantineReportPaths: [quarantineReportPath],
        env: { GITHUB_STEP_SUMMARY: summaryPath },
      })
    ).toBe(0);
    expect(fs.readFileSync(summaryPath, "utf8")).toContain(
      "0/1 journeys (1 quarantined)"
    );
  });

  it("reports a green count alongside the tested branch pairing", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "auth-google-login": "journeys/auth-google-login.spec.js",
    });
    const reportPath = writeJson(dir, "report.json", {
      suites: [
        {
          file: "journeys/auth-google-login.spec.js",
          specs: [{ tests: [{ status: "expected" }] }],
        },
      ],
    });
    const summaryPath = path.join(dir, "summary.md");

    expect(
      main({
        manifestPath,
        reportPaths: [reportPath],
        env: {
          GITHUB_STEP_SUMMARY: summaryPath,
          FRONTEND_PAIRING: "frontend@feature",
          BACKEND_PAIRING: "backend@main",
        },
      })
    ).toBe(0);
    expect(fs.readFileSync(summaryPath, "utf8")).toContain(
      "1/1 journeys\n\nfrontend@feature x backend@main"
    );
  });
});
