import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import i18n from "./services/Localisation/i18n.js";
import InlineSvg from "vue-inline-svg";
import Toast from "vue-toastification";
import VueProgressBar from "@aacassandra/vue3-progressbar";
import VueClickAway from "vue3-click-away";
import mixpanel from "mixpanel-browser";
import VueTooltip from "vue-tippy";
import "offline-js";

// sentry imports
import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

// google AOauth. Add CLIENT_ID in .env file
import GAuth from "vue3-google-oauth2";

import "./index.css";
import "vue-toastification/dist/index.css";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/shift-toward.css";
import "./mathlive-css/core.less"
import "./mathlive-css/environment-popover.less"
import "./mathlive-css/fonts.less"
import "./mathlive-css/keystroke-caption.less"
import "./mathlive-css/mathfield.less"
import "./mathlive-css/mathlive-fonts.less"
import "./mathlive-css/mathlive-static.less"
import "./mathlive-css/suggestion-popover.less"
import "./mathlive-css/virtual-keyboard.less"
import "./mathlive-css/katex.min.css"

const gAuthOptions = {
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  scope: "email",
  prompt: "consent",
  fetch_basic_profile: false,
};

const vueProgressBarOptions = {
  color: "#F78000",
  failedColor: "#874b4b",
  thickness: "10px",
  transition: {
    speed: "0.2s",
    opacity: "0.6s",
    termination: 300,
  },
  autoRevert: true,
  location: "top",
  inverse: false,
};

const filterBeforeCreate = (toast, toasts) => {
  // adapted from here - https://github.com/Maronato/vue-toastification#filterbeforecreate
  // prevents toasts with the same content from appearing simultaneously, discarding duplicates
  // and prevent toasts from showing up for an embedded plio
  if (
    toasts.filter((t) => t.content === toast.content).length !== 0 ||
    router.currentRoute._value.name == "Plio"
  ) {
    // returning false discards the toast
    return false;
  }
  return toast;
};

// using this for testcafe to access vue store
window.__store__ = store;

const app = createApp(App).use(store).use(router);

if (
  ["staging", "production"].includes(process.env.NODE_ENV) &&
  process.env.VUE_APP_SENTRY_DSN
) {
  // since Vue3 isn't officially supported yet by Sentry, we're using
  // the JavaScript Sentry integration with @sentry/browser.
  // refer Sentry documentation for more configs: https://docs.sentry.io/platforms/javascript/configuration/
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    // set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
  app.config.errorHandler = (err) => {
    Sentry.captureException(err);
  };
  if (store.state.auth.userId) {
    Sentry.setUser({ id: store.state.auth.userId });
  }
}

app.component("inline-svg", InlineSvg);
app.use(i18n);
app.use(VueTooltip, {
  // https://vue-tippy.netlify.app/installation
  directive: "tooltip", // => use as <button v-tooltip="your text"></button>
  defaultProps: {
    placement: "auto",
    animation: "shift-toward",
    maxWidth: 200,
  },
});
app.use(GAuth, gAuthOptions);
app.use(Toast, { filterBeforeCreate });
app.use(VueProgressBar, vueProgressBarOptions);
app.use(VueClickAway);

// add mixpanel as an instance property
mixpanel.init(process.env.VUE_APP_MIXPANEL_PROJECT_TOKEN);
app.config.globalProperties.$mixpanel = mixpanel;
app.mount("#app");
