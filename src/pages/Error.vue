<template>
  <div class="grid grid-rows-1">
    <div v-if="isError404" class="w-full mt-10 grid place-content-center">
      <p class="text-2xl align-middle">
        {{ $t("error.404") }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: "404",
    },
  },
  computed: {
    isError404() {
      // whether the error type is 404
      return this.type === "404";
    },
  },
};
</script>
