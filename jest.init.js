/*
 * This file contains the initialization for test cases.
 * It is being run from jest.config.js as a setupFile.
 * It gets loaded before the tests are run.
 */

import { config } from "@vue/test-utils";
import InlineSvg from "vue-inline-svg";
import Toast from "vue-toastification";
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

config.global = {
  components: {
    InlineSvg,
    VueClickAway,
  },
  plugins: [Toast],
  mocks: {
    $mixpanel,
    $router,
    $t,
    $store,
  },
};

// mock document
Object.defineProperty(document, "currentScript", {
  value: document.createElement("script"),
});
