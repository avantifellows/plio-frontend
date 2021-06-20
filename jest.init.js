/*
 * This file contains the initialization for test cases.
 * It is being run from jest.config.js as a setupFile.
 * It gets loaded before the tests are run.
 */

import { config } from "@vue/test-utils";
import InlineSvg from "vue-inline-svg";
import Toast from "vue-toastification";

import mixpanel from "mixpanel-browser";
mixpanel.init(process.env.VUE_APP_MIXPANEL_PROJECT_TOKEN);
const $mixpanel = mixpanel;

import router from "@/router";
const $router = router;

config.global = {
  components: {
    InlineSvg,
  },
  plugins: [Toast],
  mocks: {
    $mixpanel,
    $router,
  },
};
