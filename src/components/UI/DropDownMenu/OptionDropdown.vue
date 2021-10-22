<template>
  <div v-click-away="hideDropdown">
    <div class="flex justify-end">
      <!-- dropdown -->
      <button
        type="button"
        @click="toggleDropdownDisplay"
        class="sm:w-full flex space-x-2 p-2 text-left cursor-default focus:outline-none sm:text-sm items-center bg-gray-200 rounded-md shadow-md"
        data-test="toggleButton"
        aria-label="toggle options visibility"
      >
        <!-- dropdown icon -->
        <inline-svg
          :src="getImageSource('chevron-down-solid.svg')"
          class="h-4 w-4 fill-current hover:cursor-pointer"
          :class="dropdownIconClass"
        ></inline-svg>
      </button>
    </div>
    <!-- options -->
    <div
      class="fixed w-2/3 bp-500:w-1/2 sm:w-1/4 xl:w-1/6 z-10 bg-white shadow-lg"
      :style="optionBoxStyling"
      v-if="showDropdown"
      id="dropdownOptions"
      data-test="optionsContainer"
    >
      <ul
        tabindex="-1"
        role="listbox"
        class="text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        data-test="options"
      >
        <li
          v-for="(option, optionIndex) in options"
          :key="optionIndex"
          role="option"
          class="text-gray-900 select-none relative p-2 px-4"
          :class="optionClass(optionIndex)"
          @click="setOption(optionIndex)"
          :disabled="isOptionDisabled(optionIndex)"
          :data-test="`option-${option.value}`"
        >
          <div class="flex space-x-4 items-center">
            <!-- option icon -->
            <inline-svg
              v-if="doesOptionHaveIcon(option)"
              :src="getImageSource(option.icon)"
              class="w-4 h-4 fill-current"
              data-test="icon"
              width="32"
              height="32"
            ></inline-svg>
            <!-- option icon -->
            <p class="block font-normal w-full" data-test="label">{{ option.label }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Utilities from "@/services/Functional/Utilities.js";

const DEFAULT_OPTIONS_MARGIN_TOP = 2;

export default {
  name: "OptionDropdown",
  data() {
    return {
      showDropdown: false, // whether to show the dropdown for choosing an option
      defaultOptionMarginRem: DEFAULT_OPTIONS_MARGIN_TOP, // default margin-top (in rem) of the option dropdown without any scrolling effect
      optionBoxStyling: {}, // styling for the option dropdown
    };
  },
  props: {
    options: {
      // the list of options in the dropdown
      type: Array,
      default: () => [],
    },
    scrollY: {
      // the number of pixels have been scrolled vertically
      default: 0,
      type: Number,
    },
    overflowMarginTop: {
      // margin to be set from the top when the options would overflow from the screen
      default: 0,
      type: Number,
    },
  },
  computed: {
    defaultOptionMarginPx() {
      // default margin-top (in pixels) of the option dropdown without any scrolling effect
      return this.convertRemToPixels(this.defaultOptionMarginRem);
    },
    dropdownIconClass() {
      // class for the dropdown icon
      return [
        { "transform rotate-180": this.showDropdown },
        "transition ease duration-800 text-gray-600",
      ];
    },
  },
  watch: {
    defaultOptionMarginRem() {
      // update option box margin when the default top margin is updated
      this.setOptionBoxStyling();
    },
    scrollY() {
      // update option box margin when the page is scrolled
      this.setOptionBoxStyling();
    },
    showDropdown(value) {
      // if the dropdown is closed, reset the option box's margin-top
      if (!value) {
        this.defaultOptionMarginRem = DEFAULT_OPTIONS_MARGIN_TOP;
      }
    },
  },
  created() {
    // set the option box margin when the page is created
    this.setOptionBoxStyling();
  },
  methods: {
    ...Utilities,
    optionClass(index) {
      // class for each option
      return {
        "opacity-50 cursor-not-allowed": this.isOptionDisabled(index),
        "hover:bg-primary hover:cursor-pointer hover:text-white": !this.isOptionDisabled(
          index
        ),
      };
    },
    isOptionDisabled(index) {
      // whether the option at the given index is disabled
      return this.options[index].disabled;
    },
    setOptionBoxStyling() {
      // sets the option box margin based on various parameters
      // we need to set this manually as the div has its position as fixed
      if (!this.scrollY) {
        // if there is no scrolling, simply set the margin to the default margin
        this.optionBoxStyling = { "margin-top": `${this.defaultOptionMarginRem}rem` };
      } else {
        // if the user has scrolled, we need to shift the options container accordingly
        let optionsMargin;

        if (this.scrollY <= this.defaultOptionMarginPx) {
          optionsMargin = `${this.defaultOptionMarginPx - this.scrollY}px`;
        } else {
          optionsMargin = `-${this.scrollY - this.defaultOptionMarginPx}px`;
        }

        this.optionBoxStyling = {
          "margin-top": optionsMargin,
        };
      }
    },
    convertRemToPixels(rem) {
      // converts value in rem to pixels
      return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    },
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
      if (this.isOptionDisabled(index)) return;
      this.toggleDropdownDisplay();
      this.$emit("select", index, this.options[index].value);
    },
    isOptionsOverflowBottom() {
      // checks whether the bottom of the options overflows the screen
      const optionsContainer = document.querySelector("#dropdownOptions");
      if (optionsContainer != null) {
        const rectangle = optionsContainer.getBoundingClientRect();
        return rectangle.bottom >= window.innerHeight;
      }
      return false;
    },
    toggleDropdownDisplay() {
      // toggle the dropdown for choosing an option
      this.showDropdown = !this.showDropdown;
      this.$nextTick(() => {
        // enter if the dropdown is going to be shown
        if (this.showDropdown) {
          // if the dropdown is going to go below the screen
          // set the margin-top to fix that
          if (this.isOptionsOverflowBottom()) {
            this.defaultOptionMarginRem = this.overflowMarginTop;
          } else {
            this.defaultOptionMarginRem = DEFAULT_OPTIONS_MARGIN_TOP;
          }
        }
      });
      this.$emit("toggle-visibility", this.showDropdown);
    },
  },
  emits: ["select", "toggle-visibility"],
};
</script>

<style scoped>
li + li {
  border-top: 1px solid #d1d5db;
}
</style>
