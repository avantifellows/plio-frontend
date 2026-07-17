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

    expect(
      main({ manifestPath, reportPaths: [], env: {}, requiredCount: 1 })
    ).toBe(1);
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
          specs: [
            {
              tests: [{ status: "skipped", results: [] }],
            },
          ],
        },
      ],
    });

    expect(
      main({
        manifestPath,
        reportPaths: [reportPath],
        env: {},
        requiredCount: 1,
      })
    ).toBe(1);
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
          specs: [
            {
              tests: [
                { status: "unexpected", results: [{ status: "failed" }] },
              ],
            },
          ],
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
        requiredCount: 1,
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
          specs: [
            {
              tests: [{ status: "expected", results: [{ status: "passed" }] }],
            },
          ],
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
        requiredCount: 1,
      })
    ).toBe(0);
    expect(fs.readFileSync(summaryPath, "utf8")).toContain(
      "1/1 journeys\n\nfrontend@feature x backend@main"
    );
  });

  it("fails closed when the manifest shrinks below the decided inventory", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "auth-google-login": "journeys/auth-google-login.spec.js",
    });
    const reportPath = writeJson(dir, "report.json", {
      suites: [
        {
          file: "journeys/auth-google-login.spec.js",
          specs: [
            {
              tests: [{ status: "expected", results: [{ status: "passed" }] }],
            },
          ],
        },
      ],
    });

    // every journey green, but the default required count (9) is not met
    expect(main({ manifestPath, reportPaths: [reportPath], env: {} })).toBe(1);
  });

  it("fails when a file's blocking tests fail even if it also has quarantined tests", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "learner-resume": "journeys/learner-resume.spec.js",
    });
    const reportPath = writeJson(dir, "report.json", {
      suites: [
        {
          file: "journeys/learner-resume.spec.js",
          specs: [
            {
              tests: [
                { status: "unexpected", results: [{ status: "failed" }] },
              ],
            },
          ],
        },
      ],
    });
    const quarantineReportPath = writeJson(dir, "quarantine.json", {
      suites: [
        {
          file: "journeys/learner-resume.spec.js",
          specs: [
            {
              tests: [{ status: "expected", results: [{ status: "passed" }] }],
            },
          ],
        },
      ],
    });

    expect(
      main({
        manifestPath,
        reportPaths: [reportPath],
        quarantineReportPaths: [quarantineReportPath],
        env: {},
        requiredCount: 1,
      })
    ).toBe(1);
  });

  it("rejects duplicate manifest targets that would inflate the count", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "auth-google-login": "journeys/auth-google-login.spec.js",
      "learner-resume": "journeys/auth-google-login.spec.js",
    });
    const reportPath = writeJson(dir, "report.json", {
      suites: [
        {
          file: "journeys/auth-google-login.spec.js",
          specs: [
            {
              tests: [{ status: "expected", results: [{ status: "passed" }] }],
            },
          ],
        },
      ],
    });

    expect(
      main({
        manifestPath,
        reportPaths: [reportPath],
        env: {},
        requiredCount: 1,
      })
    ).toBe(1);
  });

  it("fails when a journey only passes as an expected failure (test.fail())", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "auth-google-login": "journeys/auth-google-login.spec.js",
    });
    const reportPath = writeJson(dir, "report.json", {
      suites: [
        {
          file: "journeys/auth-google-login.spec.js",
          specs: [
            {
              tests: [
                {
                  status: "expected",
                  expectedStatus: "failed",
                  results: [{ status: "failed" }],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(
      main({
        manifestPath,
        reportPaths: [reportPath],
        env: {},
        requiredCount: 1,
      })
    ).toBe(1);
  });

  it("fails when a quarantined journey never actually ran (skipped only)", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "auth-google-login": "journeys/auth-google-login.spec.js",
    });
    const quarantineReportPath = writeJson(dir, "quarantine.json", {
      suites: [
        {
          file: "journeys/auth-google-login.spec.js",
          specs: [
            {
              tests: [{ status: "skipped", results: [] }],
            },
          ],
        },
      ],
    });

    expect(
      main({
        manifestPath,
        reportPaths: [],
        quarantineReportPaths: [quarantineReportPath],
        env: {},
        requiredCount: 1,
      })
    ).toBe(1);
  });

  it("fails when a mixed file's quarantined test is skipped even if blocking tests pass", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "e2e-journeys-"));
    const manifestPath = writeJson(dir, "manifest.json", {
      "creator-golden-path": "journeys/creator-golden-path.spec.js",
    });
    const reportPath = writeJson(dir, "report.json", {
      suites: [
        {
          file: "journeys/creator-golden-path.spec.js",
          specs: [
            {
              tests: [{ status: "expected", results: [{ status: "passed" }] }],
            },
          ],
        },
      ],
    });
    const quarantineReportPath = writeJson(dir, "quarantine.json", {
      suites: [
        {
          file: "journeys/creator-golden-path.spec.js",
          specs: [
            {
              tests: [{ status: "skipped", results: [] }],
            },
          ],
        },
      ],
    });

    expect(
      main({
        manifestPath,
        reportPaths: [reportPath],
        quarantineReportPaths: [quarantineReportPath],
        env: {},
        requiredCount: 1,
      })
    ).toBe(1);
  });
});
