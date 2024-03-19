<template>
  <div
    class="p-2 absolute top-0 left-0 w-full h-full bg-gray-400 bg-opacity-90 backdrop-blur-xl flex flex-col items-center justify-center z-50 border-2 rounded-md"
    v-if="showMathEditorPopup"
  > 
    <!-- close button -->
    <div
        class="p-2 bg-red-500 text-white rounded-full ml-auto absolute top-0 right-0 z-50"
        v-tooltip="{
          content: $t('tooltip.editor.item_editor.buttons.close_math_editor'),
          placement: 'left',
        }"
        @click="closeMathEditor"
    >
      <icon-button
        class="w-2 h-2"
        :iconConfig="{
          enabled: true,
          iconName: 'times-solid',
          iconClass: 'text-white',
        }"
        :buttonClass="[
          'bg-red-500 hover:bg-red-700 focus:ring-red-500',
          { 'cursor-not-allowed': isInteractionDisabled },
        ]"
        data-test="closeMathEditor"
      ></icon-button>
    </div>

    <!-- <textarea class="p-4 w-3/4 h-1/4"></textarea> -->
    <math-field class="w-full h-full relative text-lg" ref="mathField">
      
    </math-field>
    <!-- <button class="mt-4 bg-blue-500 text-white p-2 rounded" @click="submitMathEntry">Submit</button> -->

    <!-- Submit math button  -->
    <icon-button
      :titleConfig="{
        value: $t('editor.item_editor.buttons.submit_math'),
        class: 'px-4 py-2 text-white rounded-md font-bold'
      }"
      @click="submitMathEntry"
      :buttonClass="[
        'mt-2 rounded-md font-bold h-full w-full bg-primary shadow-lg hover:bg-primary-hover disabled:opacity-50 focus:ring-primary max-h-11 max-w-40',
        { 'cursor-not-allowed': isInteractionDisabled },
      ]"
      :disabled="isInteractionDisabled"
      data-test="submitMath"
    ></icon-button>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { MathField } from 'mathlive';
import IconButton from "@/components/UI/Buttons/IconButton.vue";

export default {
  name: "MathFieldPopup",

  async created() {
    // eslint-disable-next-line no-undef
    if (mathVirtualKeyboard !== null) this.mathKeyboard = mathVirtualKeyboard;
  },

  props: {
    showMathEditorPopup: {
      type: Boolean,
      default: false,
    },
    isInteractionDisabled: {
      type: Boolean,
      default: false,
    },
    questionText: {
      type: String,
      default: "",
    },
    questionTextareaSelectionStart: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      mathKeyboard: null,
    };
  },

  watch: {
    showMathEditorPopup: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          console.log("showing math field")
          this.showMathField();
        } else {
          this.hideMathField();
        }
      },
    },
  },

  components: {
    IconButton,
  },

  methods: {
    closeMathEditor() {
      this.$emit("close-signal");
    },
    showMathField() {
      this.$nextTick(() => {
        const mf = this.$refs.mathField;
        if (mf != null) {
          mf.addEventListener("input", this.inputEventListenerMathField)
          mf.mathVirtualKeyboardPolicy = "manual";
          mf.addEventListener("focusin", this.focusinEventListenerMathField);
          mf.addEventListener("focusout", this.focusoutEventListenerMathField);
          mf.focus()
          this.mathKeyboard.show()
        }
        // Additional logic to interact with the math field
      });
    },
    hideMathField() {
      const mf = this.$refs.mathField;
      if (mf != null) {
        mf.removeEventListener("input", this.inputEventListenerMathField)
        mf.removeEventListener("focusin", this.focusinEventListenerMathField)
        mf.removeEventListener("focusout", this.focusoutEventListenerMathField);
        this.mathKeyboard.hide()
      }

      this.$emit("close-signal")
    },

    submitMathEntry() {
      // insert `this.$refs.mathField.value` into the question text, and at that position of cursor where the user was typing
      const mf = this.$refs.mathField;
      if (mf !== null) {
        // const cursorPosition = mf.selectionStart;
        const cursorPosition = this.questionTextareaSelectionStart
        const questionText = this.questionText;
        const newQuestionTextWithLatexDelimiters = questionText.slice(0, cursorPosition) + "\\(" + mf.value + "\\)" + questionText.slice(cursorPosition);
        this.$emit("math-submitted", newQuestionTextWithLatexDelimiters);
      }
      this.hideMathField();
    },

    // eslint-disable-next-line no-unused-vars
    inputEventListenerMathField(ev) {
    },

    // eslint-disable-next-line no-unused-vars
    focusinEventListenerMathField(ev) {
      window.mathVirtualKeyboard.show()
    },

    // eslint-disable-next-line no-unused-vars
    focusoutEventListenerMathField(ev) {
      window.mathVirtualKeyboard.hide()
    },

  },
  emits: ["math-submitted", "close-signal"],
}
</script>

<style>
/* Hide the virtual keyboard toggle */
math-field::part(virtual-keyboard-toggle) {
  display: none;
}

math-field::part(container) {
  flex-flow: row-reverse;
}

math-field:focus-within {
    outline: 2px solid #F78000;
    border-radius: 2px;
    background: rgba(255, 255, 255, 1);
  }
</style>