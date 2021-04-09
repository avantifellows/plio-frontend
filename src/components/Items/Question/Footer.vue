<template>
  <div class="flex w-full bg-white p-1 md:p-3 justify-between">
    <div class="place-self-start flex h-full relative">
      <!-- revise button -->
      <!-- using invisibility to hide buttons here instead of using class hidden
           to ensure that the fullscreen button is at the center in mobile view -->
      <icon-button
        :titleConfig="reviseButtonTitleConfig"
        :buttonClass="reviseButtonClass"
        class="btn"
        :class="{ invisible: isAnswerSubmitted }"
        @click="reviseClicked"
      ></icon-button>
      <!-- icon to show correct/wrong option result -->
      <inline-svg
        :src="answerCorrectnessIcon"
        :class="answerCorrectnessIconClass"
        class="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 place-self-center ml-4 absolute"
      ></inline-svg>
    </div>
    <!-- button to enter/exit fullscreen -->
    <icon-button
      :iconConfig="fullscreenIconConfig"
      :buttonClass="fullscreenButtonClass"
      @click="toggleFullscreen"
    ></icon-button>
    <div class="place-self-end">
      <!-- submit button -->
      <icon-button
        :titleConfig="submitButtonTitleConfig"
        :buttonClass="submitButtonClass"
        class="btn"
        v-if="!isAnswerSubmitted"
        :isDisabled="isSubmitDisabled"
        @click="submitClicked"
      ></icon-button>
      <!-- proceed button -->
      <icon-button
        :titleConfig="proceedButtonTitleConfig"
        :buttonClass="proceedButtonClass"
        class="btn"
        @click="proceedClicked"
        v-else
      ></icon-button>
    </div>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
export default {
  components: { IconButton },
  props: {
    isAnswerSubmitted: {
      // whether the answer has been submitted
      default: false,
      type: Boolean,
    },
    isAnswerCorrect: {
      // if the answer has been submitted, is it correct
      default: false,
      type: Boolean,
    },
    isOptionSelected: {
      // whether an option has been selected
      default: false,
      type: Boolean,
    },
    isFullscreen: {
      // whether the original modal is in fullscreen
      default: false,
      type: Boolean,
    },
  },
  computed: {
    localIsFullscreen: {
      // local copy of isFullscreen prop
      get() {
        return this.isFullscreen;
      },
      set(localIsFullscreen) {
        this.$emit("update:isFullscreen", localIsFullscreen);
      },
    },
    submitButtonTitleConfig() {
      // config for the text of the submit button
      return {
        value: "✓ " + this.$t("player.question.submit"),
        class: "text-white text-lg sm:text-xl lg:text-2xl font-bold",
      };
    },
    submitButtonClass() {
      // class for the submit button
      return "bg-green-500 hover:bg-green-600 ring-green-500 p-1 pl-4 pr-4 sm:p-2 sm:pl-6 sm:pr-6 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none";
    },
    reviseButtonTitleConfig() {
      // config for the text of the revise button
      return {
        value: "⟳ " + this.$t("player.question.revise"),
        class: "text-blue-500 text-lg sm:text-xl lg:text-2xl font-bold",
      };
    },
    reviseButtonClass() {
      // class for the revise button
      return "hover:bg-gray-200 ring-blue-500 p-1 pl-4 pr-4 sm:p-2 sm:pl-6 sm:pr-6 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl";
    },
    proceedButtonTitleConfig() {
      // config for the text of the proceed button
      return {
        value: this.$t("player.question.proceed"),
        class: "text-green-500 text-lg sm:text-xl lg:text-2xl font-bold",
      };
    },
    proceedButtonClass() {
      // class for the proceed button
      return "hover:bg-gray-200 ring-green-500 p-1 pl-4 pr-4 sm:p-2 sm:pl-6 sm:pr-6 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl";
    },
    fullscreenIconConfig() {
      // icon config for the fullscreen button
      return {
        enabled: true,
        iconName: this.fullscreenIconName,
        iconClass: "h-5 w-5 sm:h-8 sm:w-8 md:h-10 md:w-10 shadow-none hover:bg-gray-200",
      };
    },
    fullscreenButtonClass() {
      // class for the fullscreen button
      return "ring-transparent";
    },
    fullscreenIconName() {
      // icon to either enter/exit fullscreen
      if (this.isFullscreen) {
        return "exit-fullscreen";
      }
      return "enter-fullscreen";
    },
    answerCorrectnessIcon() {
      // icon to show if the answer was correct or not
      var icon = require("@/assets/images/window-close-solid.svg");
      if (this.isAnswerCorrect) {
        icon = require("@/assets/images/check-circle-regular.svg");
      }
      return icon;
    },
    answerCorrectnessIconClass() {
      // class for the icon to show if the answer was correct or not
      return {
        "text-green-500": this.isAnswerCorrect,
        "text-red-500": !this.isAnswerCorrect,
        invisible: !this.isAnswerSubmitted,
      };
    },
    isSubmitDisabled() {
      // whether the submit button is disabled
      return !this.isOptionSelected;
    },
  },
  methods: {
    submitClicked() {
      // invoked when the submit button is clicked
      this.$emit("submit-question");
    },
    reviseClicked() {
      // invoked when the revise button is clicked
      this.$emit("revise-question");
    },
    proceedClicked() {
      // invoked when the proceed button is clicked
      this.$emit("proceed-question");
    },
    toggleFullscreen() {
      // invoked when the toggle fullscreen button is clicked
      this.localIsFullscreen = !this.localIsFullscreen;
    },
  },
  emits: [
    "submit-question",
    "revise-question",
    "proceed-question",
    "update:isFullscreen",
  ],
};
</script>

<style scoped>
.btn {
  border-bottom: outset;
}
.btn:active {
  border-bottom: hidden;
}
</style>
