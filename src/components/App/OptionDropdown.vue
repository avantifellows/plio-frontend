<template>
  <div>
    <div class="flex justify-end">
      <!-- dropdown -->
      <button
        type="button"
        @click="toggleDropdownDisplay"
        class="disabled:opacity-50 sm:w-full flex space-x-2 p-2 text-left cursor-default focus:outline-none sm:text-sm items-center"
        data-test="toggleButton"
      >
        <!-- dropdown icon -->
        <inline-svg
          :src="getIconSource('chevron-down-solid.svg')"
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
      v-click-away="hideDropdown"
      id="options"
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
          class="text-gray-900 select-none relative p-2 px-4"
          :class="optionClass(optionIndex)"
          @click="setOption(optionIndex)"
          :disabled="isOptionDisabled(optionIndex)"
          :data-test="`option-${optionIndex}`"
        >
          <div class="flex space-x-4 items-center">
            <inline-svg
              v-if="doesOptionHaveIcon(option)"
              :src="getIconSource(option.icon)"
              class="w-4 h-4 fill-current"
              data-test="icon"
            ></inline-svg>
            <p class="block font-normal w-full" data-test="label">{{ option.label }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Utilties from "@/services/Functional/Utilities.js";

export default {
  name: "OptionDropdown",
  data() {
    return {
      showDropdown: false, // whether to show the dropdown for choosing an option
      defaultOptionMarginRem: 2,
      optionBoxStyling: {},
    };
  },
  props: {
    options: {
      // the list of options in the dropdown
      type: Array,
      default: () => [],
    },
    scrollY: {
        default: 0,
        type: Number
    }
  },
  computed: {
    defaultOptionMargin() {
        return this.convertRemToPixels(this.defaultOptionMarginRem)
    },
    dropdownIconClass() {
      return [
        { "transform rotate-180": this.showDropdown },
        "transition ease duration-800 text-gray-600",
      ];
    },
  },
  watch: {
    defaultOptionMarginRem() {
        this.setOptionBoxStyling()
    },
    scrollY() {
        this.setOptionBoxStyling()
    },
    showDropdown() {
        if (!this.showDropdown) {
            this.defaultOptionMarginRem = 2
        }
    }
  },
  created() {
      this.setOptionBoxStyling()
  },
  methods: {
    ...Utilties,
    optionClass(index) {
        // class for each option
        return {
            'opacity-50 cursor-not-allowed': this.isOptionDisabled(index),
            'hover:bg-primary hover:cursor-pointer hover:text-white': !this.isOptionDisabled(index)
        }
    },
    isOptionDisabled(index) {
        // whether the option at the given index is disabled
        return this.options[index].disabled
    },
    setOptionBoxStyling() {
        if (!this.scrollY) {
            this.optionBoxStyling = { 'margin-top': `${this.defaultOptionMarginRem}rem` }
        } else {
            this.optionBoxStyling = { 'margin-top': `-${this.scrollY - this.defaultOptionMargin}px`}
        }
    },
    convertRemToPixels(rem) {
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
      if (this.isOptionDisabled(index)) return
      this.toggleDropdownDisplay();
      this.$emit('select', index, this.options[index].value)
    },
    isOptionsOverflowBottom() {
        // checks whether the bottom of the options overflows the screen
        const optionsContainer = document.querySelector('#options')
        const rectangle = optionsContainer.getBoundingClientRect()
        return rectangle.bottom > window.innerHeight
    },
    toggleDropdownDisplay() {
      // toggle the dropdown for choosing an option
      this.showDropdown = !this.showDropdown;
      this.$nextTick(() => {
          if (this.showDropdown) {
            // dropdown is going to be shown
            if (this.isOptionsOverflowBottom()) {
                this.defaultOptionMarginRem = -12
            } else {
                this.defaultOptionMarginRem = 2
            }
          }
      })
      this.$emit("toggle-visibility", this.showDropdown);
    },
  },
  emits: ['select', "toggle-visibility"],
};
</script>

<style scoped>
li+li { border-top: 1px solid #D1D5DB }
</style>
