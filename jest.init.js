/*
 * This file contains the initialization for test cases.
 * It is being run from jest.config.js as a setupFile.
 * It gets loaded before the tests are run.
 */

import { config } from "@vue/test-utils";
import Toast from "vue-toastification";
import VueTippy from "vue-tippy";
import VueClickAway from "vue3-click-away";
import VueProgressBar from "@aacassandra/vue3-progressbar";
import mixpanel from "mixpanel-browser";
import "offline-js";

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

const $Progress = {
  start: jest.fn(),
  finish: jest.fn(),
  template: "<div></div>",
};

// stub for <transition> tags
const transition = {
  template: "<div></div>",
};
// stub for $gAuth
const $gAuth = {
  signIn: jest.fn(),
  instance: 1,
};

config.global = {
  plugins: [Toast, store, VueProgressBar],
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
    tooltip: VueTippy,
    clickAway: VueClickAway,
  },
  stubs: {
    InlineSvg: InlineSvg,
    transition: transition,
  },
};

// mock document
Object.defineProperty(document, "currentScript", {
  value: document.createElement("script"),
});

// mock window modules
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

Object.defineProperty(window, "open", {
  writable: true,
  value: jest.fn(),
});

// mock getBoundingClientRect
global.document.getElementById = jest.fn(() => ({
  getBoundingClientRect: jest.fn(() => {
    return {
      width: 100,
      height: 100,
    };
  }),
  setAttribute: jest.fn(() => {
    return;
  }),
}));
