jest.mock("mixpanel-browser");
jest.mock("vue", () => ({
  ...jest.requireActual("vue"),
  createApp: jest.fn(),
}));
jest.mock("@/App.vue", () => ({}));
jest.mock("vue3-google-oauth2", () => ({}));
jest.mock("vue-toastification/dist/index.css", () => ({}));
jest.mock("tippy.js/dist/tippy.css", () => ({}));
jest.mock("tippy.js/animations/shift-toward.css", () => ({}));

const bootApp = (token) => {
  jest.resetModules();
  if (token === undefined) {
    delete process.env.VUE_APP_MIXPANEL_PROJECT_TOKEN;
  } else {
    process.env.VUE_APP_MIXPANEL_PROJECT_TOKEN = token;
  }

  const mixpanel = require("mixpanel-browser").default;
  const { createApp } = require("vue");
  const app = {
    config: { globalProperties: {} },
    component: jest.fn().mockReturnThis(),
    mount: jest.fn(),
    use: jest.fn().mockReturnThis(),
  };

  mixpanel.init.mockClear();
  createApp.mockReturnValue(app);
  require("@/main.js");

  return { app, mixpanel };
};

describe("Mixpanel bootstrap", () => {
  it.each([undefined, ""])(
    "uses a no-op client when the token is %p",
    (token) => {
      const { app, mixpanel } = bootApp(token);

      expect(mixpanel.init).not.toHaveBeenCalled();
      expect(() =>
        app.config.globalProperties.$mixpanel.track("event")
      ).not.toThrow();
    }
  );

  it("initializes and exposes Mixpanel when the token is set", () => {
    const { app, mixpanel } = bootApp("project-token");

    expect(mixpanel.init).toHaveBeenCalledWith("project-token");
    expect(app.config.globalProperties.$mixpanel).toBe(mixpanel);
  });
});
