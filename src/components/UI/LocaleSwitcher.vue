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
      UserConfigService.updateLocale();
    },
  },
};
</script>
