import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import i18n from "./services/Localisation/i18n.js";
import InlineSvg from "vue-inline-svg";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import Toast from "vue-toastification";
import VueProgressBar from "@aacassandra/vue3-progressbar";
import VueGtag from "vue-gtag";
import VueClickAway from "vue3-click-away";
import mixpanel from "mixpanel-browser";

// sentry imports
import * as Sentry from "@sentry/browser";
import { Integrations } from "@sentry/tracing";

// Google AOauth. Add CLIENT_ID in .env file
import GAuth from "vue3-google-oauth2";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "./index.css";
import "vue-toastification/dist/index.css";

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
  // Prevents toasts with the same content from appearing simultaneously, discarding duplicates
  if (toasts.filter((t) => t.content === toast.content).length !== 0) {
    // Returning false discards the toast
    return false;
  }
  return toast;
};

const app = createApp(App).use(store).use(router);

if (
  ["staging", "production"].includes(process.env.NODE_ENV) &&
  process.env.VUE_APP_SENTRY_DSN
) {
  // Since Vue3 isn't officially supported yet by Sentry, we're using
  // the JavaScript Sentry integration with @sentry/browser.
  // Refer Sentry documentation for more configs: https://docs.sentry.io/platforms/javascript/configuration/
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_DSN,
    integrations: [new Integrations.BrowserTracing()],
    // Set tracesSampleRate to 1.0 to capture 100%
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
app.use(
  VueGtag,
  {
    appName: process.env.VUE_APP_GOOGLE_ANALYTICS_APP_NAME,
    pageTrackerScreenviewEnabled: true,
    config: { id: process.env.VUE_APP_GOOGLE_ANALYTICS_ID },
  },
  router
);
app.use(PrimeVue, { ripple: true });
app.use(GAuth, gAuthOptions);
app.use(Toast, { filterBeforeCreate });
app.use(VueProgressBar, vueProgressBarOptions);
app.use(VueClickAway);
app.directive("tooltip", Tooltip);

// add mixpanel as an instance property
mixpanel.init(process.env.VUE_APP_MIXPANEL_PROJECT_TOKEN);
app.config.globalProperties.$mixpanel = mixpanel;
app.mount("#app");
