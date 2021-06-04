<template>
  <div class="overflow-y-auto flex flex-col py-2">
    <!-- question text -->
    <p :class="questionTextClass">
      {{ questionText }}
    </p>
    <!-- option container -->
    <div class="flex mx-4 md:mx-6 xl:mx-10">
      <ul class="w-full">
        <li class="list-none space-y-1 flex flex-col">
          <div
            v-for="(option, optionIndex) in options"
            :key="optionIndex"
            :class="[optionBackgroundClass(optionIndex), optionTextClass]"
          >
            <!-- each option is defined here -->
            <!-- adding <label> so that touch input is just
                  not limited to the radio button -->
            <label :class="labelClass(option)">
              <!-- understand the meaning of the keys here:
               https://www.w3schools.com/tags/att_input_type_radio.asp -->
              <input
                type="radio"
                name="questionOptions"
                :value="option"
                class="place-self-center w-4"
                @click="selectOption(optionIndex)"
                :checked="isOptionChecked(optionIndex)"
                :disabled="isAnswerSubmitted || previewMode"
              />
              <div
                v-html="option"
                class="ml-2 h-full place-self-center leading-tight"
              ></div>
            </label>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    questionText: {
      // text for the question
      default: "",
      type: String,
    },
    options: {
      // options for the question
      default: () => [],
      type: Array,
    },
    correctAnswer: {
      // correct answer for the question
      default: null,
      type: Number,
    },
    selectedAnswer: {
      // index of the answer
      default: null,
      type: Number,
    },
    selectedOption: {
      // index of the option selected but not yet submitted
      default: null,
      type: Number,
    },
    isAnswerSubmitted: {
      // whether the answer has been submitted
      default: false,
      type: Boolean,
    },
    previewMode: {
      // whether the item body will be shown in editor preview mode
      default: false,
      type: Boolean,
    },
  },
  computed: {
    questionTextClass() {
      return [
        {
          "sm:m-4 text-lg md:text-xl lg:text-2xl": !this.previewMode,
          "sm:m-2 text-sm md:text-base lg:text-lg xl:text-xl": this.previewMode,
        },
        "m-2 mx-4 md:mx-6 xl:mx-10 font-bold leading-tight",
      ];
    },
    optionTextClass() {
      return [
        {
          "p-2 text-lg md:text-xl lg:text-2xl": !this.previewMode,
          "p-1 text-sm md:text-base lg:text-lg xl:text-xl": this.previewMode,
        },
        "border pl-4 rounded-md mx-5",
      ];
    },
  },
  methods: {
    labelClass(optionText) {
      return [{ "h-4 sm:h-5": optionText == "" }, "flex content-center"];
    },
    selectOption(optionIndex) {
      // invoked when an option is selected
      this.$emit("option-selected", optionIndex);
    },
    optionBackgroundClass(optionIndex) {
      // returns the background class for the option
      if (!this.isAnswerSubmitted) return {};
      if (optionIndex == this.correctAnswer) return "text-white bg-green-500";
      if (optionIndex == this.selectedAnswer) return "text-white bg-red-500";
    },
    isOptionChecked(optionIndex) {
      // whether the given option index should be checked
      return this.selectedOption == optionIndex;
    },
  },
  emits: ["option-selected"],
};
</script>
