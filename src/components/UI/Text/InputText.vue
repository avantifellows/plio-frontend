<template>
  <div class="grid grid-cols-1 gap-y-1">
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
        v-if="isSideIconEnabled"
        class="absolute font-xl text-blueGray-300 bg-transparent rounded text-base items-center text-xl w-5 inset-y-1/4 left-1.5"
        @click="selectThisBox"
        :class="sideIconClass"
      >
        <inline-svg :src="sideIconObj"></inline-svg>
      </div>

      <!-- input text area -->
      <input
        class="p-2 border placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-md border-blueGray-300 focus:outline-none focus:shadow-outline w-full"
        type="text"
        name="placeholder"
        :placeholder="placeholder"
        v-model="localValue"
        @input="inputChange"
        :class="[inputAreaClass, boxStyling]"
        :maxLength="maxLength"
        :disabled="isDisabled"
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
    sideIcon: {
      // whether side icon is enabled or not
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
    boxStyling: {
      // pass any classes that need to be added to the input
      // boxes
      default: () => {},
      type: [Object, String]
    },
    maxLength: {
      default: null,
      type: Number
    },
    isDisabled: {
      default: false,
      type: Boolean
    }
  },
  computed: {
    localValue: {
      get() {
        return this.value;
      },
      set(localValue) {
        this.$emit("update:value", localValue);
      },
    },
    isValidationEnabled() {
      return this.validation["enabled"];
    },
    isValid() {
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
    sideIconName() {
      // gets the side icon name from the prop
      return this.sideIcon.name;
    },
    sideIconClass() {
      // gets the side icon name from the prop
      return this.sideIcon.class;
    },
    sideIconObj() {
      // uses the sideicon name to fetch the icon object
      // and return it
      var icon;
      if (this.sideIcon.enabled) {
        icon = require("@/assets/images/" + this.sideIconName + ".svg");
      }
      return icon;
    },
    isSideIconEnabled() {
      return this.sideIcon.enabled;
    },
    inputAreaClass() {
      return {
        "pl-10": this.isSideIconEnabled,
      };
    },
  },
  methods: {
    inputChange() {
      this.$emit("input", this.value);
    },
    selectThisBox() {
      this.$emit("box-selected", this.value);
    },
  },
  emits: ["input", "update:value", "box-selected"],
};
</script>
