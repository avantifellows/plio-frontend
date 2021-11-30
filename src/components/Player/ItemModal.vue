<template>
  <div class="flex flex-col bg-white w-full h-full overflow-hidden">
    <!-- question modal -->
    <div v-if="isItemQuestion" :class="containerClass">
      <!-- header -->
      <item-question-header
        :isAnswerSubmitted="isAnswerSubmitted"
        :isModalMinimized="isModalMinimized"
        :isFullscreen="isFullscreen"
        :previewMode="previewMode"
        :videoPlayerElementId="videoPlayerElementId"
        @toggle-minimize="toggleMinimize"
        @skip-question="skipQuestion"
        data-test="header"
      ></item-question-header>
      <!-- main question body -->
      <item-question-body
        :questionText="questionText"
        :options="questionOptions"
        :correctAnswer="questionCorrectAnswer"
        :isAnswerSubmitted="isAnswerSubmitted"
        :draftAnswer="draftResponses[selectedItemIndex]"
        :submittedAnswer="currentItemResponseAnswer"
        :questionType="questionType"
        :hasCharLimit="hasCharLimit"
        :maxCharLimit="maxCharLimit"
        :previewMode="previewMode"
        :imageData="imageData"
        :isPortrait="isPortrait"
        @option-selected="optionSelected"
        @answer-updated="subjectiveAnswerUpdated"
        data-test="body"
      ></item-question-body>
      <!-- footer -->
      <item-question-footer
        v-if="!previewMode"
        class="place-self-end"
        v-model:isFullscreen="localIsFullscreen"
        :isAnswerSubmitted="isAnswerSubmitted"
        :isAnswerCorrect="isAnswerCorrect"
        :isSubmitEnabled="isAnswerValid"
        :answerFeedbackText="answerFeedbackText"
        :answerFeedbackTextClass="answerFeedbackTextClass"
        @proceed-question="proceedQuestion"
        @revise-question="emitRevise"
        @submit-question="submitQuestion"
        data-test="footer"
      ></item-question-footer>
    </div>
  </div>
</template>

<script>
import ItemQuestionHeader from "@/components/Items/Question/Header";
import ItemQuestionBody from "@/components/Items/Question/Body";
import ItemQuestionFooter from "@/components/Items/Question/Footer";
import { isScreenPortrait } from "@/services/Functional/Utilities.js";

export default {
  data() {
    return {
      draftResponses: [], // stores the options selected by the user but not yet submitted
      isPortrait: true, // whether the device is in portrait mode
    };
  },
  created() {
    // draftResponses holds the options which are not yet submitted
    // it is instantiated here
    this.itemList.forEach(() => {
      this.draftResponses.push(null);
    });

    // determine the screen orientation when the item modal is created
    this.checkScreenOrientation();
    // add listener for screen size being changed
    window.addEventListener("resize", this.checkScreenOrientation);
  },
  unmounted() {
    // remove listeners
    window.removeEventListener("resize", this.checkScreenOrientation);
  },
  props: {
    itemList: {
      default: () => {
        return [];
      },
      type: Array,
    },
    itemDetailList: {
      default: () => [],
      type: Array,
    },
    /**
     * list of submitted responses to the items
     */
    responseList: {
      default: () => {},
      type: Array,
    },
    selectedItemIndex: {
      default: 0,
      type: Number,
    },
    isFullscreen: {
      default: false,
      type: Boolean,
    },
    /** whether the item modal will be shown in editor's mini-preview mode */
    previewMode: {
      default: false,
      type: Boolean,
    },
    /** whether the item modal is minimized */
    isModalMinimized: {
      default: false,
      type: Boolean,
    },
    /** id of the DOM element corresponding to video player */
    videoPlayerElementId: {
      default: null,
      type: String,
    },
  },
  components: {
    ItemQuestionHeader,
    ItemQuestionFooter,
    ItemQuestionBody,
  },
  computed: {
    imageData() {
      // URL of the image for an item
      // returns NULL if the image doesn't exist
      if (this.currentItemImage == null) return null;
      return this.currentItemImage;
    },
    currentItemDetails() {
      // details for the current item
      return this.itemDetailList[this.selectedItemIndex];
    },
    currentItemImage() {
      // image data for the current item
      return this.currentItemDetails.image;
    },
    answerFeedbackText() {
      // text to be used as feedback once answer is submitted
      if (this.isQuestionTypeSubjective) return this.$t("generic.submitted");
      return "";
    },
    answerFeedbackTextClass() {
      // class for the text to be used as feedback once answer is submitted
      if (this.isQuestionTypeSubjective) return "text-green-600";
      return "";
    },
    hasCharLimit() {
      // whether the question has a character limit if the item is a question
      return this.currentItemDetails["has_char_limit"];
    },
    maxCharLimit() {
      // the character limit for a question's answer
      return this.currentItemDetails["max_char_limit"];
    },
    containerClass() {
      // main styling class for this component's container
      return [
        {
          "justify-between": !this.previewMode,
          "justify-start": this.previewMode,
        },
        "h-full flex flex-col",
      ];
    },
    currentItemResponseAnswer() {
      // `answer` object for `currentItemResponse`
      if (this.currentItemResponse == null) return null;
      return this.currentItemResponse.answer;
    },
    isAnswerValid() {
      // whether an option has been selected
      let currentResponse = this.draftResponses[this.selectedItemIndex];
      if (currentResponse == null) return false;
      if (this.isQuestionTypeSubjective) return currentResponse != "";
      if (this.isQuestionTypeMCQ) return !isNaN(currentResponse);
      if (this.isQuestionTypeCheckbox)
        return currentResponse != null && currentResponse.size > 0;
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
      if (this.isQuestionTypeSubjective) return true;
      return this.questionCorrectAnswer == this.currentItemResponseAnswer;
    },
    isAnswerSubmitted() {
      // has the answer for the current item submitted - if current item is a question
      if (this.currentItemResponseAnswer == null) return false;
      if (this.isQuestionTypeMCQ) return !isNaN(this.currentItemResponseAnswer);
      return true;
    },
    questionOptions() {
      // options for the question
      if (this.currentItemDetails == undefined) return null;
      return this.currentItemDetails["options"];
    },
    questionCorrectAnswer() {
      // correct answer for the question
      if (this.currentItemDetails == undefined) return null;
      return parseInt(this.currentItemDetails["correct_answer"]);
    },
    questionText() {
      // text for the question
      if (this.currentItemDetails == undefined) return null;
      return this.currentItemDetails["text"];
    },
    isItemQuestion() {
      // whether the item is a Question
      return this.itemType == "question";
    },
    questionType() {
      // type of the question if the item is a question
      if (!this.isItemQuestion) return null;
      return this.currentItemDetails["type"];
    },
    isQuestionTypeMCQ() {
      // whether the type of the question is MCQ
      return this.questionType == "mcq";
    },
    isQuestionTypeCheckbox() {
      // whether the type of the question is checkbox
      return this.questionType == "checkbox";
    },
    isQuestionTypeSubjective() {
      // whether the type of the question is subjective
      return this.questionType == "subjective";
    },
  },
  methods: {
    checkScreenOrientation() {
      // check if the device is in portrait or landscape mode
      if (this.previewMode) {
        // device is assumed to be always in landscape mode when the modal is in preview mode
        this.isPortrait = false;
        return;
      }
      // set whether the screen is in portrait mode
      this.isPortrait = isScreenPortrait();
    },
    subjectiveAnswerUpdated(answer) {
      // invoked when the answer to a subjective question is updated
      this.draftResponses[this.selectedItemIndex] = answer;
    },
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
      if (this.isQuestionTypeMCQ)
        this.draftResponses[this.selectedItemIndex] = optionIndex;
      else if (this.isQuestionTypeCheckbox) {
        if (this.draftResponses[this.selectedItemIndex] == null)
          this.draftResponses[this.selectedItemIndex] = new Set();
        let currentResponse = this.draftResponses[this.selectedItemIndex];
        if (currentResponse.has(optionIndex)) currentResponse.delete(optionIndex);
        else currentResponse.add(optionIndex);
      }
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
