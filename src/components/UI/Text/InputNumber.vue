<template>
  <div class="grid grid-cols-1">
    <div class="flex justify-between">
      <!-- title for the input box -->
      <p class="text-xs pl-2">{{ title }}</p>
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
          <p class="pl-1 place-self-center" :class="validationColorClass">
            {{ validationMessage }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex relative">
      <!-- left icon -->
      <div
        v-if="isStartIconEnabled"
        class="z-10 absolute font-xl text-blueGray-300 bg-transparent rounded text-base items-center w-5 inset-y-1/4 left-1.5"
        @click="startIconSelected"
        :class="startIconClass"
      >
        <inline-svg :src="startIconObj"></inline-svg>
      </div>

      <!-- static text -->
      <div v-if="isStaticTextEnabled" :class="[staticText.class, staticTextDefaultClass]">
        <p class="self-center">
          {{ staticText.text }}
        </p>
      </div>

      <!-- input text area -->
      <input
        class="p-3 border placeholder-blueGray-300 focus:placeholder-white text-blueGray-600 bg-white rounded text-xs sm:text-base focus:outline-none focus:ring-1 focus:shadow-outline focus:border-transparent focus:ring-yellow-400 w-full"
        name="placeholder"
        :placeholder="placeholder"
        v-model="localValue"
        @input="inputChange"
        @keypress="keyPress"
        :class="[inputAreaClass, boxStyling]"
        :min="min"
        :max="max"
        type="number"
        autocomplete="off"
      />
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
    validation: {
      // whether to show any validation for the input
      // format: {enabled: boolean, isValid: boolean, validMessage: String, invalidMessage: String}
      default: () => {
        return {
          enabled: false,
        };
      },
      type: Object,
    },
    startIcon: {
      // whether the start icon is enabled or not
      // and the icon name if enabled
      default: () => {
        return {
          enabled: false,
          name: "check",
          class: "w-10 h-10",
        };
      },
      type: Object,
    },
    value: {
      // the value of the input of the input box
      default: "",
      type: [String, Number],
    },
    min: {
      // minimum value possible in a number textbox
      default: 0,
      type: Number,
    },
    max: {
      // maximum value possible in a number textbox
      default: 999,
      type: Number,
    },
    boxStyling: {
      // pass any classes that need to be added to the input
      // boxes
      default: () => {},
      type: Object,
    },
    maxLength: {
      // maximum length for the input
      default: null,
      type: Number,
    },
    staticText: {
      // whether any static text needs to be displayed
      default: () => {
        return {
          enabled: false,
          text: "",
          class: "",
        };
      },
      type: Object,
    },
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
    isStaticTextEnabled() {
      // whether the static text is to be showed or not
      return this.staticText.enabled || false;
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
      var icon = require("@/assets/images/times-solid.svg");
      if (this.isValid) {
        icon = require("@/assets/images/check-solid.svg");
      }
      return icon;
    },
    startIconName() {
      // gets the start icon name from the prop
      return this.startIcon.name;
    },
    startIconClass() {
      // gets the start icon name from the prop
      return this.startIcon.class;
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
        "pl-20": this.isStartIconEnabled && this.isStaticTextEnabled,
        "pl-10": this.isStartIconEnabled && !this.isStaticTextEnabled,
        "pl-11": !this.isStartIconEnabled && this.isStaticTextEnabled,
      };
    },
    staticTextDefaultClass() {
      // class for the static text next to the input element
      return [
        {
          "pl-2": !this.isStartIconEnabled,
          "pl-9": this.isStartIconEnabled,
        },
        "z-10 flex absolute text-xs sm:text-base inset-y-0 left-0",
      ];
    },
  },
  methods: {
    inputChange() {
      // invoked on input change
      this.$emit("input", this.value);
    },
    keyPress(event) {
      // invoked when a key is pressed
      if (this.maxLength != null && this.localValue.length == this.maxLength) {
        event.preventDefault();
      }
    },
    startIconSelected() {
      // invoked on start icon being selected
      this.$emit("start-icon-selected", this.value);
    },
  },
  emits: ["input", "update:value", "start-icon-selected"],
};
</script>
<style lang="postcss" scoped>
/* the below code is to remove the up and down arrows */
/* that come along with a number text input */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
