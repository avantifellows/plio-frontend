<template>
  <div class="grid grid-cols-1 gap-y-1">
    <div class="flex justify-between">
      <!-- title for the input box -->
      <p class="text-xs pl-2">{{ title }}</p>
      <!-- input validation -->
      <div class="pr-2" v-if="isValidationEnabled">
        <div class="flex text-xs" :class="validationColor">
          <!-- valid icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            v-if="isValid"
            class="place-self-center w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <!-- invalid icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            v-else
            class="place-self-center w-5 h-5"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          <!-- validation message -->
          <p class="pl-1 place-self-center">{{ validationMessage }}</p>
        </div>
      </div>
    </div>
    <!-- input area -->
    <input
      class="resize-none border rounded-md h-10 pl-4 col-span-1"
      type="text"
      name="placeholder"
      :placeholder="placeholder"
      v-model="value"
      @input="inputChange"
    />
  </div>
</template>

<script>
// import Check from "@/components/UI/Icons/Check.vue";
// import Cross from "@/components/UI/Icons/Cross.vue";

export default {
  // components: {
  //   Check,
  //   Cross,
  // },
  data() {
    return {
      value: "", // value of the user input
    };
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
  },
  computed: {
    isValidationEnabled() {
      return this.validation["enabled"];
    },
    isValid() {
      return this.isValidationEnabled && this.validation["isValid"];
    },
    validationColor() {
      if (this.isValid) {
        return "text-green-600";
      }
      return "text-red-600";
    },
    validationMessage() {
      if (this.isValid) {
        return this.validation["validMessage"];
      }
      return this.validation["invalidMessage"];
    },
    validationIcon() {
      // if (this.isValid) {
      //   return ["fas", "check"];
      // }
      // return ["fas", "times"];
      if (this.isValid) {
        return "@/assets/images/copy.svg";
      }
      return "@/assets/images/play.svg";
    },
  },
  methods: {
    inputChange() {
      this.$emit("input", this.value);
    },
  },
  emits: ["input"],
};
</script>
