<template>
  <div :class="containerClass">
    <div class="place-self-start flex h-full">
      <!-- revise button -->
      <icon-button
        :titleConfig="reviseButtonTitleConfig"
        :buttonClass="reviseButtonClass"
        v-if="!isAnswerSubmitted"
        @click="reviseClicked"
        data-test="reviseButton"
      ></icon-button>
      <!-- icon to show correct/wrong option result -->
      <div
        class="flex items-center space-x-4"
        v-if="isAnswerSubmitted"
        data-test="answerFeedback"
      >
        <inline-svg
          :src="answerCorrectnessIcon"
          :class="answerCorrectnessIconClass"
          v-if="isSurveyQuestion"
          class="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 place-self-center ml-4"
          data-test="answerCorrectnessIcon"
        ></inline-svg>
        <p
          class="text-md sm:text-lg lg:text-2xl"
          :class="answerFeedbackTextClass"
          v-if="hasAnyAnswerFeedback || isSurveyQuestion"
          data-test="answerFeedbackText"
        >
          {{ answerFeedbackText }}
        </p>
      </div>
    </div>
    <!-- button to enter/exit fullscreen -->
    <div class="hidden bp-500:block">
      <icon-button
        :titleConfig="fullscreenButtonTitleConfig"
        :buttonClass="fullscreenButtonClass"
        @click="toggleFullscreen"
        data-test="fullscreenButton"
      ></icon-button>
    </div>
    <div class="place-self-end">
      <!-- submit button -->
      <icon-button
        :titleConfig="submitButtonTitleConfig"
        :buttonClass="submitButtonClass"
        v-if="!isAnswerSubmitted"
        :isDisabled="!isSubmitEnabled"
        @click="submitClicked"
        data-test="submitButton"
      ></icon-button>
      <!-- proceed button -->
      <icon-button
        :titleConfig="proceedButtonTitleConfig"
        :buttonClass="proceedButtonClass"
        @click="proceedClicked"
        v-else
        data-test="proceedButton"
      ></icon-button>
    </div>
  </div>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
export default {
  components: { IconButton },
  props: {
    /** whether the answer has been submitted */
    isAnswerSubmitted: {
      default: false,
      type: Boolean,
    },
    /** if the answer has been submitted, is it correct */
    isAnswerCorrect: {
      default: false,
      type: Boolean,
    },
    /** whether the submit button is enabled */
    isSubmitEnabled: {
      default: false,
      type: Boolean,
    },
    /** whether the original modal is in fullscreen */
    isFullscreen: {
      default: false,
      type: Boolean,
    },
    /** text to be used as feedback once answer is submitted */
    answerFeedbackText: {
      default: "",
      type: String,
    },
    /** class for the text to be used as feedback once answer is submitted */
    answerFeedbackTextClass: {
      default: "",
      type: String,
    },
    isSurveyQuestion: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      // main styling class for this component
      containerClass:
        "flex w-full bg-white p-1 py-2 md:p-3 justify-around place-self-end mb-4",
    };
  },
  computed: {
    hasAnyAnswerFeedback() {
      // whether any text has been provided to be used as feedback once an answer has been submitted
      return this.answerFeedbackText != "";
    },
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
        class: "text-white text-md sm:text-xl lg:text-2xl font-bold",
      };
    },
    submitButtonClass() {
      // class for the submit button
      return "bg-green-500 hover:bg-green-700 ring-green-500 p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none";
    },
    reviseButtonTitleConfig() {
      // config for the text of the revise button
      return {
        value: "⟳ " + this.$t("player.question.revise"),
        class: "text-white text-md sm:text-xl lg:text-2xl font-bold",
      };
    },
    reviseButtonClass() {
      // class for the revise button
      return "bg-blue-500 hover:bg-blue-700 ring-blue-500 p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl";
    },
    proceedButtonTitleConfig() {
      // config for the text of the proceed button
      return {
        value: this.$t("player.question.proceed"),
        class: "text-white text-md sm:text-xl lg:text-2xl font-bold",
      };
    },
    proceedButtonClass() {
      // class for the proceed button
      return "bg-primary hover:bg-primary-hover ring-green-500 p-1 pl-4 pr-4 sm:p-2 sm:pl-10 sm:pr-10 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl";
    },
    fullscreenButtonTitleConfig() {
      // config for the text of the fullscreen toggle button
      return {
        value: this.fullscreenToggleText,
        class: "text-black text-md sm:text-xl lg:text-2xl font-bold",
      };
    },
    fullscreenButtonClass() {
      // class for the fullscreen button
      return "hover:bg-gray-200 ring-black border border-black p-1 pl-4 pr-4 sm:p-2 sm:pl-6 sm:pr-6 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl";
    },
    fullscreenToggleText() {
      // text to show for the fullscreen button
      if (this.isFullscreen) {
        return this.$t("player.fullscreen.exit");
      }
      return this.$t("player.fullscreen.enter");
    },
    answerCorrectnessIcon() {
      // icon to show if the answer was correct or not
      var icon = require("@/assets/images/times-circle-solid.svg");
      if (this.isAnswerCorrect || this.isSurveyQuestion) {
        icon = require("@/assets/images/check-circle-regular.svg");
      }
      return icon;
    },
    answerCorrectnessIconClass() {
      // class for the icon to show if the answer was correct or not
      return {
        "text-green-500": this.isAnswerCorrect || this.isSurveyQuestion,
        "text-red-500": !this.isAnswerCorrect,
      };
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
