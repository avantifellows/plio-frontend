/*
 * This file contains the initialization for test cases.
 * It is being run from jest.config.js as a setupFile.
 * It gets loaded before the tests are run.
 */

import { config } from "@vue/test-utils";
import Toast from "vue-toastification";
import Tooltip from "primevue/tooltip";
import VueClickAway from "vue3-click-away";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.VUE_APP_MIXPANEL_PROJECT_TOKEN);
const $mixpanel = mixpanel;

import router from "@/router";
const $router = router;

import store from "@/store";
const $store = store;

import i18n from "@/services/Localisation/i18n.js";
const $t = (msg) => i18n.global.t(msg);
const $i18n = i18n;

// inline-svg stub
const InlineSvg = {
  template: "<img />",
};

import VueProgressBar from "@aacassandra/vue3-progressbar";
const $Progress = VueProgressBar;

// import GAuth from "vue3-google-oauth2";
const $gAuth = {
  signIn: jest.fn(),
  instance: 1,
};

config.global = {
  plugins: [Toast, store],
  mocks: {
    $mixpanel,
    $router,
    $t,
    $store,
    $i18n,
    $Progress,
    $gAuth,
  },
  directives: {
    tooltip: Tooltip,
    clickAway: VueClickAway,
  },
  stubs: {
    InlineSvg: InlineSvg,
    VueProgressBar: VueProgressBar,
  },
};

// mock document
Object.defineProperty(document, "currentScript", {
  value: document.createElement("script"),
});

// as window.matchMedia is not defined in the DOM
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// mock getBoundingClientRect
global.document.getElementById = jest.fn(() => ({
  getBoundingClientRect: jest.fn(),
}));
