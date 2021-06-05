<template>
  <div class="overflow-y-auto flex flex-col">
    <!-- question text -->
    <div class="px-4 md:px-6 xl:px-10">
      <p class="p-2 font-bold text-lg md:text-xl lg:text-2xl leading-tight">
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
            class="border p-2 pl-4 text-lg md:text-xl lg:text-2xl rounded-md mx-5"
            :class="optionBackgroundClass(optionIndex)"
          >
            <!-- each option is defined here -->
            <!-- adding <label> so that touch input is just
                  not limited to the radio button -->
            <label class="flex content-center">
              <!-- understand the meaning of the keys here:
               https://www.w3schools.com/tags/att_input_type_radio.asp -->
              <input
                type="radio"
                name="questionOptions"
                :value="option"
                class="place-self-center w-4"
                @click="selectOption(optionIndex)"
                :checked="isOptionChecked(optionIndex)"
                :disabled="isAnswerSubmitted"
              />
              <div v-html="option" class="ml-2 h-full place-self-center leading-tight"></div>
            </label>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="isQuestionTypeSubjective" class="flex px-4 md:px-6 xl:px-10 w-full">
      <Textarea
        :placeholder="subjectiveAnswerInputPlaceholder"
        title=""
        class="px-2 w-full"
        v-model:value="subjectiveAnswer"
        :boxStyling="'px-4 placeholder-gray-400 bp-420:h-20 sm:h-28 md:h-36 focus:border-gray-200 focus:ring-transparent'"
        :isDisabled="isAnswerSubmitted"
      ></Textarea>
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
  },
  components: { Textarea },
  methods: {
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
