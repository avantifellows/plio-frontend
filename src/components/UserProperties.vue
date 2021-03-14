<template>
  <div></div>
</template>

<script>
import UserService from '@/services/UserService.js'

export default {
  methods: {
    saveLocalUserConfigs() {
      UserService.getUserConfig(this.$store.getters.getUserId)
      .then((response) => {
        this.$store.dispatch("saveConfigs", {
          configs: JSON.stringify(response.data), // save user config locally
        });
      });
    },

    setLocaleFromUserConfig() {
      var redirectId = setInterval(() => {
        var userConfigs = this.$store.getters.getConfigs;
        if (userConfigs != null) {
          userConfigs = JSON.parse(userConfigs);
          this.$i18n.locale = userConfigs["locale"] || process.env.VUE_APP_I18N_LOCALE;
          clearInterval(redirectId);
        }
      }, 500);
    },

    updateLocale() {
      if (this.$store.getters.isLoggedIn) {
        var userConfigs = JSON.parse(this.$store.getters.getConfigs);
        // change the locale
        userConfigs["locale"] = this.$i18n.locale;

        // update user config remotely and locally
        this.updateUserConfigs(userConfigs);
      }
    },

    updateUserConfigs(userConfigs) {
      const jsonUserConfig = JSON.stringify({
        "user-id": this.$store.getters.getUserId,
        configs: userConfigs,
      });

      UserService.updateUserConfig(jsonUserConfig)
      .then((response) => {
        if (response.status == 200) {
          console.log("Config updated successfully");
        } else {
          console.log("Error with config update");
        }
      })
      .then(() =>
        this.$store.dispatch("saveConfigs", {
          // update user config locally
          configs: JSON.stringify(userConfigs),
        })
      )
      .catch((err) => console.log(err));
    },
  },
};
</script>
