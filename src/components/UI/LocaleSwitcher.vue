<template>
  <div>
    <select v-model="$i18n.locale" @change="$refs.userConfig.updateLocale">
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
    </select>
    <user-config ref="userConfig"></user-config>
  </div>
</template>

<script>
import UserConfig from "@/services/Config/User.vue";

export default {
  name: "LocaleSwitcher",
  components: {
    UserConfig,
  },
};
</script>
