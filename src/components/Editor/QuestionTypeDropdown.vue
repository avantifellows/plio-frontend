<template>
  <div>
    <div :class="selectedOptionClass">
      <div class="relative">
        <!-- selected option -->
        <button
          type="button"
          @click="toggleDropdownDisplay"
          class="w-full flex space-x-2 bg-primary rounded-lg shadow-lg p-2 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm items-center"
        >
          <span class="flex flex-1 space-x-2 items-center">
            <inline-svg
              :src="getIconSource(selectedOption.icon)"
              class="text-white h-4 w-full bp-420:w-2/3 bp-500:w-full sm:w-2/3 fill-current"
            ></inline-svg>
          </span>
          <!-- dropdown icon -->
          <inline-svg
            :src="require('@/assets/images/chevron-down-solid-white.svg')"
            class="h-4 w-4 text-primary fill-current"
          ></inline-svg>
        </button>
      </div>
    </div>
    <!-- options -->
    <div
      class="absolute mt-1 w-2/3 bp-500:w-1/2 sm:w-1/3 md:w-1/2 xl:w-1/3 z-10 bg-white shadow-lg"
      v-if="showDropdown"
    >
      <ul
        tabindex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
        aria-activedescendant="listbox-item-3"
        class="max-h-56 text-base py-2 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
      >
        <li
          v-for="(option, optionIndex) in options"
          :key="optionIndex"
          role="option"
          class="text-gray-900 cursor-default hover:bg-primary hover:text-white select-none relative p-2"
          @click="setOption(optionIndex)"
        >
          <div class="flex space-x-4 items-center">
            <inline-svg :src="getIconSource(option.icon)" class="w-1/4 h-4 fill-current"></inline-svg>
            <p class="block font-normal w-full">{{ option.label }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuestionTypeDropdown",
  data() {
    return {
      selectedOptionIndex: this.selectedIndex, // index of the selected option
      showDropdown: false, // whether to show the dropdown for choosing an option
    };
  },
  props: {
    options: {
      // the list of options
      type: Array,
      default: () => [],
    },
    selectedIndex: {
      // the default selected index
      type: Number,
      default: 0,
    },
  },
  computed: {
    selectedOption() {
      // the selected option
      return this.options[this.selectedOptionIndex];
    },
    selectedOptionClass() {
      // class for the selected option
      return {
        "w-1/4 bp-500:w-1/6 md:w-1/4 lg:w-1/6": this.showDropdown,
        "w-3/4 bp-500:w-1/2 md:w-3/4 lg:w-1/2": !this.showDropdown,
      };
    },
  },
  watch: {
    selectedIndex() {
      this.selectedOptionIndex = this.selectedIndex;
    },
  },
  methods: {
    getIconSource(iconName) {
      return require(`@/assets/images/${iconName}`);
    },
    setOption(index) {
      // sets the given index as the selected option index
      this.selectedOptionIndex = index;
      this.$emit("update:selectedIndex", index);
      this.toggleDropdownDisplay();
    },
    toggleDropdownDisplay() {
      // toggle the dropdown for choosing an option
      this.showDropdown = !this.showDropdown;
      this.$emit("toggle-visibility", this.showDropdown);
    },
  },
  emits: ["update:selectedIndex", "toggle-visibility"],
};
</script>
