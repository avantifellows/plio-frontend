<template>
  <div class="flex gap-2">
    <!-- URL link -->
    <p class="place-self-center whitespace-nowrap tracking-tighter" :class="urlTextClass">
      {{ link }}
    </p>
    <!-- copy button -->
    <button
      @click="copyToClipboard()"
      v-tooltip="'Copy link'"
      :class="urlCopyButtonClass"
    >
      <inline-svg
        :src="require('@/assets/images/copy.svg')"
        class="h-4 object-scale-down"
      >
      </inline-svg>
    </button>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";

export default {
  data() {
    return {
      toast: useToast(), // use the toast component
    };
  },
  props: {
    link: {
      type: String,
    },
    isUnderlined: {
      default: false,
      type: Boolean,
    },
    urlStyleClass: {
      default: "text-md lg:text-lg h-full",
      type: [String, Object],
    },
    urlCopyButtonClass: {
      default: "",
      type: [String, Object],
    },
  },
  computed: {
    urlTextClass() {
      return [
        {
          "border-b-2 border-yellow-500": this.isUnderlined,
        },
        this.urlStyleClass,
      ];
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
      if (success) this.toast.success("URL Copied Successfully");
      else this.toast.error("Error while copying");

      this.$emit("copied", success);
    },
  },
  emits: ["copied"],
};
</script>
