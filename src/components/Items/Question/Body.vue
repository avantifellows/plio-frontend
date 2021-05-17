<template>
  <div class="overflow-y-auto flex flex-col py-4">
    <!-- question text -->
    <p
      class="m-2 sm:m-4 mx-4 md:mx-6 xl:mx-10 font-bold text-lg md:text-xl lg:text-2xl leading-tight"
    >
      {{ questionText }}
    </p>
    <!-- option container -->
    <div class="flex mx-4 md:mx-6 xl:mx-10">
      <ul class="w-full">
        <li class="list-none space-x-1 flex flex-col">
          <div
            v-for="(option, optionIndex) in options"
            :key="optionIndex"
            class="border p-2 pl-4 text-lg md:text-xl lg:text-2xl rounded-md mx-5"
            :class="optionBackgroundClass(optionIndex)"
          >
            <!-- each option is defined here -->
            <!-- adding <label> so that touch input is just
                  not limited to the radio button -->
            <label class="flex content-center">
              <!-- understand the meaning of the keys here:
               https://www.w3schools.com/tags/att_input_type_radio.asp -->
              <input
                type="radio"
                name="questionOptions"
                :value="option"
                class="place-self-center w-4"
                @click="selectOption(optionIndex)"
                :checked="isOptionChecked(optionIndex)"
                :disabled="isAnswerSubmitted"
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
  },
  methods: {
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
