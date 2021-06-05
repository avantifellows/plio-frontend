<template>
  <div class="flex flex-col bg-white w-full h-full overflow-hidden">
    <!-- question modal -->
    <div v-if="isItemQuestion" class="h-full flex flex-col shadow-inner justify-center">
      <!-- header -->
      <item-question-header @skip-question="skipQuestion" :isAnswerSubmitted="isAnswerSubmitted"></item-question-header>
      <!-- main question body -->
      <item-question-body
        :questionText="questionText"
        :options="questionOptions"
        :correctAnswer="questionCorrectAnswer"
        :isAnswerSubmitted="isAnswerSubmitted"
        :draftAnswer="draftResponses[selectedItemIndex]"
        :submittedAnswer="currentItemResponse.answer"
        :questionType="questionType"
        @option-selected="optionSelected"
        @answer-updated="answerUpdated"
      ></item-question-body>
      <!-- footer -->
      <item-question-footer
        class="place-self-end"
        v-model:isFullscreen="localIsFullscreen"
        :isAnswerSubmitted="isAnswerSubmitted"
        :isAnswerCorrect="isAnswerCorrect"
        :isSubmitEnabled="isAnswerValid"
        :showAnswerCorrectness="showAnswerCorrectness"
        @proceed-question="proceedQuestion"
        @revise-question="emitRevise"
        @submit-question="submitQuestion"
      ></item-question-footer>
    </div>
  </div>
</template>

<script>
import ItemQuestionHeader from "@/components/Items/Question/Header";
import ItemQuestionBody from "@/components/Items/Question/Body";
import ItemQuestionFooter from "@/components/Items/Question/Footer";

export default {
  data() {
    return {
      draftResponses: [], // stores the options selected by the user but not yet submitted
    };
  },
  created() {
    // draftResponses holds the options which are not yet submitted
    // it is instantiated here
    this.itemList.forEach(() => {
      this.draftResponses.push(null);
    });
  },
  props: {
    itemList: {
      // list of items
      default: () => {},
      type: Array,
    },
    responseList: {
      // list of submitted responses to the items
      default: () => {},
      type: Array,
    },
    selectedItemIndex: {
      // index of the selected item
      default: 0,
      type: Number,
    },
    isFullscreen: {
      // whether the modal is in fullscreen
      default: false,
      type: Boolean,
    },
  },
  components: {
    ItemQuestionHeader,
    ItemQuestionFooter,
    ItemQuestionBody,
  },
  computed: {
    showAnswerCorrectness() {
      // whether to show the answer's correctness after submission
      return this.isQuestionTypeMCQ;
    },
    isAnswerValid() {
      // whether an option has been selected
      if (this.draftResponses[this.selectedItemIndex] == null) return false;
      if (this.isQuestionTypeSubjective) return this.draftResponses[this.selectedItemIndex] != "";
      return true;
    },
    localResponseList: {
      // local copy of the responseList prop
      get() {
        return this.responseList;
      },
      set(localResponseList) {
        this.$emit("update:responseList", localResponseList);
      },
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
    currentItem() {
      // current item from the list of items
      return this.itemList[this.selectedItemIndex];
    },
    currentItemResponse() {
      // response for the current item
      return this.responseList[this.selectedItemIndex];
    },
    itemType() {
      // type of the current item
      if (this.currentItem == undefined) return null;
      return this.currentItem["type"];
    },
    isAnswerCorrect() {
      // where the selected option index is current
      if (this.currentItem == undefined || !this.isItemQuestion) return null;
      return this.questionCorrectAnswer == this.currentItemResponse.answer;
    },
    isAnswerSubmitted() {
      // has the answer for the current item submitted - if current item is a question
      return this.currentItemResponse.answer != null;
    },
    questionOptions() {
      // options for the question
      if (this.currentItem == undefined) return null;
      return this.currentItem["details"]["options"];
    },
    questionCorrectAnswer() {
      // correct answer for the question
      if (this.currentItem == undefined) return null;
      return this.currentItem["details"]["correct_answer"];
    },
    questionText() {
      // text for the question
      if (this.currentItem == undefined) return null;
      return this.currentItem["details"]["text"];
    },
    isItemQuestion() {
      // whether the item is a Question
      return this.itemType == "question";
    },
    questionType() {
      // type of the question if the item is a question
      if (!this.isItemQuestion) return null;
      return this.currentItem["details"]["type"];
    },
    isQuestionTypeMCQ() {
      // whether the type of the question is MCQ if item is question
      return this.questionType == "mcq";
    },
    isQuestionTypeSubjective() {
      // whether the type of the question is subjective if item is question
      return this.questionType == "subjective";
    },
  },
  methods: {
    answerUpdated(answer) {
      // invoked when the answer to a subjective question is updated
      this.draftResponses[this.selectedItemIndex] = answer;
    },
    skipQuestion() {
      // skip the question
      this.$emit("skip-question");
    },
    proceedQuestion() {
      // proceed from the question
      this.$emit("proceed-question");
    },
    emitRevise() {
      // invoked when the revise button is clicked
      this.$emit("revise-question");
    },
    optionSelected(optionIndex) {
      // invoked when an option is selected
      this.draftResponses[this.selectedItemIndex] = optionIndex;
      this.$emit("option-selected", optionIndex);
    },
    submitQuestion() {
      // invoked when the response to the question has been submitted
      this.localResponseList[this.selectedItemIndex].answer = this.draftResponses[this.selectedItemIndex];
      this.$emit("submit-question");
    },
  },
  emits: [
    "skip-question",
    "proceed-question",
    "update:isFullscreen",
    "revise-question",
    "update:responseList",
    "submit-question",
    "option-selected",
  ],
};
</script>
