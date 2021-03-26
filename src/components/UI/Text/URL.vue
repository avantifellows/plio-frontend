<template>
  <div class="flex">
    <!-- URL link -->
    <p class="text-md lg:text-lg h-full place-self-center border-b-2 border-yellow-500">
      {{ link }}
    </p>
    <!-- copy button -->
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
      // copies the link to the clipboard
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
