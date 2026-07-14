// configurations for jest unit testing

module.exports = {
  preset: "@vue/cli-plugin-unit-jest",
  transform: {
    "^.+\\.vue$": "vue-jest",
  },
  // prism-es6 ships untranspiled ESM that jest 26 cannot parse; without this
  // exception the App.vue import chain (App -> Settings ->
  // ConfigureWebhookWindow -> CodeHighlighter) fails to collect.
  transformIgnorePatterns: ["/node_modules/(?!prism-es6)"],
  collectCoverage: true,
  // json-summary emits coverage/coverage-summary.json, the machine-readable
  // total the CI floor-enforcement step consumes (scripts/checkCoverageFloor.js).
  // The other reporters preserve the pre-existing outputs (Codecov lcov, etc.).
  coverageReporters: ["json", "json-summary", "lcov", "clover", "text-summary"],
  collectCoverageFrom: [
    "src/**/*.{js,vue}",
    "!src/main.js",
    "!src/**/dist/*.js",
    "!src/components/Vue2PortedPackages/**/*.{js,vue}",
    "!src/services/Testing/**/*.{js,vue}",
  ],
  setupFiles: [
    "<rootDir>/jest.init.js",
    "<rootDir>/tests/utils/dialog.js",
    "<rootDir>/tests/utils/window.js",
    "<rootDir>/tests/utils/dummyData.js",
    "jest-canvas-mock",
  ],
  setupFilesAfterEnv: ["./jest.setup.js"],
  restoreMocks: true,
};
