<template>
  <div class="flex flex-col bg-white w-full h-full overflow-hidden">
    <div v-if="isItemQuestion" class="h-full flex flex-col shadow-inner">
      <item-question-header @close-question="closeModal"></item-question-header>
      <item-question-body
        class="flex-grow overflow-y-scroll"
        :questionText="questionText"
        :options="questionOptions"
        :correctAnswer="questionCorrectAnswer"
      ></item-question-body>
      <item-question-footer
        @proceed-question="closeModal"
        class="place-self-end shadow-inner"
      ></item-question-footer>
    </div>
  </div>
</template>

<script>
import ItemQuestionHeader from "@/components/Items/Question/Header";
import ItemQuestionBody from "@/components/Items/Question/Body";
import ItemQuestionFooter from "@/components/Items/Question/Footer";

export default {
  props: {
    itemList: {
      // list of items
      default: () => {},
      type: Array,
    },
    selectedItemIndex: {
      // index of the selected item
      default: 0,
      type: Number,
    },
    height: {
      // height for the modal
      default: null,
      type: Number,
    },
  },
  components: {
    ItemQuestionHeader,
    ItemQuestionFooter,
    ItemQuestionBody,
  },
  computed: {
    currentItem() {
      // current item from the list of items
      return this.itemList[this.selectedItemIndex];
    },
    itemType() {
      // type of the current item
      if (this.currentItem == undefined) return null;
      return this.currentItem["type"];
    },
    // isOptionCorrect(optionIndex) {
    //   // where the selected option index is current
    //   if (this.currentItem == undefined) return null;
    //   return this.currentItem["details"]["correct_answer"] == optionIndex;
    // },
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
    questionType() {
      // type for the question
      if (this.currentItem == undefined) return null;
      return this.currentItem["details"]["type"];
    },
    questionId() {
      // DB ID for the question
      if (this.currentItem == undefined) return null;
      return this.currentItem["details"]["id"];
    },
    isItemQuestion() {
      // whether the item is a Question
      return this.itemType == "question";
    },
  },
  methods: {
    closeModal() {
      // close the modal
      this.$emit("close");
    },
  },
  emits: ["close"],
};
</script>
