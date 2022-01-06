<template>
  <div class="" :class="mainContainerClass">
    <!-- header -->
    <div class="w-full h-12 border-b-2 flex space-x-4">
      <!-- go back to sidebar menu button -->
      <button @click="openSidebarRegion" v-if="isMobileView && !isSidebarRegionOpen">
        <inline-svg
          :src="getImageSource('chevron-left-solid.svg')"
          class="w-6 h-6 text-yellow-600 fill-current my-auto ml-2"
        ></inline-svg>
      </button>
      <!-- tab title in header -->
      <p
        v-if="isMobileView && !isSidebarRegionOpen"
        class="my-auto font-bold text-gray-500"
      >
        {{ $t(`settings.sidebar.tab.${currentSelectedTabName}`) }}
      </p>
      <!-- close settings menu button -->
      <button
        @click="closeMenu"
        v-if="isMobileView && isSidebarRegionOpen"
        class="ml-auto mr-2"
      >
        <inline-svg
          :src="getImageSource('times-solid.svg')"
          class="w-6 h-6 text-yellow-600 fill-current my-auto"
        ></inline-svg>
      </button>
    </div>
    <div class="flex flex-row w-full divide-x-2 grow h-full">
      <!-- sidebar region -->
      <div
        :class="sidebarRegionClass"
        v-if="(isMobileView && isSidebarRegionOpen) || !isMobileView"
      >
        <div v-for="(headerDetails, headerName) in localSettings" :key="headerName">
          <div class="flex flex-col justify-start">
            <!-- header names -->
            <div
              class="font-bold text-gray-500 whitespace-nowrap lg:text-xl md:text-lg bp-500:text-base text-2xl tracking-tighter px-2 pl-5"
              :data-test="`header-${headerName}`"
            >
              {{ $t(`settings.sidebar.header.${headerName}`) + " " + $t("nav.settings") }}
            </div>
            <!-- tab names -->
            <div v-for="(tabDetails, tabName) in headerDetails" :key="tabName">
              <button
                @click="selectTab(tabName, tabDetails)"
                :class="getTabStyleClasses(tabName)"
                :data-test="`tab-${tabName}`"
              >
                {{ $t(`settings.sidebar.tab.${tabName}`) }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- content region -->
      <div
        :class="contentRegionClass"
        v-if="(isMobileView && !isSidebarRegionOpen) || !isMobileView"
      >
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
            data-test="setting-input"
          />
        </div>
        <div class="w-full flex flex-col mt-10 bp-500:mt-0">
          <!-- info for settings -->
          <div
            class="mt-12 sm:mt-8 md:mt-8 w-full p-1 bp-500:p-2 rounded-md border border-yellow-400 flex space-x-4 mb-4"
            v-if="isInfoMessageVisible"
            data-test="info-message"
          >
            <!-- icon -->
            <div class="w-1/10 h-full flex my-auto">
              <inline-svg
                :src="getImageSource('exclamation-circle-solid.svg')"
                class="lg:w-8 lg:h-8 bp-500:w-6 bp-500:h-6 h-4 w-4 text-yellow-600 fill-current my-auto"
              ></inline-svg>
            </div>
            <!-- text -->
            <p
              class="text-yellow-600 my-auto text-xs md:text-sm lg:text-base tracking-tighter font-bold"
            >
              {{ $t("settings.menu.info") }}
            </p>
          </div>
        </div>
        <!-- footer buttons - save/cancel -->
        <div
          class="w-full flex flex-row bp-500:justify-end justify-around space-x-2 bp-500:mt-auto mt-2"
        >
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
        "bp-500:px-7 bp-500:py-2 bp-360:px-16 px-10 py-2 transition ease-in duration-200 text-center text-base font-semibold shadow-lg rounded-lg bg-white border-b-outset",
      saveButtonClass:
        "bp-500:px-8 bp-500:py-2 bp-360:px-16 px-10 py-2 transition ease-in duration-200 text-center font-semibold shadow-lg rounded-lg bg-primary border-b-outset border-primary",
      saveButtonTitleConfig: {
        value: this.isSaveAndPublishEnabled
          ? this.$t("settings.buttons.saveAndPublish")
          : this.$t("settings.buttons.save"),
        class: "text-white lg:text-base md:text-sm bp-500:text-xs text-lg font-bold",
      },
      cancelButtonTitleConfig: {
        value: this.$t("settings.buttons.cancel"),
        class: "text-primary lg:text-base md:text-sm bp-500:text-xs text-lg font-bold",
      },
      settingTitleTextClass:
        "text-xl bp-500:text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-gray-500",
      settingSubTitleTextClass:
        "text-sm bp-500:text-xsm md:text-sm lg:text-base text-gray-400",
      settingItemStyleClass: "flex flex-row hover:bg-gray-100 xl:p-4 lg:p-3 md:p-2 p-1",
      contentRegionClass:
        "h-full w-full flex flex-col 2xl:px-10 xl:px-8 lg:px-6 md:px-4 bp-500:px-3 px-6 2xl:pt-10 xl:pt-8 lg:pt-6 md:pt-4 bp-500:pt-2 pt-6 pb-5",
      currentSelectedTab: {}, // object containing details about the current selected tab
      hasUnsavedChanges: false, // if there are any unsaved setting changes
      isSidebarRegionOpen: true, // if the sidebar region is visible
      screenWidth: window.innerWidth, // initial screen width
      isMobileView: window.innerWidth < 500 ? true : false, // if current screen size is classified as mobile view
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
    isSaveAndPublishEnabled: {
      // If the save button will also act as the publish button
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
    screenWidth() {
      // Update the `isMobileView` variable as screen width changes
      this.isMobileView = this.screenWidth < 500 ? true : false;
    },
  },
  created() {
    // Set a default selected tab
    this.setCurrentSelectedTab();

    window.addEventListener("resize", this.handleScreenSizeChange);
  },
  unmounted() {
    window.removeEventListener("resize", this.handleScreenSizeChange);
  },
  computed: {
    sidebarRegionClass() {
      return [
        {
          "w-35/100": !this.isMobileView,
          "w-full": this.isMobileView,
        },
        "h-full flex flex-col justify-start space-y-10 pt-4",
      ];
    },
    mainContainerClass() {
      return [
        {
          "left-0 right-0 top-0 bottom-0": this.isMobileView,
          "top-15/100 bottom-35/100 2xl:left-20/100 2xl:right-20/100 xl:left-15/100 xl:right-15/100 sm:left-10/100 sm:right-10/100 left-5/100 right-5/100": !this
            .isMobileView,
        },
        "border-2 border-gray-200 shadow-lg rounded-lg bg-white m-auto flex flex-col",
      ];
    },
    saveButtonTooltip() {
      return this.hasUnsavedChanges
        ? ""
        : this.$t("tooltip.settings.buttons.save.noUnsavedChanges");
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
    localSettings() {
      if (this.settings == null) return null;
      return clonedeep(this.settings);
    },
  },
  methods: {
    ...Utilities,
    /**
     * Opens the side bar region - for mobile view
     */
    openSidebarRegion() {
      this.isSidebarRegionOpen = true;
      this.currentSelectedTab = {};
    },
    handleScreenSizeChange() {
      this.screenWidth = window.innerWidth;
    },
    /**
     * Get style classes for how a tab looks on the sidebar region
     * @param {String} tabName - The name of the tab for which the style classes are required
     */
    getTabStyleClasses(tabName) {
      return [
        {
          "text-primary bg-gray-100 border-r-outset border-yellow-500":
            this.currentSelectedTabName == tabName && !this.isMobileView,
          "text-gray-500": this.isMobileView,
        },
        "font-medium w-full capitalize hover:bg-gray-100 leading-relaxed whitespace-nowrap lg:text-base md:text-sm bp-500:text-xs text-lg pl-6 text-left py-1",
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

      if (this.isMobileView) this.isSidebarRegionOpen = false;
    },
    /**
     * Emit the changed settings and close the menu
     */
    saveChanges() {
      this.$emit("update:settings", this.localSettings);
      if (this.isSaveAndPublishEnabled) this.$emit("publish");
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
          "ml-auto rounded my-auto lg:h-10 lg:w-10 md:h-8 md:w-8 sm:h-6 sm:w-6 bp-500:w-6 bp-500:h-6 h-8 w-8 border-2 bg-gray-100 text-primary hover:cursor-pointer",
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
  emits: ["window-closed", "update:settings", "publish"],
};
</script>
