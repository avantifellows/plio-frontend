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

    <div class="flex relative mt-1" :class="isDisabled ? 'disabledDiv' : ''">
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
        class="pt-7 overflow-y-auto h-32 border placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-md border-blueGray-300 focus:outline-none focus:ring focus:border-transparent focus:shadow-outline w-full border-gray-200"
        :class="[inputAreaClass, boxStyling]"
        contenteditable="true"
        :disabled="isDisabled"
        ref="quillEditor"
        :placeholder="placeholder"
        @input="inputChange"
        name="placeholder"
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
import "quill/dist/quill.snow.css";

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
        return "focus:ring-primary";
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
      var icon = require("@/assets/images/times-solid.svg");
      if (this.isValid) {
        icon = require("@/assets/images/check.svg");
      }
      return icon;
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
      return {
        "pl-10": this.isStartIconEnabled,
      };
    },
  },
  methods: {
    //update HTML on input change in textarea
    updateChange() {
      //invoked on input change
      this.$emit(
        "update:value",
        this.quillEditor.getText() ? this.quillEditor.root.innerHTML : ""
      );
    },
    inputChange() {
      // invoked on input change
      //  this.$emit("input", this.value);
      // auto expand the textbox if a `maxHeightLimit` has been specified
      if (this.maxHeightLimit > 0) {
        var textareaElement = event.srcElement;
        textareaElement.style.height = "";
        textareaElement.style.height =
          Math.min(textareaElement.scrollHeight, this.maxHeightLimit) + "px";
      }
    },

    keyPress(event) {
      // invoked by pressing a key
      this.$emit("keypress", event);
    },
    keyDown(event) {
      // invoked by the event keydown
      this.$emit("keydown", event);
    },
    startIconSelected() {
      // invoked on start icon being selected
      this.$emit("start-icon-selected", this.value);
    },
  },
  emits: ["input", "keypress", "keydown", "update:value", "start-icon-selected"],

  mounted() {
    //new instance of quilljs is created
    this.quillEditor = new Quill(this.$refs.quillEditor, {
      modules: {
        toolbar: [["bold", "italic", "underline"]],
      },
      theme: "snow", //css for quilleditor
      formats: ["bold", "underline", "italic"], //formatting options for editor
    });

    this.quillEditor.root.innerHTML = this.value;
    //invoked on input change
    this.quillEditor.on("text-change", () => this.updateChange());
  },
};
</script>
<style>
/* quillEditor toolbar css */
.ql-toolbar.ql-snow {
  z-index: 5;
  position: absolute;
  width: 100%;
  background-color: #f2e8df;
  border: 1px solid transparent;
  padding: 0px;
}
/* when the answer div is diabled */
.disabledDiv {
  pointer-events: none;
  opacity: 0.4;
  cursor: not-allowed;
}

.ql-editor:empty:before {
  content: attr(placeholder);
  color: gray;
}
</style>
