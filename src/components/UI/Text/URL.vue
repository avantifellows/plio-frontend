<template>
  <div class="flex">
    <p class="text-md lg:text-lg underline align-middle">{{ link }}</p>
    <button @click="copyToClipboard()">
      <img src="@/assets/images/copy.svg" class="w-10 h-10 min-width-full" />
    </button>
  </div>
</template>

<script>
export default {
  props: {
    link: {
      type: String,
    },
  },
  methods: {
    copyToClipboard() {
      var hiddenElement = document.createElement("textarea");
      document.body.appendChild(hiddenElement);
      hiddenElement.value = this.link;
      hiddenElement.select();
      var success = document.execCommand("copy");
      document.body.removeChild(hiddenElement);
      this.$emit("copied", success);
    },
  },
  emits: ["copied"],
};
</script>
