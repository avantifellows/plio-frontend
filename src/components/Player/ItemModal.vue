<template>
  <div class="flex flex-col bg-white w-full h-full overflow-hidden">
    <!-- question modal -->
    <div v-if="isItemQuestion" class="h-full flex flex-col justify-center">
      <!-- header -->
      <item-question-header
        :isAnswerSubmitted="isAnswerSubmitted"
        :isModalMinimized="isModalMinimized"
        :isFullscreen="isFullscreen"
        :previewMode="previewMode"
        @toggle-minimize="toggleMinimize"
        @skip-question="skipQuestion"
      ></item-question-header>
      <!-- main question body -->
      <item-question-body
        :questionText="questionText"
        :options="questionOptions"
        :correctAnswer="questionCorrectAnswer"
        :isAnswerSubmitted="isAnswerSubmitted"
        :selectedOption="draftResponses[selectedItemIndex]"
        :selectedAnswer="currentItemResponseAnswer"
        @option-selected="optionSelected"
        :previewMode="previewMode"
      ></item-question-body>
      <!-- footer -->
      <item-question-footer
        v-if="!previewMode"
        class="place-self-end"
        v-model:isFullscreen="localIsFullscreen"
        :isAnswerSubmitted="isAnswerSubmitted"
        :isAnswerCorrect="isAnswerCorrect"
        :isOptionSelected="isOptionSelected"
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
    previewMode: {
      // whether the item modal will be shown in editor preview mode
      default: false,
      type: Boolean,
    },
    isModalMinimized: {
      // whether the item modal is minimized or not
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
    currentItemResponseAnswer() {
      // `answer` object for `currentItemResponse`
      if (this.currentItemResponse == null) return null;
      return this.currentItemResponse.answer;
    },
    isOptionSelected() {
      // whether an option has been selected
      return this.draftResponses[this.selectedItemIndex] != null;
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
      if (this.responseList != undefined)
        return this.responseList[this.selectedItemIndex];

      return null;
    },
    itemType() {
      // type of the current item
      if (this.currentItem == undefined) return null;
      return this.currentItem["type"];
    },
    isAnswerCorrect() {
      // where the selected option index is current
      if (
        this.currentItem == undefined ||
        !this.isItemQuestion ||
        this.currentItemResponse == null
      )
        return null;
      return this.questionCorrectAnswer == this.currentItemResponseAnswer;
    },
    isAnswerSubmitted() {
      // has the answer for the current item submitted - if current item is a question
      return this.currentItemResponseAnswer != null;
    },
    questionOptions() {
      // options for the question
      if (this.currentItem == undefined) return null;
      return this.currentItem["details"]["options"];
    },
    questionCorrectAnswer() {
      // correct answer for the question
      if (this.currentItem == undefined) return null;
      return parseInt(this.currentItem["details"]["correct_answer"]);
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
  },
  methods: {
    toggleMinimize(positions) {
      this.$emit("toggle-minimize", positions);
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
      this.localResponseList[this.selectedItemIndex].answer = this.draftResponses[
        this.selectedItemIndex
      ];
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
    "toggle-minimize",
  ],
};
</script>
