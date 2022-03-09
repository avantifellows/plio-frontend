<template>
  <div class="grid grid-cols-1">
    <div class="flex justify-between">
      <!-- title for the input box -->
      <p class="text-xs pl-2" data-test="title">{{ title }}</p>
      <!-- input validation -->
      <div class="pr-2" v-if="isValidationEnabled">
        <div class="flex text-xs">
          <!-- validation icon -->
          <inline-svg
            :src="validationIcon"
            class="h-5 w-2.5 place-self-center"
            :class="validationColorClass"
          ></inline-svg>

          <!-- validation message -->
          <p
            class="pl-1 place-self-center"
            :class="validationColorClass"
            data-test="validationMessage"
          >
            {{ validationMessage }}
          </p>
        </div>
      </div>
    </div>

    <div :class="containerStyleClass">
      <!-- left icon -->
      <div
        v-if="isStartIconEnabled"
        class="z-10 absolute font-xl text-blueGray-300 bg-transparent rounded text-base items-center w-5 inset-y-1/4 left-1.5"
        @click="startIconSelected"
        :class="startIconClass"
        data-test="startIcon"
      >
        <inline-svg :src="startIconObj"></inline-svg>
      </div>
      <!-- input text area -->
      <div
        :class="inputAreaClass"
        :disabled="isDisabled"
        ref="quillEditor"
        @input="inputChange"
        name="quillEditorTextarea"
        autocomplete="off"
        @keypress="keyPress"
        @keydown="keyDown"
        data-test="input"
      ></div>
    </div>
  </div>
</template>

<script>
// importing css file is necessary and icons wont appear properly without it
import Quill from "quill";

export default {
  props: {
    placeholder: {
      default: "",
      type: String,
    },
    title: {
      default: "",
      type: String,
    },
    /**
     * whether to show any validation for the input
     * format: {enabled: boolean, isValid: boolean, validMessage: String, invalidMessage: String}
     */
    validation: {
      default: () => {
        return {
          enabled: false,
        };
      },
      type: Object,
    },
    /**
     * whether the start icon is enabled and the icon name, if enabled
     */
    startIcon: {
      default: () => {
        return {
          enabled: false,
          name: "check",
          class: "w-10 h-10",
        };
      },
      type: Object,
    },
    /** the value of the input to the input box */
    value: {
      default: "",
      type: [String, Number],
    },
    /** classes for the input boxes */
    boxStyling: {
      default: () => {
        return "focus-within:border-primary";
      },
      type: [Object, String],
    },
    /** whether the input text is disabled */
    isDisabled: {
      default: false,
      type: Boolean,
    },

    /** maximum allowed height of the text box (in px) */
    maxHeightLimit: {
      default: 0,
      type: Number,
    },
  },
  data() {
    return {
      quillEditor: null,
    };
  },

  computed: {
    containerStyleClass() {
      return [
        {
          "cursor-not-allowed pointer-events-none opacity-50 h-32": this.isDisabled,
        },
        "focus-within:border-2 focus-within:border-solid rounded-md flex relative mt-1",
        this.boxStyling,
      ];
    },
    localValue: {
      // local copy of the value prop
      get() {
        return this.value;
      },
      set(localValue) {
        this.$emit("update:value", localValue);
      },
    },
    isStartIconInteractionDisabled() {
      // is interaction with the start icon disabled or not
      if (this.startIcon.isDisabled != null) return this.startIcon.isDisabled;
      return false;
    },
    isValidationEnabled() {
      // whether input validation is on
      return this.validation["enabled"];
    },
    isValid() {
      // whether the input is valid
      return this.isValidationEnabled && this.validation["isValid"];
    },
    validationColorClass() {
      // https://v3.vuejs.org/guide/class-and-style.html#class-and-style-bindings
      return {
        "text-green-600": this.isValid,
        "text-red-600": !this.isValid,
      };
    },
    validationMessage() {
      // message to show for valid/invalid input
      if (this.isValid) {
        return this.validation["validMessage"];
      }
      return this.validation["invalidMessage"];
    },
    validationIcon() {
      // fetches and returns the icon object, depending on "isValid"
      if (this.isValid) {
        return require("@/assets/images/check.svg");
      }
      return require("@/assets/images/times-solid.svg");
    },
    Name() {
      // gets the start icon name from the prop
      return this.startIcon.name;
    },
    startIconClass() {
      // gets the start icon name from the prop
      return [
        this.startIcon.class,
        {
          "cursor-not-allowed pointer-events-none opacity-50": this
            .isStartIconInteractionDisabled,
        },
      ];
    },
    startIconObj() {
      // uses the start icon name to fetch the icon object
      // and return it
      var icon;
      if (this.startIcon.enabled) {
        icon = require("@/assets/images/" + this.startIconName + ".svg");
      }
      return icon;
    },
    isStartIconEnabled() {
      // whether the start icon is enabled
      return this.startIcon.enabled;
    },
    inputAreaClass() {
      // class for the input element
      return [
        {
          "pl-10": this.isStartIconEnabled,
        },
        "pt-4 pb-6 border placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-md border-blueGray-300 focus:outline-none focus:ring focus:border-transparent focus:shadow-outline w-full border-gray-200",
      ];
    },
  },
  methods: {
    /** invoked on change in textarea and emits the current input value */
    inputValue() {
      this.$emit(
        "update:value",
        this.quillEditor.getText() ? this.quillEditor.root.innerHTML : "" // return formatted value
      );
    },
    inputChange() {
      // invoked on input change
      // auto expand the textbox if a `maxHeightLimit` has been specified
      if (this.maxHeightLimit > 0) {
        var textareaElement = event.srcElement.parentElement;
        textareaElement.style.height = "";
        textareaElement.style.height =
          Math.min(textareaElement.scrollHeight, this.maxHeightLimit) + "px";
      }
      // reset the textarea height if it is empty
       if(event.srcElement.innerText.length <1){
          textareaElement.style.height = "6rem";
  }
    },
    /** invoked when a key is pressed
     * @param {object} event
     */
    keyPress(event) {
      this.$emit("keypress", event);
    },
    /** invoked when a key is pressed
     * @param {object} event
     */
    keyDown(event) {
      // ensures that the quillEditor is not removed from textarea when the backspace key is pressed.
      if (event.key=="Backspace" && this.quillEditor.root.innerText === "\n") {
        event.preventDefault();
      }
      this.$emit("keydown", event);
    },
    startIconSelected() {
      // invoked on start icon being selected
      this.$emit("start-icon-selected", this.value);
    },
  },
  emits: ["input", "keypress", "keydown", "update:value", "start-icon-selected"],

  mounted() {
    // new instance of quilljs is created
    this.quillEditor = new Quill(this.$refs.quillEditor, {
      modules: {
        toolbar: [["bold", "italic", "underline"]],
      },
      theme: "snow",
      placeholder: this.placeholder,
      formats: ["bold", "underline", "italic"], //formatting options for editor
    });

    this.quillEditor.root.innerHTML = this.value;
    //invoked on input change and emits the current value of textarea
    this.quillEditor.on("text-change", () => this.inputValue());
  },
};
</script>
<style lang="postcss">
/* classes for quill editor placeholder */
div[name="quillEditorTextarea"] .ql-editor.ql-blank::before {
  @apply text-sm text-gray-400 not-italic;
}
</style>
