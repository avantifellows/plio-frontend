import UserAPIService from "@/services/API/User.js";
import store from "@/store";
import i18n from "@/services/Localisation/i18n.js";

export default {
  async saveLocalUserConfig() {
    // fetch user config and save locally
    let userId = store.state.auth.userId;
    return UserAPIService.getUserConfig(userId).then((response) => {
      // save user config locally
      store.dispatch("auth/saveConfig", JSON.stringify(response.data));
    });
  },

  setLocaleFromUserConfig() {
    // set the system locale from the user config
    let redirectId = setInterval(() => {
      let userConfig = store.state.auth.config;
      if (userConfig != null) {
        userConfig = JSON.parse(userConfig);
        i18n.global.locale =
          userConfig["locale"] || process.env.VUE_APP_I18N_LOCALE;
        clearInterval(redirectId);
      }
    }, 10);
  },

  updateLocale() {
    // update the locale to the local and remote configs
    let userConfig = JSON.parse(store.state.auth.config);
    // update the locale in the user config if it exists
    // or create a new user config
    if (userConfig != null) userConfig["locale"] = i18n.global.locale;
    else userConfig = { locale: i18n.global.locale };

    // update user config remotely and locally
    this.updateUserConfig(userConfig);
  },

  updateUserConfig(userConfig) {
    // update the given config locally and remotely

    // update user config locally
    store.dispatch("auth/saveConfig", JSON.stringify(userConfig));

    // update user config on the server if the user has been authenticated
    if (store.getters["auth/isAuthenticated"]) {
      UserAPIService.updateUserConfig(store.state.auth.userId, userConfig).then(
        (response) => {
          if (response.status == 200) {
            console.log("Config updated successfully");
          } else {
            console.log("Error with config update");
          }
        }
      );
    }
  },
};
