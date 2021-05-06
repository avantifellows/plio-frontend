import UserAPIService from "@/services/API/User.js";
import store from "@/store";
import i18n from "@/services/Localisation/i18n.js";

export default {
  saveLocalUserConfig() {
    // fetch user config and save locally
    var userId = store.state.auth.userId;
    UserAPIService.getUserConfig(userId).then((response) => {
      store.dispatch("auth/saveConfig", JSON.stringify(response.data));
      // this.saveConfig(JSON.stringify(response.data)); // save user config locally
    });
  },

  setLocaleFromUserConfig() {
    // set the system locale from the user config
    var redirectId = setInterval(() => {
      var userConfig = store.state.auth.config;
      if (userConfig != null) {
        userConfig = JSON.parse(userConfig);
        i18n.global.locale =
          userConfig["locale"] || process.env.VUE_APP_I18N_LOCALE;
        // this.$i18n.locale = userConfig["locale"] || process.env.VUE_APP_I18N_LOCALE;
        clearInterval(redirectId);
      }
    }, 10);
  },

  updateLocale() {
    // update the locale to the local and remote configs
    console.log("here");
    console.log(i18n);
    console.log(store);
    if (store.getters["auth/isAuthenticated"]) {
      var userConfig = JSON.parse(store.state.auth.config);
      // change the locale
      userConfig["locale"] = i18n.global.locale;

      // update user config remotely and locally
      this.updateUserConfig(userConfig);
    }
  },

  updateUserConfig(userConfig) {
    // update user config on the server
    UserAPIService.updateUserConfig(store.state.auth.userId, userConfig)
      .then((response) => {
        if (response.status == 200) {
          console.log("Config updated successfully");
        } else {
          console.log("Error with config update");
        }
      })
      .then(() => store.dispatch("auth/saveConfig", JSON.stringify(userConfig))) // update user config locally
      .catch((err) => console.log(err));
  },
};
