// configurations for jest unit testing

module.exports = {
  preset: "@vue/cli-plugin-unit-jest",
  transform: {
    "^.+\\.vue$": "vue-jest",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,vue}",
    "!src/main.js",
    "!src/**/dist/*.js",
    "!src/components/Vue2PortedPackages/**/*.{js,vue}",
    "!src/services/Testing/**/*.{js,vue}",
  ],
  setupFiles: ["<rootDir>/jest.init.js"],
  restoreMocks: true,
};
