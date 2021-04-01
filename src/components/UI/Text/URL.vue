<template>
  <div class="flex">
    <!-- URL link -->
    <p class="text-md lg:text-lg h-full place-self-center border-b-2 border-yellow-500">
      {{ link }}
    </p>
    <!-- copy button -->
    <button @click="copyToClipboard()" v-tooltip="'Copy link'">
      <img src="@/assets/images/copy.svg" class="w-10 h-10 min-width-full" />
    </button>
    <toast class="mt-20" ref="toast"></toast>
  </div>
</template>

<script>
import Toast from "@/components/UI/Alert/Toast.vue";

export default {
  data() {
    return {
      toastLife: 3000,
    };
  },
  props: {
    link: {
      type: String,
    },
  },
  components: {
    Toast,
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
      if (success) {
        this.$refs.toast.show("success", "URL Copied Successfully", this.toastLife);
      } else {
        this.$refs.toast.show("error", "Error while copying", this.toastLife);
      }

      this.$emit("copied", success);
    },
  },
  emits: ["copied"],
};
</script>
