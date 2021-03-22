<template>
  <div class="grid grid-cols-1 gap-y-1">
    <div class="flex justify-between">
      <!-- title for the input box -->
      <p class="text-xs pl-2">{{ title }}</p>
      <!-- input validation -->
      <div class="pr-2" v-if="isValidationEnabled">
        <div class="flex text-xs" :class="validationColor">
          <!-- validation icon -->
          <font-awesome-icon
            :icon="['fas', 'check']"
            v-if="isValid"
            class="place-self-center"
          ></font-awesome-icon>
          <font-awesome-icon
            :icon="['fas', 'times']"
            v-else
            class="place-self-center"
          ></font-awesome-icon>
          <!-- validation message -->
          <p class="pl-1">{{ validationMessage }}</p>
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
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
library.add(faCheck, faTimes);

export default {
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
  },
  methods: {
    inputChange() {
      this.$emit("input", this.value);
    },
  },
  emits: ["input"],
};
</script>
