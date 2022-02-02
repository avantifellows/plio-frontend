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
        :isSkipEnabled="isSkipItemButtonEnabled"
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
        :isSubmitEnabled="isAttemptValid"
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
import globalDefaultSettings from "@/services/Config/GlobalDefaultSettings.js";

var isEqual = require("deep-eql");

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
    /** custom configuration options for the item modal */
    configuration: {
      default: null,
      type: Object,
    },
  },
  components: {
    ItemQuestionHeader,
    ItemQuestionFooter,
    ItemQuestionBody,
  },
  computed: {
    /** Whether the skip item button is enabled */
    isSkipItemButtonEnabled() {
      // if a custom configuration exists in the props, then use that otherwise
      // use the global settings
      if (this.configuration != null && this.configuration.has("skipEnabled"))
        return this.configuration.get("skipEnabled").value;
      return globalDefaultSettings
        .get("player")
        .children.get("configuration")
        .children.get("skipEnabled").value;
    },
    /**
     * URL of the image for an item;
     * returns NULL if the image doesn't exist
     */
    imageData() {
      if (this.currentItemImage == null) return null;
      return this.currentItemImage;
    },
    /** details for the current item */
    currentItemDetails() {
      return this.itemDetailList[this.selectedItemIndex];
    },
    /** image data for the current item */
    currentItemImage() {
      return this.currentItemDetails.image;
    },
    /** text to be used as feedback once answer is submitted */
    answerFeedbackText() {
      if (this.isQuestionTypeSubjective) return this.$t("generic.submitted");
      return "";
    },
    /** class for the text to be used as feedback once answer is submitted */
    answerFeedbackTextClass() {
      if (this.isQuestionTypeSubjective) return "text-green-600";
      return "";
    },
    /** whether the question has a character limit if the item is a question */
    hasCharLimit() {
      return this.currentItemDetails["has_char_limit"];
    },
    /** the character limit for a question's answer */
    maxCharLimit() {
      return this.currentItemDetails["max_char_limit"];
    },
    /** main styling class for this component's container */
    containerClass() {
      return [
        {
          "justify-between": !this.previewMode,
          "justify-start": this.previewMode,
        },
        "h-full flex flex-col",
      ];
    },
    /** `answer` attribute for `currentItemResponse` */
    currentItemResponseAnswer() {
      if (this.currentItemResponse == null) return null;
      return this.currentItemResponse.answer;
    },
    /** whether a valid answer has been selected/added */
    isAttemptValid() {
      let currentResponse = this.draftResponses[this.selectedItemIndex];
      if (currentResponse == null) return false;
      if (this.isQuestionTypeSubjective) return currentResponse != "";
      if (this.isQuestionTypeMCQ) return !isNaN(currentResponse);
      if (this.isQuestionTypeCheckbox) return currentResponse.length > 0;
      return false;
    },
    /** local copy of the responseList prop */
    localResponseList: {
      get() {
        return this.responseList;
      },
      set(localResponseList) {
        this.$emit("update:responseList", localResponseList);
      },
    },
    /** local copy of isFullscreen prop */
    localIsFullscreen: {
      get() {
        return this.isFullscreen;
      },
      set(localIsFullscreen) {
        this.$emit("update:isFullscreen", localIsFullscreen);
      },
    },
    /** current item from the list of items */
    currentItem() {
      return this.itemList[this.selectedItemIndex];
    },
    /** response for the current item */
    currentItemResponse() {
      if (this.responseList != undefined)
        return this.responseList[this.selectedItemIndex];

      return null;
    },
    /** type of the current item */
    itemType() {
      if (this.currentItem == undefined) return null;
      return this.currentItem["type"];
    },
    /** whether the submitted answer is correct */
    isAnswerCorrect() {
      if (
        this.currentItem == undefined ||
        !this.isItemQuestion ||
        this.currentItemResponse == null
      )
        return null;
      if (this.isQuestionTypeSubjective) return true;
      return isEqual(this.questionCorrectAnswer, this.currentItemResponseAnswer);
    },
    /** has the answer for the current item submitted - if current item is a question */
    isAnswerSubmitted() {
      if (this.currentItemResponseAnswer == null) return false;
      if (this.isQuestionTypeMCQ) return !isNaN(this.currentItemResponseAnswer);
      if (this.isQuestionTypeCheckbox) return this.currentItemResponseAnswer.length > 0;
      return true;
    },
    /** options for the question */
    questionOptions() {
      if (this.currentItemDetails == undefined) return null;
      return this.currentItemDetails["options"];
    },
    /** correct answer for the question */
    questionCorrectAnswer() {
      if (this.currentItemDetails == undefined) return null;
      if (this.isQuestionTypeMCQ)
        return parseInt(this.currentItemDetails["correct_answer"]);
      return this.currentItemDetails["correct_answer"];
    },
    /** text for the question */
    questionText() {
      if (this.currentItemDetails == undefined) return null;
      return this.currentItemDetails["text"];
    },
    /** whether the item is a Question */
    isItemQuestion() {
      return this.itemType == "question";
    },
    /** type of the question if the item is a question */
    questionType() {
      if (!this.isItemQuestion) return null;
      return this.currentItemDetails["type"];
    },
    isQuestionTypeMCQ() {
      return this.questionType == "mcq";
    },
    isQuestionTypeCheckbox() {
      return this.questionType == "checkbox";
    },
    isQuestionTypeSubjective() {
      return this.questionType == "subjective";
    },
  },
  methods: {
    /** checks if the device is in portrait or landscape mode */
    checkScreenOrientation() {
      if (this.previewMode) {
        // device is assumed to be always in landscape mode when the modal is in preview mode
        this.isPortrait = false;
        return;
      }
      // set whether the screen is in portrait mode
      this.isPortrait = isScreenPortrait();
    },
    /** update the attempt to the current question - valid for subjective questions */
    subjectiveAnswerUpdated(answer) {
      this.draftResponses[this.selectedItemIndex] = answer;
    },
    /** toggles whether the modal is minimized or maximized */
    toggleMinimize(positions) {
      this.$emit("toggle-minimize", positions);
    },
    /** emits that the question has been skipped */
    skipQuestion() {
      this.$emit("skip-question");
    },
    /** emits that the proceed button has been clicked */
    proceedQuestion() {
      this.$emit("proceed-question");
    },
    /** emits that the revise button has been clicked */
    emitRevise() {
      this.$emit("revise-question");
    },
    /**
     * triggered upon selecting an option
     */
    optionSelected(optionIndex) {
      this.$emit("option-selected", optionIndex);

      if (this.isQuestionTypeMCQ) {
        // for MCQ, simply set the option as the current response
        this.draftResponses[this.selectedItemIndex] = optionIndex;
        return;
      }

      if (this.isQuestionTypeCheckbox) {
        // for checkbox, create an array for the response if the response is empty
        if (this.draftResponses[this.selectedItemIndex] == null)
          this.draftResponses[this.selectedItemIndex] = [];
        // if the selection option was already in the response
        // remove it from the response (uncheck it); otherwise add it (check it)
        let currentResponse = this.draftResponses[this.selectedItemIndex];
        let optionPositionInResponse = currentResponse.indexOf(optionIndex);
        if (optionPositionInResponse != -1)
          currentResponse.splice(optionPositionInResponse, 1);
        else {
          currentResponse.push(optionIndex);
          currentResponse.sort();
        }
      }
    },
    /** mark the current attempt as the submitted answer for the current item */
    submitQuestion() {
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
