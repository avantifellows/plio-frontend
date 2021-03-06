<template>
  <div class="overflow-y-auto flex flex-col">
    <!-- question text -->
    <div class="px-4 md:px-6 xl:px-10">
      <p :class="questionTextClass" data-test="questionText">
        {{ questionText }}
      </p>
    </div>
    <div :class="orientationClass">
      <!-- loading spinner when question image is loading -->
      <div class="place-self-center px-10" v-if="pending">
        <inline-svg
          :src="require('@/assets/images/spinner-solid.svg')"
          class="animate-spin h-4 object-scale-down"
        ></inline-svg>
      </div>
      <!-- question image container -->
      <div :class="questionImageContainerClass" v-if="isQuestionImagePresent">
        <img
          :src="imageData.url"
          class="object-contain h-full w-full"
          :alt="imageData.alt_text"
          @load="imageLoaded"
          :class="{ invisible: pending }"
        />
      </div>
      <!-- option container -->
      <div v-if="isQuestionTypeMCQ" class="flex w-full" data-test="optionContainer">
        <ul class="w-full">
          <li class="list-none space-y-1 flex flex-col">
            <div
              v-for="(option, optionIndex) in options"
              :key="optionIndex"
              :class="[optionBackgroundClass(optionIndex), optionTextClass]"
            >
              <!-- each option is defined here -->
              <!-- adding <label> so that touch input is just not limited to the radio button -->
              <label :class="labelClass(option)">
                <!-- understand the meaning of the keys here:
                    https://www.w3schools.com/tags/att_input_type_radio.asp -->
                <input
                  type="radio"
                  name="questionOptions"
                  :value="option"
                  class="place-self-center"
                  @click="selectOption(optionIndex)"
                  :checked="isOptionChecked(optionIndex)"
                  :disabled="isAnswerSubmitted || previewMode"
                  :data-test="`radio-${optionIndex}`"
                />
                <div
                  v-html="option"
                  class="ml-2 h-full place-self-center leading-tight"
                  :data-test="`option-${optionIndex}`"
                ></div>
              </label>
            </div>
          </li>
        </ul>
      </div>
      <!-- subjective question answer -->
      <div
        v-if="isQuestionTypeSubjective"
        class="flex flex-col w-full"
        data-test="subjectiveAnswerContainer"
      >
        <!-- input area for the answer -->
        <Textarea
          v-model:value="subjectiveAnswer"
          class="px-2 w-full"
          :boxStyling="subjectiveAnswerBoxStyling"
          :placeholder="subjectiveAnswerInputPlaceholder"
          :isDisabled="isAnswerSubmitted || previewMode"
          :maxHeightLimit="subjectiveBoxHeightLimit"
          @keypress="checkCharLimit"
          data-test="subjectiveAnswer"
        ></Textarea>
        <!-- character limit -->
        <div
          class="flex items-end px-6 mt-2"
          v-if="hasCharLimit && !isAnswerSubmitted"
          data-test="charLimitContainer"
        >
          <p
            class="text-sm sm:text-base lg:text-lg font-bold"
            :class="maxCharLimitClass"
            data-test="charLimit"
          >
            {{ charactersLeft }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Textarea from "@/components/UI/Text/Textarea.vue";
import { mapState, mapActions } from "vuex";

export default {
  data() {
    return {
      subjectiveAnswer: "", // holds the answer to the subjective question
      subjectiveBoxHeightLimit: 250, // maximum allowed height of the subjective answer text box in px
    };
  },
  watch: {
    subjectiveAnswer() {
      if (
        this.subjectiveAnswer != null &&
        this.hasCharLimit &&
        this.subjectiveAnswer.length > this.maxCharLimit
      ) {
        // prevent answers more than the character limit from being entered via copy pasting
        this.subjectiveAnswer = this.subjectiveAnswer.substring(0, this.maxCharLimit);
      }
      this.$emit("answer-updated", this.subjectiveAnswer);
    },
    imageData: {
      // invoked when another item pops up which has an image
      handler(value) {
        if (value != null) this.startLoading();
      },
      deep: true,
    },
  },
  async created() {
    this.subjectiveAnswer = this.defaultAnswer;
    if (this.isQuestionImagePresent) this.startLoading();
  },
  props: {
    questionText: {
      // text for the question
      default: "",
      type: String,
    },
    options: {
      // options for the question
      default: () => [],
      type: Array,
    },
    correctAnswer: {
      // correct answer for the question
      default: null,
      type: Number,
    },
    submittedAnswer: {
      // answer for the question which has been submitted
      default: null,
      type: [String, Number],
    },
    draftAnswer: {
      // answer for the question which has been entered but not submitted
      default: null,
      type: [String, Number],
    },
    isAnswerSubmitted: {
      // whether the answer has been submitted
      default: false,
      type: Boolean,
    },
    questionType: {
      // type of the question
      default: "mcq",
      type: String,
    },
    hasCharLimit: {
      // whether the answer has a character limit
      default: false,
      type: Boolean,
    },
    maxCharLimit: {
      // the character limit to be used if present
      default: 0,
      type: Number,
    },
    previewMode: {
      // whether the item body will be shown in editor preview mode
      default: false,
      type: Boolean,
    },
    imageData: {
      // data of the image to be shown on a question. Contains URL and alt_text
      default: null,
      type: Object,
    },
    isPortrait: {
      // whether the screen is in portraid mode
      default: false,
      type: Boolean,
    },
    isFullscreen: {
      // whether the modal is in fullscreen
      default: false,
      type: Boolean,
    },
  },
  components: { Textarea },
  methods: {
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    imageLoaded() {
      // stop the loading spinner when the image has been loaded
      this.stopLoading();
    },
    checkCharLimit(event) {
      // checks if character limit is reached in case it is set
      if (!this.hasCharLimit) return;
      if (!this.charactersLeft) event.preventDefault();
    },

    labelClass(optionText) {
      return [{ "h-4 sm:h-5": optionText == "" }, "flex content-center"];
    },
    selectOption(optionIndex) {
      // invoked when an option is selected
      this.$emit("option-selected", optionIndex);
    },
    optionBackgroundClass(optionIndex) {
      // returns the background class for the option
      if (!this.isAnswerSubmitted) return {};
      if (optionIndex == this.correctAnswer) return "text-white bg-green-500";
      if (optionIndex == this.submittedAnswer) return "text-white bg-red-500";
    },
    isOptionChecked(optionIndex) {
      // whether the given option index should be checked
      return this.draftAnswer == optionIndex;
    },
  },
  computed: {
    ...mapState("sync", ["pending"]),
    subjectiveAnswerBoxStyling() {
      // classes for the subjective answer box
      return [
        {
          "bp-420:h-20 sm:h-28 md:h-36": !this.previewMode,
          "bp-420:h-16 sm:h-20 md:h-16 text-xs bp-420:text-sm sm:text-base md:text-sm lg:text-base": this
            .previewMode,
        },
        "px-4 placeholder-gray-400 focus:border-gray-200 focus:ring-transparent",
      ];
    },
    questionImageContainerClass() {
      // styling class for the image container
      return [
        {
          "h-56 mb-4": this.isPortrait && !this.previewMode && this.isFullscreen,
          "h-28 sm:h-36 md:h-48 lg:h-56 xl:h-80 w-1/2 bp-500:w-1/3":
            (!this.isPortrait && !this.previewMode) ||
            (this.isPortrait && !this.isFullscreen),
          "h-20 xsm:h-24 bp-420:h-28 bp-500:h-36 sm:h-48 md:h-24 lg:h-32 xl:h-40 w-1/2": this
            .previewMode,
          invisible: this.pending,
        },
        "border rounded-md",
      ];
    },
    orientationClass() {
      // styling class to decide orientation of image + options depending on portrait/landscape orientation
      return [
        {
          "content-center":
            this.isQuestionImagePresent && !this.isPortrait && !this.isFullscreen,
          "flex-col": this.isQuestionImagePresent && this.isPortrait && this.isFullscreen,
          "space-x-2 md:space-x-4":
            !this.previewMode && !this.isPortrait && this.isQuestionImagePresent,
          "mx-6 md:mx-10 py-4": !this.previewMode,
          "mx-4 md:mx-6 sm:py-4 md:py-0 lg:py-2": this.previewMode,
          "space-x-1 md:space-x-2": this.previewMode && this.isQuestionImagePresent,
        },
        "flex",
      ];
    },
    isQuestionImagePresent() {
      // if the current question contains an image
      return this.imageData != null && this.imageData.url != null;
    },
    questionTextClass() {
      return [
        {
          "text-lg md:text-xl lg:text-2xl mx-4": !this.previewMode,
          "text-sm md:text-base lg:text-lg xl:text-xl": this.previewMode,
        },
        "m-2 font-bold leading-tight whitespace-pre-wrap",
      ];
    },
    optionTextClass() {
      return [
        {
          "p-2 text-lg md:text-xl lg:text-2xl": !this.previewMode,
          "p-1 text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg": this.previewMode,
        },
        "border rounded-md mx-2 whitespace-pre-wrap",
      ];
    },
    maxCharLimitClass() {
      // class for the character limit text
      if (this.charactersLeft > 0.2 * this.maxCharLimit) return "text-gray-400";
      else if (this.charactersLeft > 0.1 * this.maxCharLimit) return "text-yellow-500";
      else return "text-red-400";
    },
    charactersLeft() {
      // number of characters left for the subjective answer if a limit is given
      return this.maxCharLimit - this.currentAnswerLength;
    },
    currentAnswerLength() {
      // length of the current answer (for subjective question)
      if (this.subjectiveAnswer == null) return 0;
      return this.subjectiveAnswer.length;
    },
    defaultAnswer() {
      // the default answer to be shown
      if (this.submittedAnswer != null) {
        return this.submittedAnswer;
      }
      return this.draftAnswer;
    },
    isQuestionTypeMCQ() {
      // whether the question type is mcq
      return this.questionType == "mcq";
    },
    isQuestionTypeSubjective() {
      // whether the question type is mcq
      return this.questionType == "subjective";
    },
    subjectiveAnswerInputPlaceholder() {
      // placeholder for the subjective answer input area
      return this.$t("player.question.placeholder");
    },
  },
  emits: ["option-selected", "answer-updated"],
};
</script>
<style>
/* width */
::-webkit-scrollbar {
  width: 6px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
