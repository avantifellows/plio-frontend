<template>
  <div class="overflow-y-scroll flex flex-col">
    <!-- question text -->
    <p
      class="m-2 sm:m-4 mx-4 md:mx-6 xl:mx-10 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl"
    >
      {{ questionText }}
    </p>
    <!-- option container -->
    <div class="flex mx-4 md:mx-6 xl:mx-10">
      <ul>
        <li class="list-none">
          <div
            v-for="(option, optionIndex) in options"
            :key="optionIndex"
            class="m-2 sm:m-4 text-xl sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl"
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
                v-model="localSelectedOption"
                :value="option"
                class="place-self-center w-4 h-4 sm:w-6 sm:h-6 lg:w-10 lg:h-10"
                @click="selectOption(optionIndex)"
              />
              <div v-html="option" class="ml-2 sm:ml-4 lg:ml-6"></div>
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
      //  options for the question
      default: () => [],
      type: Array,
    },
    correctAnswer: {
      // correct answer for the question
      default: -1,
      type: Number,
    },
    selectedOption: {
      // index of the option to select
      default: null,
      type: Number,
    },
    showSelectedOptionResult: {
      // whether to show the selected option's result
      default: false,
      type: Boolean,
    },
  },
  computed: {
    localSelectedOption: {
      // local copy of the selectedOption prop
      get() {
        return this.selectedOption;
      },
      set(localSelectedOption) {
        this.$emit("update:selectedOption", localSelectedOption);
      },
    },
  },
  methods: {
    selectOption(optionIndex) {
      this.$emit("option-selected", optionIndex);
    },
  },
  emits: ["update:selectedOption", "option-selected"],
};
</script>
