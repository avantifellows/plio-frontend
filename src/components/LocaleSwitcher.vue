<template>
  <div>
    <select v-model="$i18n.locale" @change="setLocale">
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
    </select>
  </div>
</template>

<script>
export default {
  name: "LocaleSwitcher",
  methods: {
    setLocale() {
      var userConfig = JSON.parse(this.$store.getters.getConfig);
      // change the locale
      userConfig["locale"] = this.$i18n.locale;

      const jsonUserConfig = JSON.stringify({
        "user-id": this.$store.getters.getUserId,
        configs: userConfig,
      });

      // update user config remotely
      fetch(
        process.env.VUE_APP_BACKEND + process.env.VUE_APP_BACKEND_UPDATE_USER_CONFIG,
        {
          method: "POST",
          body: jsonUserConfig,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          if (response.status == 200) {
            console.log("Config updated successfully");
          } else {
            console.log("Error with config update");
          }
        })
        .then(() =>
          this.$store.dispatch("saveConfig", {
            // update user config locally
            config: JSON.stringify(userConfig),
          })
        )
        .catch((err) => console.log(err));
    },
  },
};
</script>

<style scoped>
select {
  margin-left: auto;
}
</style>
