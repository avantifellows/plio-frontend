<template>
  <div class="overflow-y-auto flex flex-col py-2">
    <!-- question text -->
    <div class="px-4 md:px-6 xl:px-10">
      <p :class="questionTextClass">
        {{ questionText }}
      </p>
    </div>
    <!-- option container -->
    <div v-if="isQuestionTypeMCQ" class="flex mx-4 md:mx-6 xl:mx-10">
      <ul class="w-full">
        <li class="list-none space-y-1 flex flex-col">
          <div
            v-for="(option, optionIndex) in options"
            :key="optionIndex"
            :class="[optionBackgroundClass(optionIndex), optionTextClass]"
          >
            <!-- each option is defined here -->
            <!-- adding <label> so that touch input is just
                  not limited to the radio button -->
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
              />
              <div v-html="option" class="ml-2 h-full place-self-center leading-tight"></div>
            </label>
          </div>
        </li>
      </ul>
    </div>
    <!-- subjective question answer -->
    <div v-if="isQuestionTypeSubjective" class="flex flex-col px-4 md:px-6 xl:px-10 w-full">
      <!-- input area for the answer -->
      <Textarea
        :placeholder="subjectiveAnswerInputPlaceholder"
        title=""
        class="px-2 w-full"
        v-model:value="subjectiveAnswer"
        :boxStyling="'px-4 placeholder-gray-400 bp-420:h-20 sm:h-28 md:h-36 focus:border-gray-200 focus:ring-transparent'"
        :isDisabled="isAnswerSubmitted || previewMode"
        @keypress="checkCharLimit"
      ></Textarea>
      <!-- character limit -->
      <div class="h-full flex items-end px-6" v-if="hasCharLimit && !isAnswerSubmitted">
        <p class="text-sm sm:text-base lg:text-lg font-bold" :class="maxCharLimitClass">{{ charactersLeft }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Textarea from "@/components/UI/Text/Textarea.vue";

export default {
  data() {
    return {
      subjectiveAnswer: "", // holds the answer to the subjective question
    };
  },
  watch: {
    subjectiveAnswer() {
      this.$emit("answer-updated", this.subjectiveAnswer);
    },
  },
  created() {
    this.subjectiveAnswer = this.defaultAnswer;
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
      // index of the answer
      default: null,
      type: [String, Number],
    },
    draftAnswer: {
      // index of the option selected but not yet submitted
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
  },
  components: { Textarea },
  methods: {
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
      if (!this.isAnswerSubmitted || !this.isQuestionTypeMCQ) return {};
      if (optionIndex == this.correctAnswer) return "text-white bg-green-500";
      if (optionIndex == this.submittedAnswer) return "text-white bg-red-500";
    },
    isOptionChecked(optionIndex) {
      // whether the given option index should be checked
      if (!this.isQuestionTypeMCQ) return false;
      return this.draftAnswer == optionIndex;
    },
  },
  computed: {
    questionTextClass() {
      return [
        {
          "text-lg md:text-xl lg:text-2xl": !this.previewMode,
          "text-sm md:text-base lg:text-lg xl:text-xl": this.previewMode,
        },
        "m-2 mx-4 font-bold leading-tight whitespace-pre-wrap",
      ];
    },
    optionTextClass() {
      return [
        {
          "p-2 text-lg md:text-xl lg:text-2xl": !this.previewMode,
          "p-1 text-xs sm:text-sm md:text-sm lg:text-base xl:text-lg": this.previewMode,
        },
        "border pl-4 rounded-md mx-5 whitespace-pre-wrap",
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
      return "Enter your answer here";
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
