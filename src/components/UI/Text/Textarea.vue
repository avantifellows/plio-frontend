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
        ref="quillEditor"
        name="quillEditorTextarea"
        autocomplete="off"
        @keydown="keyDown"
        data-test="input"
      ></div>
    </div>
  </div>
</template>

<script>
// importing css file is necessary and icons wont appear properly without it
import Quill from "quill";
const MIN_HEIGHT = "43px";

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
    isPreviewMode: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      quillEditor: null, // contains the reference to the quill editor instance
      // the 'input source' for the latest change in the quill editor. Read more on `source` here - https://quilljs.com/docs/api/#events
      latestInputSource: null,
    };
  },

  computed: {
    /** the HTML element the quill editor injects into the code */
    quillEditorElement() {
      if (this.quillEditor != null) return this.quillEditor.root;
      return null;
    },
    containerStyleClass() {
      return [
        {
          "cursor-not-allowed opacity-50": this.isDisabled || this.isPreviewMode,
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
    name() {
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
    /** saves the HTML text inside the quill editor instance into a variable */
    updateLocalValue() {
      this.localValue = this.quillEditor.getText()
        ? this.quillEditorElement.innerHTML
        : "";
    },
    handleTextareaSizing() {
      // invoked when someone types in the textbox

      // reset the textarea height if it is empty
      if (this.quillEditor.getLength() == 1 && this.quillEditor.getText() == "\n") {
        this.quillEditorElement.style.height = MIN_HEIGHT;
        return;
      }
      // auto expand the textbox if a `maxHeightLimit` has been specified
      if (this.maxHeightLimit > 0) {
        this.quillEditorElement.style.height =
          Math.min(this.quillEditorElement.scrollHeight, this.maxHeightLimit) + "px";

        // scroll to the very end where the cursor is
        this.quillEditorElement.scrollTop = this.quillEditorElement.scrollHeight;
      }
    },
    /** invoked when a key is pressed
     * @param {object} event
     */
    keyDown(event) {
      // ensures that the quillEditor is not removed from textarea when the backspace key is pressed.
      if (event.key == "Backspace" && this.quillEditorElement.innerText === "\n") {
        event.preventDefault();
      }
      this.$emit("keydown", event);
      this.handleTextareaSizing();
    },
    startIconSelected() {
      // invoked on start icon being selected
      this.$emit("start-icon-selected", this.value);
    },
    initializeQuillEditor() {
      this.quillEditor = new Quill(this.$refs.quillEditor, {
        modules: {
          toolbar: [["bold", "italic", "underline"]],
        },
        theme: "snow",
        placeholder: this.placeholder,
        formats: ["bold", "underline", "italic"], //formatting options for editor
      });
      this.setTextToQuillEditor(this.localValue);
      if (this.isPreviewMode) this.setAsReadOnly();
      if (this.isDisabled) {
        this.setAsReadOnly();
        this.unsetPlaceholder();
        this.setToMaxHeight();
      }

      this.quillEditor.on("text-change", (_, __, source) => {
        // save the source of the new change in a variable
        // Read more on `source` here - https://quilljs.com/docs/api/#events
        this.latestInputSource = source;
        // update the local value with this new change
        this.updateLocalValue();
      });
    },
    setTextToQuillEditor(formattedText) {
      if (this.quillEditor != null) this.quillEditorElement.innerHTML = formattedText;
    },
    setAsReadOnly() {
      if (this.quillEditor != null)
        this.quillEditorElement.setAttribute("contenteditable", "false");
    },
    unsetReadOnly() {
      if (this.quillEditor != null)
        this.quillEditorElement.setAttribute("contenteditable", "true");
    },
    setPlaceholder() {
      if (this.quillEditor != null)
        this.quillEditorElement.setAttribute("data-placeholder", this.placeholder);
    },
    unsetPlaceholder() {
      if (this.quillEditor != null)
        this.quillEditorElement.setAttribute("data-placeholder", "");
    },
    setToMaxHeight() {
      if (this.quillEditor != null)
        this.quillEditorElement.style.height = `${this.maxHeightLimit}px`;
    },
  },
  emits: ["input", "keydown", "update:value", "start-icon-selected"],
  watch: {
    /**
     * listen to changes in the value prop. only proceed if the incoming change is by an 'API' and not an 'user'.
     * set the quill editor's value with the incoming value and reset the cursor position
     */
    value(newValue, oldValue) {
      // Read more on `source` here - https://quilljs.com/docs/api/#text-change
      if (this.latestInputSource == "user") return;
      if (this.quillEditor != null && newValue != oldValue) {
        // save the formatted incoming value so it shows up in the quill editor
        this.quillEditorElement.innerHTML = newValue;
        // reason for setTimeout - https://stackoverflow.com/questions/48678236/setting-the-cursor-position-after-setting-a-new-delta-in-quill
        setTimeout(() => {
          // set the user's cursor to the very end
          this.quillEditor.setSelection(this.quillEditor.getLength() - 1, 0);
        }, 0);
      }
    },

    /**
     * listen to the changes in isDisabled prop. this will be invoked when the textbox was
     * editable, but is then requested to be read-only.
     * we need to make certain adjustments to make sure that the user cannot enter anything
     * but can still scroll if the answer doesn't fit within the maxHeightLimit
     */
    isDisabled(value) {
      if (value) {
        // remove the placeholder
        // mark the textbox as read-only
        // adjust the height such that the content is scrollable if needed
        this.unsetPlaceholder();
        this.setAsReadOnly();
        this.setToMaxHeight();
      } else {
        // re-adjust things back to as they were
        this.setPlaceholder();
        this.unsetReadOnly();
      }
    },
  },
  mounted() {
    // create an instance of quill
    this.initializeQuillEditor();
  },
};
</script>
<style lang="postcss">
/* classes for quill editor placeholder */
div[name="quillEditorTextarea"] .ql-editor.ql-blank::before {
  @apply text-sm text-gray-400 not-italic;
}
</style>
