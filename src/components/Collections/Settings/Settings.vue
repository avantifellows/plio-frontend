<template>
  <div
    class="border-2 border-gray-200 shadow-lg rounded-md p-2 bg-white w-46 m-auto px-4"
  >
    <div class="flex flex-row w-full divide-x-2 py-3">
      <!-- sidebar region -->
      <div class="h-full flex flex-col justify-start w-1/4 space-y-10 pr-3">
        <div v-for="(headerDetails, headerName) in localSettings" :key="headerName">
          <div class="flex flex-col justify-start">
            <!-- header names -->
            <div
              class="uppercase font-mono font-bold tracking-tighter text-gray-500 whitespace-nowrap lg:text-md md:text-base sm:text-sm text-xsm"
            >
              {{ $t(`settings.sidebar.header.${headerName}`) + " " + $t("nav.settings") }}
            </div>
            <!-- tab names -->
            <div v-for="(tabDetails, tabName) in headerDetails" :key="tabName">
              <button
                @click="selectTab(tabName, tabDetails)"
                :class="getTabStyleClasses(tabName)"
              >
                {{ $t(`settings.sidebar.tab.${tabName}`) }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- content region -->
      <div class="h-full w-full flex flex-col">
        <div
          v-for="(settingDetails, settingName) in currentSelectedTabDetails"
          :key="settingName"
          :class="settingItemStyleClass"
        >
          <div class="flex flex-col my-auto mr-4">
            <p :class="settingTitleTextClass">{{ $t(settingDetails.title) }}</p>
            <p :class="settingSubTitleTextClass" v-if="settingDetails.subTitle != null">
              {{ $t(settingDetails.subTitle) || "" }}
            </p>
          </div>
          <input
            v-if="settingDetails.type == 'checkbox'"
            type="checkbox"
            :class="getInputElementClass(settingDetails.type)"
            style="box-shadow: none"
            :checked="settingDetails.value"
            @change="updateCheckboxSetting($event.target.checked, settingDetails)"
          />
        </div>
        <div class="w-full flex flex-col lg:px-8 md:px-4 px-1">
          <!-- info for settings -->
          <div
            class="mt-12 sm:mt-8 md:mt-8 w-full p-1 bp-500:p-2 rounded-md border border-yellow-400 flex space-x-4 mb-4"
            v-if="isInfoMessageVisible"
          >
            <!-- icon -->
            <div class="w-1/10 h-full flex my-auto">
              <inline-svg
                :src="getImageSource('exclamation-circle-solid.svg')"
                class="lg:w-8 lg:h-8 bp-500:w-6 bp-500:h-6 h-4 w-4 text-yellow-600 fill-current my-auto"
              ></inline-svg>
            </div>
            <!-- text -->
            <p class="text-yellow-600 my-auto text-xsm md:text-sm tracking-tighter">
              {{ $t("settings.menu.info") }}
            </p>
          </div>
        </div>
        <!-- footer buttons - save/cancel -->
        <div class="w-full flex flex-row justify-end space-x-2 pt-6">
          <!-- save button -->
          <span v-tooltip="saveButtonTooltip" tabindex="0">
            <!-- unsaved changes ping -->
            <div
              class="w-3 h-3 bg-primary animate-ping rounded-full absolute opacity-75"
              v-if="hasUnsavedChanges"
            ></div>
            <icon-button
              :buttonClass="saveButtonClass"
              class="relative"
              :titleConfig="saveButtonTitleConfig"
              @click="saveChanges"
              :isDisabled="!hasUnsavedChanges"
              data-test="saveButton"
            ></icon-button>
          </span>
          <!-- cancel button -->
          <icon-button
            :buttonClass="cancelButtonClass"
            :titleConfig="cancelButtonTitleConfig"
            @click="closeMenu"
            data-test="cancelButton"
          ></icon-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
var clonedeep = require("lodash.clonedeep");
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import Utilities from "@/services/Functional/Utilities.js";
export default {
  components: {
    IconButton,
  },
  data() {
    return {
      closeButtonIconConfig: {
        enabled: true,
        iconName: "times-circle-white",
        iconClass: "text-primary fill-current h-8 w-8",
      },
      closeButtonClass: "lg:w-10 lg:h-10 bp-500:w-6 bp-500:h-6 h-4 w-4",
      cancelButtonClass:
        "md:py-2 md:px-4 py-1 px-2 transition ease-in duration-200 text-center text-base font-semibold shadow-md rounded-lg bg-white",
      saveButtonTitleConfig: {
        value: this.$t("settings.buttons.save"),
        class:
          "text-white text-sm sm:text-base md:text-md lg:text-lg xl:text-xl font-bold",
      },
      cancelButtonTitleConfig: {
        value: this.$t("settings.buttons.cancel"),
        class:
          "text-primary text-sm sm:text-base md:text-md lg:text-lg xl:text-xl font-bold",
      },
      settingTitleTextClass:
        "text-xs bp-500:text-sm sm:text-base md:text-lg lg:text-xl font-semibold",
      settingSubTitleTextClass: "text-xsm md:text-sm lg:text-base",
      settingItemStyleClass:
        "flex flex-row flex-1 w-full h-12 sm:h-16 md:h-18 lg:h-20 px-2 sm:px-4 md:px-6 lg:px-10 hover:bg-gray-100",
      currentSelectedTab: {}, // object containing details about the current selected tab
      hasUnsavedChanges: false, // if there are any unsaved setting changes
    };
  },
  props: {
    settings: {
      // This contains all the settings and their metadata which needs to be rendered
      type: Object,
      default: null,
    },
    isInfoMessageVisible: {
      // If the info message is visible in the settings menu
      type: Boolean,
      default: false,
    },
  },
  watch: {
    settings: {
      handler() {
        // Whenever the settings prop changes, set a default selected tab
        this.setCurrentSelectedTab();
      },
      deep: true,
    },
  },
  created() {
    // Set a default selected tab
    this.setCurrentSelectedTab();
  },
  computed: {
    saveButtonTooltip() {
      return this.hasUnsavedChanges
        ? this.$t("tooltip.settings.buttons.save.hasUnsavedChanges")
        : this.$t("tooltip.settings.buttons.save.noUnsavedChanges");
    },
    saveButtonClass() {
      return [
        "md:py-2 md:px-4 py-1 px-2 transition ease-in duration-200 text-center font-semibold shadow-md rounded-lg bg-primary",
      ];
    },
    /**
     * Get the name of the current selected tab
     */
    currentSelectedTabName() {
      return Object.keys(this.currentSelectedTab)[0];
    },
    /**
     * Get the details of the current selected tab
     */
    currentSelectedTabDetails() {
      return Object.values(this.currentSelectedTab)[0];
    },
    /**
     * A local version of the settings prop
     */
    localSettings: {
      get() {
        if (this.settings == null) return null;
        return clonedeep(this.settings);
      },
      set(value) {
        this.localSettings = value;
      },
    },
  },
  methods: {
    ...Utilities,
    /**
     * Get style classes for how a tab looks on the sidebar region
     * @param {String} tabName - The name of the tab for which the style classes are required
     */
    getTabStyleClasses(tabName) {
      return [
        {
          "text-primary bg-gray-100": this.currentSelectedTabName == tabName,
        },
        "capitalize font-semibold w-full text-center hover:bg-gray-100 rounded-lg leading-relaxed whitespace-nowrap lg:text-lg md:text-md sm:text-base bp-500:text-sm text-xs",
      ];
    },
    /**
     * Set the tab which will be selected by default when the menu opens up
     */
    setCurrentSelectedTab() {
      if (this.localSettings != null) {
        let firstHeaderName = Object.keys(this.localSettings)[0];
        let firstTabName = Object.keys(this.localSettings[firstHeaderName])[0];
        let firstTabDetails = Object.values(this.localSettings[firstHeaderName])[0];
        this.currentSelectedTab[firstTabName] = firstTabDetails;
      }
    },
    /**
     * Mark a tab as selected
     * @param {String} tabName - The name of the tab that is to be marked selected
     * @param {Object} tabDetails - The details of the tab that is to be marked selected
     */
    selectTab(tabName, tabDetails) {
      let selectedTab = {};
      selectedTab[tabName] = tabDetails;
      this.currentSelectedTab = selectedTab;
    },
    /**
     * Emit the changed settings and close the menu
     */
    saveChanges() {
      this.$emit("update:settings", this.localSettings);
      this.$emit("window-closed");
    },
    /**
     * Close the settings menu
     */
    closeMenu() {
      this.$emit("window-closed");
    },
    /**
     * Get the styling classes for input elements
     * @param {String} inputType - The type of the input element - checkboxes, sliders, etc...
     */
    getInputElementClass(inputType) {
      let mapping = {
        checkbox:
          "ml-auto rounded my-auto lg:h-14 lg:w-14 md:h-10 md:w-10 sm:h-8 sm:w-8 w-6 h-6 border-none bg-gray-200 text-primary",
      };
      return inputType in mapping ? mapping[inputType] : "";
    },
    /**
     * Update the settings when a checkbox input type is changed
     * @param {Boolean} isChecked - If the checkbox has been marked checked
     * @param {Object} settingDetails - The setting to which this checkbox belongs to
     */
    updateCheckboxSetting(isChecked, settingDetails) {
      this.hasUnsavedChanges = true;
      settingDetails.value = isChecked;
    },
  },
  emits: ["window-closed", "update:settings"],
};
</script>
