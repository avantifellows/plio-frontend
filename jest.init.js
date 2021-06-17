/*
 * This file contains the initialization for test cases.
 * It is being run from jest.config.js as a setupFile.
 * It gets loaded before the tests are run.
 */

import { config } from "@vue/test-utils";
import InlineSvg from "vue-inline-svg";

config.global.components = {
  InlineSvg,
};
