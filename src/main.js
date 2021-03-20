import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import i18n from "./i18n";
import PrimeVue from "primevue/config";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "tailwindcss/tailwind.css";

const app = createApp(App).use(store).use(router);

app.component("font-awesome-icon", FontAwesomeIcon);

app.use(i18n);
app.use(PrimeVue, { ripple: true });
app.mount("#app");
