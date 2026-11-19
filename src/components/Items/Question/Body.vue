<template>
  <div class="overflow-y-auto flex flex-col">
    <!-- question text -->
    <div class="px-4 md:px-6" :class="{ 'xl:px-10': !previewMode }">
      <p :class="questionTextClass" data-test="questionText">
        <!-- {{ questionText }} -->
        <span v-html="latexFormattedQuestionText"></span>
      </p>
    </div>
    <div :class="orientationClass">
      <!-- loading spinner when question image is loading -->
      <div
        :class="questionImageAreaClass"
        class="flex justify-center"
        v-if="isImageLoading"
      >
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
          ref="questionImage"
          :class="{ invisible: isImageLoading }"
          loading="lazy"
        />
      </div>
      <!-- option container -->
      <div
        v-if="areOptionsVisible"
        class="flex"
        :class="answerContainerClass"
        data-test="optionContainer"
      >
        <ul class="w-full">
          <li class="list-none space-y-1 flex flex-col">
            <div
              v-for="(option, optionIndex) in options"
              :key="optionIndex"
              :class="[optionBackgroundClass(optionIndex), optionTextClass]"
              :data-test="`optionContainer-${optionIndex}`"
            >
              <!-- each option is defined here -->
              <!-- adding <label> so that touch input is just not limited to the radio/checkbox button -->
              <label :class="labelClass(option)">
                <!-- understand the meaning of the keys here:
                    https://www.w3schools.com/tags/att_input_type_radio.asp -->
                <input
                  :type="optionInputType"
                  :value="option"
                  class="place-self-center text-primary focus:ring-0"
                  style="box-shadow: none"
                  @click="selectOption(optionIndex)"
                  :checked="isOptionMarked(optionIndex)"
                  :disabled="isAnswerSubmitted || previewMode"
                  :data-test="`optionSelector-${optionIndex}`"
                />
                <div
                  class="ml-2 h-full place-self-center leading-tight"
                  :data-test="`option-${optionIndex}`"
                >
                  <span v-html="latexFormattedOptionText[optionIndex]"></span>
                </div>
              </label>
            </div>
          </li>
        </ul>
      </div>
      <!-- subjective question answer -->
      <div
        v-if="isQuestionTypeSubjective"
        class="flex flex-col"
        :class="answerContainerClass"
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
import katex from "katex";

export default {
  data() {
    return {
      subjectiveAnswer: "", // holds the answer to the subjective question
      subjectiveBoxHeightLimit: 250, // maximum allowed height of the subjective answer text box in px
      // set containing the question types in which options are present
      questionTypesSupportingOptions: new Set(["mcq", "checkbox"]),
      isImageLoading: false, // whether the image is loading
      surveyAnswerClass: "bg-gray-200",
      correctOptionClass: "text-white bg-green-500",
      wrongOptionClass: "text-white bg-red-500",
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
        this.subjectiveAnswer = this.subjectiveAnswer.substring(
          0,
          this.maxCharLimit
        );
      }
      this.$emit("answer-updated", this.subjectiveAnswer);
    },
    imageData: {
      // invoked when another item pops up which has an image
      handler(value) {
        if (value != null) this.startImageLoading();
      },
      deep: true,
    },
  },
  async created() {
    this.subjectiveAnswer = this.defaultAnswer;
    if (this.isQuestionImagePresent) this.startImageLoading();
  },
  props: {
    questionText: {
      default: "",
      type: String,
    },
    options: {
      default: () => [],
      type: Array,
    },
    correctAnswer: {
      default: null,
      type: [Number, Array],
    },
    /** answer for the question which has been submitted */
    submittedAnswer: {
      default: null,
      type: [String, Number, Array],
    },
    /** answer for the question which has been entered but not submitted */
    draftAnswer: {
      default: null,
      type: [String, Number, Array],
    },
    isAnswerSubmitted: {
      default: false,
      type: Boolean,
    },
    questionType: {
      default: "mcq",
      type: String,
    },
    /** whether the answer has a character limit */
    hasCharLimit: {
      default: false,
      type: Boolean,
    },
    /** the character limit to be used if present */
    maxCharLimit: {
      default: 0,
      type: Number,
    },
    /** whether the item body will be shown in editor's mini-preview mode */
    previewMode: {
      default: false,
      type: Boolean,
    },
    /** data of the image to be shown on a question. Contains URL and alt_text */
    imageData: {
      default: null,
      type: Object,
    },
    /** whether the screen is in portrait mode */
    isPortrait: {
      default: false,
      type: Boolean,
    },
    isSurveyQuestion: {
      default: false,
      type: Boolean,
    },
  },
  components: { Textarea },
  methods: {
    startImageLoading() {
      // sets the image state as loading
      this.isImageLoading = true;
    },
    imageLoaded() {
      // stop the loading spinner when the image has been loaded
      this.isImageLoading = false;
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
      if (this.isQuestionTypeMCQ) {
        if (optionIndex == this.correctAnswer && !this.isSurveyQuestion)
          return this.correctOptionClass;
        if (optionIndex == this.submittedAnswer) {
          if (this.isSurveyQuestion) return this.surveyAnswerClass;
          return this.wrongOptionClass;
        }
      }
      if (this.isQuestionTypeCheckbox) {
        if (
          !this.isSurveyQuestion &&
          this.correctAnswer.indexOf(optionIndex) != -1
        )
          return this.correctOptionClass;
        if (this.submittedAnswer.indexOf(optionIndex) != -1) {
          if (this.isSurveyQuestion) return this.surveyAnswerClass;
          return this.wrongOptionClass;
        }
      }
    },
    isOptionMarked(optionIndex) {
      // whether the given option index should be marked selected
      if (this.isQuestionTypeMCQ) return this.draftAnswer == optionIndex;
      return (
        this.draftAnswer != null && this.draftAnswer.indexOf(optionIndex) != -1
      );
    },
  },
  computed: {
    latexFormattedQuestionText() {
      // we're getting a prop called "questionText". This is a string which may contain latex code and
      // might look like this - "What is the value of \\(x\\) in the equation \\(x^2 + 2x + 1 = 0\\)?".
      // This contains sections which need to be formatted as latex and some sections which will be plain text.
      // So format the incoming string and return the formatted string as a HTML which will be rendered as a v-html.

      const latexSections = this.questionText.match(/\\\(.*?\\\)/g);
      var output = this.questionText;
      if (latexSections) {
        latexSections.forEach((latexSection) => {
          const formattedLatex = katex.renderToString(
            latexSection.slice(2, -2),
            {
              throwOnError: false,
              output: "html",
            }
          );
          output = output.replace(latexSection, formattedLatex);
        });
      }
      return output;
    },
    latexFormattedOptionText() {
      // we're getting a prop called "options". This is an array of strings which may contain latex code and
      // might look like this - ["\\(x\\)", "\\(y\\)", "\\(z\\)"].
      // This contains sections which need to be formatted as latex and some sections which will be plain text.
      // So format the incoming strings and return the formatted strings as an array of HTML strings which will be rendered as a v-html.

      return this.options.map((option) => {
        const latexSections = option.match(/\\\(.*?\\\)/g);
        var output = option;
        if (latexSections) {
          latexSections.forEach((latexSection) => {
            const formattedLatex = katex.renderToString(
              latexSection.slice(2, -2),
              {
                throwOnError: false,
                output: "html",
              }
            );
            output = output.replace(latexSection, formattedLatex);
          });
        }
        return output;
      });
    },
    optionInputType() {
      if (!this.areOptionsVisible) return null;
      if (this.isQuestionTypeMCQ) return "radio";
      if (this.isQuestionTypeCheckbox) return "checkbox";
      return null;
    },
    /**
     * classes for the various containers corresponding to the possible types of answers
     * to the various types of questions (options for MCQ, textarea for subjective)
     */
    answerContainerClass() {
      return {
        "w-1/2": !this.isPortrait && this.isQuestionImagePresent,
        "w-full":
          this.isPortrait ||
          (this.previewMode && !this.isQuestionImagePresent) ||
          (!this.isPortrait && !this.isQuestionImagePresent),
      };
    },
    subjectiveAnswerBoxStyling() {
      // classes for the subjective answer box
      return [
        {
          "bp-420:h-20 sm:h-28 md:h-36": !this.previewMode,
          "bp-420:h-16 sm:h-20 md:h-16 text-xs bp-420:text-sm sm:text-base md:text-sm lg:text-base":
            this.previewMode,
        },
        "px-4 placeholder-gray-400 focus:border-gray-200 focus:ring-transparent",
      ];
    },
    questionImageAreaClass() {
      // styling class for the question image and loading spinner containers
      return {
        "h-56 mb-4": !this.previewMode && this.isPortrait,
        "h-28 sm:h-36 md:h-48 lg:h-56 xl:h-80 w-1/2":
          !this.isPortrait && !this.previewMode,
        "h-20 bp-360:h-24 bp-420:h-28 bp-500:h-36 sm:h-48 md:h-24 lg:h-32 xl:h-40 w-1/2":
          this.previewMode,
      };
    },
    questionImageContainerClass() {
      // styling class for the image container
      return [
        this.questionImageAreaClass,
        {
          hidden: this.isImageLoading,
        },
        "border rounded-md",
      ];
    },
    orientationClass() {
      // styling class to decide orientation of image + options depending on portrait/landscape orientation
      return [
        {
          "content-center": this.isQuestionImagePresent && !this.isPortrait,
          "flex-col": this.isQuestionImagePresent && this.isPortrait,
          "space-x-2 md:space-x-4":
            !this.previewMode &&
            !this.isPortrait &&
            this.isQuestionImagePresent,
          "mx-6 md:mx-10 py-4": !this.previewMode,
          "mx-4 md:mx-6 sm:py-4 md:py-0 lg:py-2": this.previewMode,
          "space-x-1 md:space-x-2":
            this.previewMode && this.isQuestionImagePresent,
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
          "p-1 text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg":
            this.previewMode,
        },
        "border rounded-md mx-2 whitespace-pre-wrap",
      ];
    },
    maxCharLimitClass() {
      // class for the character limit text
      if (this.charactersLeft > 0.2 * this.maxCharLimit) return "text-gray-400";
      else if (this.charactersLeft > 0.1 * this.maxCharLimit)
        return "text-yellow-500";
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
    areOptionsVisible() {
      // whether options need to be shown
      return this.questionTypesSupportingOptions.has(this.questionType);
    },
    isQuestionTypeSubjective() {
      // whether the question type is subjective
      return this.questionType == "subjective";
    },
    isQuestionTypeCheckbox() {
      // whether the question type is checkbox
      return this.questionType == "checkbox";
    },
    isQuestionTypeMCQ() {
      // whether the question type is mcq
      return this.questionType == "mcq";
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
