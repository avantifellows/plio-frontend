import UserAPIService from "@/services/API/User.js";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  computed: {
    ...mapState("auth", ["userId", "config"]),
    ...mapGetters("auth", ["isAuthenticated"]),
  },
  methods: {
    // object spread operator
    // https://vuex.vuejs.org/guide/state.html#object-spread-operator
    ...mapActions(["saveConfig"]),

    saveLocalUserConfig() {
      // fetch user config and save locally
      UserAPIService.getUserConfig(this.userId).then((response) => {
        this.saveConfig(JSON.stringify(response.data)); // save user config locally
      });
    },

    setLocaleFromUserConfig() {
      // set the system locale from the user config
      var redirectId = setInterval(() => {
        var userConfig = this.config;
        if (userConfig != null) {
          userConfig = JSON.parse(userConfig);
          this.$i18n.locale =
            userConfig["locale"] || process.env.VUE_APP_I18N_LOCALE;
          clearInterval(redirectId);
        }
      }, 10);
    },

    updateLocale() {
      // update the locale to the local and remote configs
      if (this.isAuthenticated) {
        var userConfig = JSON.parse(this.config);
        // change the locale
        userConfig["locale"] = this.$i18n.locale;

        // update user config remotely and locally
        this.updateUserConfig(userConfig);
      }
    },

    updateUserConfig(userConfig) {
      // update user config on the server
      UserAPIService.updateUserConfig(userConfig)
        .then((response) => {
          if (response.status == 200) {
            console.log("Config updated successfully");
          } else {
            console.log("Error with config update");
          }
        })
        .then(() => this.saveConfig(JSON.stringify(userConfig))) // update user config locally
        .catch((err) => console.log(err));
    },
  },
};
