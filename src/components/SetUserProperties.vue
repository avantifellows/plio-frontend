<template>
  <div></div>
</template>

<script>
import axios from "axios";

export default {
  methods: {
    saveLocalUserConfigs() {
      axios
        .get(
          process.env.VUE_APP_BACKEND +
            process.env.VUE_APP_BACKEND_USER_CONFIG +
            "?user-id=" +
            this.$store.getters.getUserId
        )
        .then((response) => {
          this.$store.dispatch("saveConfigs", {
            configs: JSON.stringify(response.data), // save user config locally
          });
        });
    },

    setLocale() {
      var redirectId = setInterval(() => {
        var userConfigs = this.$store.getters.getConfigs;
        if (userConfigs != null) {
          userConfigs = JSON.parse(userConfigs);
          this.$i18n.locale = userConfigs["locale"] || process.env.VUE_APP_I18N_LOCALE;
          clearInterval(redirectId);
        }
      }, 500);
    },
  },
};
</script>
