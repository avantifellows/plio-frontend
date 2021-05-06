<template>
  <div>
    {{ plioId }}
  </div>
</template>

<script>
export default {
  props: {
    plioId: {
      default: "",
      type: String,
    },
    org: {
      default: "",
      type: String,
    },
  },
};
</script>
