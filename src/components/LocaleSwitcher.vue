<template>
  <div>
    <select v-model="$i18n.locale">
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
    </select>
  </div>
</template>

<script>
export default {
  name: "LocaleSwitcher",
};
</script>

<style scoped></style>
