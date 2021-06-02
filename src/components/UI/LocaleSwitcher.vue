<template>
  <div>
    <select v-model="$i18n.locale" @change="updateLocale">
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
    </select>
  </div>
</template>

<script>
import UserConfigService from "@/services/Config/User.js";

export default {
  name: "LocaleSwitcher",
  methods: {
    updateLocale() {
      // update the locale to the local and remote configs
      this.$mixpanel.register({
        "Current Locale": this.$i18n.locale,
      });
      this.$mixpanel.people.set({
        "Current Locale": this.$i18n.locale,
      });
      UserConfigService.updateLocale();
    },
  },
};
</script>
