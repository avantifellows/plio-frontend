<template>
  <div>
    <select v-model="$i18n.locale" @change="$refs.userProperties.updateLocale">
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
    </select>
    <user-properties ref="userProperties"></user-properties>
  </div>
</template>

<script>
import UserProperties from "@/components/FunctionalComponents/UserProperties.vue";

export default {
  name: "LocaleSwitcher",
  components: {
    UserProperties,
  },
};
</script>

<style scoped>
select {
  margin-left: auto;
}
</style>
