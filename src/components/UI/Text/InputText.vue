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

    <div class="flex relative mt-1 items-center">
      <!-- start icon -->
      <div
        v-if="isStartIconEnabled"
        class="absolute font-xl text-blueGray-300 bg-transparent rounded text-base items-center w-5 inset-y-1/4 left-1.5"
        @click="startIconSelected"
        :class="startIconClass"
        v-tooltip="startIconTooltip"
        data-test="startIcon"
      >
        <inline-svg :src="startIconObj"></inline-svg>
      </div>

      <!-- input text area -->
      <input
        class="p-2 border placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-md border-blueGray-300 focus:outline-none focus:ring focus:border-transparent focus:ring-primary focus:shadow-outline w-full overflow-ellipsis border-gray-200"
        type="text"
        name="placeholder"
        :placeholder="placeholder"
        v-model="localValue"
        @input="inputChange"
        @keypress="keyPress"
        :class="[inputAreaClass, boxStyling]"
        :maxLength="maxLength"
        :disabled="isDisabled"
        autocomplete="off"
        data-test="input"
        ref="inputref"
      />

      <!-- end icon -->
      <div
        v-if="isEndIconEnabled"
        class="absolute rounded text-base place-content-center w-5 right-1.5 flex"
        @click="endIconSelected"
        :class="endIconClass"
        v-tooltip="endIconTooltip"
        data-test="endIcon"
      >
        <inline-svg :src="endIconObj" class="place-self-center"></inline-svg>
      </div>
    </div>
  </div>
</template>

<script>
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
          tooltip: "",
          isDisabled: false,
        };
      },
      type: Object,
    },
    /**
     * whether the end icon is enabled and the icon name, if enabled
     */
    endIcon: {
      default: () => {
        return {
          enabled: false,
          name: "delete",
          class: "w-10 h-10 bg-red-500",
          tooltip: "",
          isDisabled: false,
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
      default: () => {},
      type: [Object, String],
    },
    /** maximum length for the input */
    maxLength: {
      default: null,
      type: Number,
    },
    /** whether the input text is disabled */
    isDisabled: {
      default: false,
      type: Boolean,
    },
    /**
     * type of input allowed;
     * if inputType = number, only numbers are allowed as an input
     */
    inputType: {
      default: "",
      type: String,
    },
  },
  computed: {
    isEndIconDisabled() {
      // is end icon disabled or not
      if (this.endIcon.isDisabled != null) return this.endIcon.isDisabled;
      return false;
    },
    isStartIconInteractionDisabled() {
      // is interaction with start icon disabled or not
      if (this.startIcon.isDisabled != null) return this.startIcon.isDisabled;
      return false;
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
    isValidationEnabled() {
      // whether input validation is on
      return this.validation["enabled"] && this.validationMessage != "";
    },
    isValid() {
      // whether the input is valid
      return this.validation["isValid"];
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
    startIconName() {
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
    startIconTooltip() {
      // returns the tooltip text for the side icon
      return this.startIcon.tooltip || "";
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
    isEndIconEnabled() {
      // whether the end icon is enabled
      return this.endIcon.enabled;
    },
    endIconClass() {
      // gets the end icon name from the prop
      return [
        this.endIcon.class,
        { "cursor-not-allowed pointer-events-none opacity-50": this.isEndIconDisabled },
      ];
    },
    endIconTooltip() {
      // returns the tooltip text for the end icon
      return this.endIcon.tooltip || "";
    },
    endIconName() {
      // gets the end icon name from the prop
      return this.endIcon.name;
    },
    endIconObj() {
      // uses the end icon name to fetch the icon object
      // and return it
      var icon;
      if (this.endIcon.enabled) {
        icon = require("@/assets/images/" + this.endIconName + ".svg");
      }
      return icon;
    },
    inputAreaClass() {
      // class for the input element
      return {
        "pl-10": this.isStartIconEnabled,
        "pr-12": this.isEndIconEnabled,
      };
    },
  },
  methods: {
    /** invoked on input change */
    inputChange() {
      this.$emit("input", this.value);
    },
    /** invoked when a key is pressed */
    keyPress(event) {
      if (this.inputType == "number" && !(event.keyCode >= 48 && event.keyCode <= 57)) {
        // prevent anything apart from a number from being entered
        event.preventDefault();
        return;
      }
      this.$emit("keypress", event);
    },
    /** invoked on start icon being selected */
    startIconSelected() {
      this.$emit("start-icon-selected", this.value);
    },
    /** invoked on end icon being selected */
    endIconSelected() {
      this.$emit("end-icon-selected", this.value);
    },
    getSelectionStart() {
      return this.$refs.inputref.selectionStart;
    }
  },
  emits: [
    "input",
    "keypress",
    "update:value",
    "start-icon-selected",
    "end-icon-selected",
  ],
};
</script>
