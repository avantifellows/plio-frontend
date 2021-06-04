<template>
  <div class="flex w-full bg-white justify-end p-1 pr-3 md:pr-6">
    <!-- skip button -->
    <icon-button
      :iconConfig="skipButtonIconConfig"
      @click="skipClicked"
      :class="{ hidden: isAnswerSubmitted }"
    ></icon-button>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
export default {
  components: { IconButton },
  computed: {
    skipButtonIconConfig() {
      return {
        enabled: true,
        iconName: "times-solid",
        iconClass: [
          {
            "h-5 w-5 sm:h-8 sm:w-8 md:h-8 md:w-8": !this.previewMode,
            "h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5": this.previewMode,
          },
          "text-red-600 bg-white shadow-none hover:bg-gray-200",
        ],
      };
    },
  },
  props: {
    isAnswerSubmitted: {
      // whether the answer has been submitted
      default: false,
      type: Boolean,
    },
    previewMode: {
      // whether the item modal will be shown in editor preview mode
      default: false,
      type: Boolean,
    },
  },
  methods: {
    skipClicked() {
      this.$emit("skip-question");
    },
  },
  emits: ["skip-question"],
};
</script>
