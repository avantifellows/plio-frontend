import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import i18n from "./services/Localisation/i18n.js";
import PrimeVue from "primevue/config";
import InlineSvg from "vue-inline-svg";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import "./index.css";

// Google AOauth. Add CLIENT_ID in .env file
import GAuth from "vue3-google-oauth2";

const gAuthOptions = {
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  scope: "email",
  prompt: "consent",
  fetch_basic_profile: false,
};

const app = createApp(App).use(store).use(router);

app.component("font-awesome-icon", FontAwesomeIcon);
app.component("inline-svg", InlineSvg);

app.use(i18n);
app.use(PrimeVue, { ripple: true });
app.use(ToastService);
app.use(GAuth, gAuthOptions);
app.directive("tooltip", Tooltip);
app.mount("#app");
