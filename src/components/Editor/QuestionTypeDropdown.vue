<template>
  <div>
    <div :class="selectedOptionClass" class="relative">
      <!-- selected option -->
      <button
        type="button"
        @click="toggleDropdownDisplay"
        :disabled="isDisabled"
        class="disabled:opacity-50 w-full flex space-x-2 bg-primary rounded-lg shadow-lg p-2 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm items-center"
        data-test="toggleButton"
        aria-label="toggle options visibility"
      >
        <span class="flex flex-1 space-x-2 items-center">
          <inline-svg
            v-if="selectedOptionHasIcon"
            :src="getImageSource(selectedOption.icon)"
            class="text-white h-4 w-full bp-420:w-2/3 bp-500:w-full sm:w-2/3 fill-current"
          ></inline-svg>
        </span>
        <!-- dropdown icon -->
        <inline-svg
          :src="getImageSource('chevron-down-solid-white.svg')"
          class="h-4 w-4 text-primary fill-current"
          :class="dropdownIconClass"
        ></inline-svg>
      </button>
    </div>
    <!-- options -->
    <div
      class="absolute z-50 mt-1 w-2/3 bp-500:w-1/2 sm:w-1/3 md:w-1/2 xl:w-1/3 z-10 bg-white shadow-lg"
      v-if="showDropdown"
    >
      <ul
        tabindex="-1"
        role="listbox"
        class="max-h-56 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
      >
        <li
          v-for="(option, optionIndex) in options"
          :key="optionIndex"
          role="option"
          class="text-gray-900 cursor-default hover:bg-primary hover:cursor-pointer hover:text-white select-none relative p-2"
          @click="setOption(optionIndex)"
          :data-test="`option-${optionIndex}`"
        >
          <div class="flex space-x-4 items-center">
            <!-- option icon -->
            <inline-svg
              v-if="doesOptionHaveIcon(option)"
              :src="getImageSource(option.icon)"
              class="w-1/4 h-4 fill-current"
              data-test="icon"
            ></inline-svg>
            <!-- option label -->
            <p class="block font-normal w-full" data-test="label">{{ option.label }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";

export default {
  name: "QuestionTypeDropdown",
  data() {
    return {
      localSelectedIndex: this.selectedIndex, // index of the selected option
      showDropdown: false, // whether to show the dropdown for choosing an option
    };
  },
  props: {
    /** the list of options in the dropdown */
    options: {
      type: Array,
      default: () => [],
    },
    /** the default selected index */
    selectedIndex: {
      type: Number,
      default: 0,
    },
    /** whether the dropdown is disabled */
    isDisabled: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    selectedOptionHasIcon() {
      // whether the selected option has an icon
      return this.selectedOption != undefined && this.selectedOption.icon != null;
    },
    dropdownIconClass() {
      return [{ "transform rotate-180": this.showDropdown }, "transition duration-800"];
    },
    selectedOption() {
      // the selected option
      return this.options[this.localSelectedIndex];
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
      this.localSelectedIndex = this.selectedIndex;
    },
    isDisabled(value) {
      if (value && this.showDropdown) {
        this.hideDropdown();
      }
    },
  },
  methods: {
    getImageSource: GenericUtilities.getImageSource,
    doesOptionHaveIcon(option) {
      // whether the given option has an icon
      return option != undefined && option.icon != null;
    },
    hideDropdown() {
      // hides the dropdown when clicking away from the dropdown
      this.showDropdown = false;
      this.$emit("toggle-visibility", this.showDropdown);
    },
    setOption(index) {
      // sets the given index as the selected option index
      if (index == this.localSelectedIndex) return;
      this.localSelectedIndex = index;
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
