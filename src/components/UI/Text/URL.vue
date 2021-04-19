<template>
  <div class="flex gap-2">
    <!-- URL link -->
    <p class="place-self-center" :class="urlTextClass">
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
  components: {
    Toast,
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
