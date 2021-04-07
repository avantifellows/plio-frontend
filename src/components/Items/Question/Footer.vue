<template>
  <div class="flex w-full bg-white p-1 md:p-3 justify-between">
    <div class="place-self-start flex h-full">
      <icon-button
        :titleConfig="reviseButtonTitleConfig"
        :buttonClass="reviseButtonClass"
        @click="reviseClicked"
        v-if="!isAnswerSubmitted"
      ></icon-button>
      <inline-svg
        :src="answerCorrectnessIcon"
        :class="answerCorrectnessIconClass"
        class="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 place-self-center"
        v-else
      ></inline-svg>
    </div>
    <div class="place-self-end">
      <icon-button
        :titleConfig="submitButtonTitleConfig"
        :buttonClass="submitButtonClass"
        @click="submitClicked"
        v-if="!isAnswerSubmitted"
        :isDisabled="isSubmitDisabled"
      ></icon-button>
      <icon-button
        :titleConfig="proceedButtonTitleConfig"
        :buttonClass="proceedButtonClass"
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
  },
  computed: {
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
        value: "⟳ " + this.$t("player.question.proceed"),
        class: "text-green-500 text-lg sm:text-xl lg:text-2xl font-bold",
      };
    },
    proceedButtonClass() {
      // class for the proceed button
      return "hover:bg-gray-200 ring-green-500 p-1 pl-4 pr-4 sm:p-2 sm:pl-6 sm:pr-6 lg:p-4 lg:pl-10 lg:pr-10 rounded-md shadow-xl";
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
      };
    },
    isSubmitDisabled() {
      // whether the submit button is disabled
      return !this.isOptionSelected;
    },
  },
  methods: {
    submitClicked() {
      this.$emit("submit-question");
    },
    reviseClicked() {
      this.$emit("revise-question");
    },
    proceedClicked() {
      this.$emit("proceed-question");
    },
  },
  emits: ["submit-question", "revise-question", "proceed-question"],
};
</script>
