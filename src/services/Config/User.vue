<template>
  <div></div>
</template>

<script>
import UserAPIService from '@/services/API/User.js'
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  computed: {
      ...mapState(['userId', 'configs']),
      ...mapGetters(['isAuthenticated']),
  },
  methods: {
    // object spread operator
    // https://vuex.vuejs.org/guide/state.html#object-spread-operator
    ...mapActions(["saveConfigs"]),

    saveLocalUserConfigs() {
      UserAPIService.getUserConfig(this.userId).then((response) => {
        this.saveConfigs({
          configs: JSON.stringify(response.data), // save user config locally
        });
      });
    },

    setLocaleFromUserConfig() {
      var redirectId = setInterval(() => {
        var userConfigs = this.configs;
        if (userConfigs != null) {
          userConfigs = JSON.parse(userConfigs);
          this.$i18n.locale = userConfigs["locale"] || process.env.VUE_APP_I18N_LOCALE;
          clearInterval(redirectId);
        }
      }, 500);
    },

    updateLocale() {
      if (this.isAuthenticated) {
        var userConfigs = JSON.parse(this.configs);
        // change the locale
        userConfigs["locale"] = this.$i18n.locale;

        // update user config remotely and locally
        this.updateUserConfigs(userConfigs);
      }
    },

    updateUserConfigs(userConfigs) {
      const jsonUserConfig = JSON.stringify({
        "user-id": this.userId,
        configs: userConfigs,
      });

      UserAPIService.updateUserConfig(jsonUserConfig)
        .then((response) => {
          if (response.status == 200) {
            console.log("Config updated successfully");
          } else {
            console.log("Error with config update");
          }
        })
        .then(() =>
          this.saveConfigs({
            // update user config locally
            configs: JSON.stringify(userConfigs),
          })
        )
        .catch((err) => console.log(err));
    },
  },
};
</script>
