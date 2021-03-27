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

    <div class="relative flex w-full flex-wrap items-stretch mb-3">
      <!-- left icon -->
      <!-- TODO: icon styling is fixed right now, will make it parametrized  -->
      <span
        v-if="isSideIconEnabled"
        class="z-10 h-full leading-snug font-normal flex text-blueGray-300 absolute bg-transparent rounded text-base w-8 p-3 items-center"
      >
        <inline-svg :src="sideIconObj"></inline-svg>
      </span>

      <!-- input area -->
      <input
        class="px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white rounded text-md border border-blueGray-300 focus:outline-none focus:ring focus:border-blue-300 focus:shadow-outline w-full pl-8"
        type="text"
        name="placeholder"
        :placeholder="placeholder"
        v-model="localValue"
        @input="inputChange"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
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
        };
      },
    },
    value: {
      // the value of the input of the input box
      default: "",
    },
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
      return this.sideIcon.iconSVGName || "";
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
      return this.sideIcon.enabled
    }
  },
  methods: {
    inputChange() {
      this.$emit("input", this.value);
    },
  },
  emits: ["input", "update:value"],
};
</script>
