<template>
  <div class="flex w-full bg-white justify-end p-1 pr-3 md:pr-6 space-x-2">
    <!-- skip button -->
    <icon-button
      :titleConfig="skipButtonTitleConfig"
      @click="skipClicked"
      :class="{ hidden: isAnswerSubmitted }"
      :buttonClass="skipButtonClass"
      class="btn"
    ></icon-button>
    <!-- minimize button -->
    <icon-button
      :titleConfig="minimizeButtonTitleConfig"
      :buttonClass="minimizeButtonClass"
      @click="toggleMinimize"
      class="btn"
    ></icon-button>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
export default {
  data() {
    return {
      // styling class for the skip button
      skipButtonClass:
        "bg-primary hover:bg-primary-hover p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none",
      // styling class for the minimize button
      minimizeButtonClass:
        "bg-primary hover:bg-primary-hover p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none",
    };
  },
  components: { IconButton },
  computed: {
    skipButtonTitleConfig() {
      // styling class for the title of skip button
      return {
        value: this.$t("player.question.skip"),
        class: "text-white text-base sm:text-xl lg:text-2xl font-bold",
      };
    },
    minimizeButtonTitleConfig() {
      // styling class for the title of minimize button
      return {
        value: this.isModalMinimized
          ? this.$t("editor.buttons.show_item")
          : this.$t("editor.buttons.show_video"),
        class: "text-white text-base sm:text-xl lg:text-2xl font-bold",
      };
    },
  },
  props: {
    isAnswerSubmitted: {
      // whether the answer has been submitted
      default: false,
      type: Boolean,
    },
    isModalMinimized: {
      // whether the item modal is minimized or not
      default: false,
      type: Boolean,
    },
  },
  methods: {
    skipClicked() {
      this.$emit("skip-question");
    },
    toggleMinimize() {
      this.$emit("toggle-minimize");
    },
  },
  emits: ["skip-question", "toggle-minimize"],
};
</script>
