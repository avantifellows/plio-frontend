<template>
  <div class="flex space-x-2">
    <!-- URL link -->
    <p class="place-self-center whitespace-nowrap" :class="urlTextClass" data-test="link">
      {{ link }}
    </p>
    <!-- copy button -->
    <button
      @click="copyToClipboard()"
      v-tooltip="this.$t('tooltip.url')"
      :class="urlCopyButtonClass"
      data-test="copyButton"
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
import Utilities from "@/services/Functional/Utilities.js";

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
      default:
        "text-xs bp-500:text-sm sm:text-md lg:text-lg h-full text-yellow-600 font-bold",
      type: [String, Object],
    },
    urlCopyButtonClass: {
      default: "text-yellow-600",
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
      var success = Utilities.copyToClipboard(this.link);

      if (success) this.toast.success(this.$t("success.copying"));
      else this.toast.error(this.$t("error.copying"));

      this.$emit("copied", success);
    },
  },
  emits: ["copied"],
};
</script>
