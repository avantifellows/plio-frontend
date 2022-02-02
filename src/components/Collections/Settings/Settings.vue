<template>
  <div :class="mainContainerClass">
    <!-- header -->
    <div class="w-full h-12 border-b-2 flex space-x-4">
      <!-- close settings button -->
      <button @click="closeMenu" class="ml-auto mr-2">
        <inline-svg
          :src="getImageSource('times-solid.svg')"
          class="w-6 h-6 text-yellow-600 fill-current my-auto"
        ></inline-svg>
      </button>
    </div>
    <div class="flex flex-row w-full divide-x-2 h-full">
      <!-- sidebar region -->
      <div :class="sidebarRegionClass">
        <div
          v-for="[headerName, headerDetails] in localSettings"
          :key="headerName"
          class="bp-500:my-0 my-4"
        >
          <div class="flex flex-col justify-start">
            <!-- header names -->
            <div
              class="font-bold text-gray-500 whitespace-nowrap lg:text-xl md:text-lg bp-500:text-base text-3xl tracking-tighter px-2 pl-5 bp-500:py-0 py-4"
              :data-test="`header-${headerName}`"
            >
              {{ $t(`settings.sidebar.header.${headerName}`) + " " + $t("nav.settings") }}
            </div>
            <!-- tab names -->
            <div
              v-for="[tabName, tabDetails] in headerDetails"
              :key="tabName"
              class="flex flex-col"
            >
              <div class="flex flex-row bp-500:ml-0 ml-4">
                <inline-svg
                  v-if="isMobileView"
                  @click="selectTab(tabName, tabDetails)"
                  :src="getImageSource('play.svg')"
                  :class="getTabToggleClass(tabName)"
                ></inline-svg>
                <button
                  @click="selectTab(tabName, tabDetails)"
                  :class="getTabStyleClasses(tabName)"
                  :data-test="`tab-${tabName}`"
                >
                  {{ $t(`settings.sidebar.tab.${tabName}`) }}
                </button>
              </div>

              <!-- content region in mobile view -->
              <div v-if="isMobileView && currentSelectedTabName == tabName">
                <div
                  v-for="[leafName, leafDetails] in currentSelectedTabDetails"
                  :key="leafName"
                  :class="settingItemStyleClass"
                >
                  <div class="flex flex-col my-auto mr-4">
                    <p :class="settingTitleTextClass">{{ $t(leafDetails.title) }}</p>
                    <p
                      :class="settingDescriptionTextClass"
                      v-if="leafDetails.description != null"
                    >
                      {{ $t(leafDetails.description) || "" }}
                    </p>
                    <!-- badge to notify an admin setting -->
                    <simple-badge
                      v-if="leafDetails.isOrgSetting"
                      text="admin"
                      :badgeClass="adminBadgeClass"
                    ></simple-badge>
                  </div>
                  <input
                    v-if="leafDetails.type == 'checkbox'"
                    type="checkbox"
                    :class="getInputElementClass(leafDetails.type)"
                    style="box-shadow: none"
                    :checked="leafDetails.value"
                    @change="updateCheckboxSetting($event.target.checked, leafDetails)"
                    data-test="setting-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- save / cancel buttons in mobile view -->
        <div
          v-if="isMobileView"
          class="w-full flex justify-around space-x-2 mt-auto mb-10"
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
        </div>
      </div>
      <!-- content region -->
      <div :class="contentRegionClass" v-if="!isMobileView">
        <div
          v-for="[leafName, leafDetails] in currentSelectedTabDetails"
          :key="leafName"
          :class="settingItemStyleClass"
        >
          <div class="flex flex-col my-auto mr-4">
            <p :class="settingTitleTextClass">{{ $t(leafDetails.title) }}</p>
            <p
              :class="settingDescriptionTextClass"
              v-if="leafDetails.description != null"
            >
              {{ $t(leafDetails.description) || "" }}
            </p>
            <!-- badge to notify an admin setting -->
            <simple-badge
              v-if="leafDetails.isOrgSetting"
              :text="$t('settings.badge.admin')"
              :badgeClass="adminBadgeClass"
            ></simple-badge>
          </div>
          <input
            v-if="leafDetails.type == 'checkbox'"
            type="checkbox"
            :class="getInputElementClass(leafDetails.type)"
            style="box-shadow: none"
            :checked="leafDetails.value"
            @change="updateCheckboxSetting($event.target.checked, leafDetails)"
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
                class="lg:w-8 lg:h-8 bp-500:w-6 bp-500:h-6 h-4 w-4 text-yellow-600 fill-current my-auto transform rotate-180"
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
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import Utilities from "@/services/Functional/Utilities.js";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";

let clonedeep = require("lodash.clonedeep");

export default {
  components: {
    IconButton,
    SimpleBadge,
  },
  data() {
    return {
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
        "text-base bp-500:text-base md:text-lg lg:text-2xl font-semibold text-gray-500",
      settingDescriptionTextClass:
        "text-sm bp-500:text-xsm md:text-sm lg:text-base text-gray-400",
      settingItemStyleClass:
        "flex flex-row hover:bg-gray-100 xl:p-4 lg:p-3 md:p-2 p-1 bp-500:mx-0 mx-8",
      contentRegionClass:
        "h-full w-full flex flex-col 2xl:px-10 xl:px-8 lg:px-6 md:px-4 bp-500:px-3 px-6 2xl:pt-10 xl:pt-8 lg:pt-6 md:pt-4 bp-500:pt-2 pt-6 pb-5",
      currentSelectedTab: new Map(), // map containing details about the current selected tab
      hasUnsavedChanges: false, // if there are any unsaved setting changes
      isSidebarRegionOpen: true, // if the sidebar region is visible
      screenWidth: window.innerWidth, // initial screen width
      isMobileView: window.innerWidth < 500 ? true : false, // if current screen size is classified as mobile view
      adminBadgeClass:
        "rounded-md border text-black text-xs px-2 border-gray-500 bg-gray-200",
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
    if (!this.isMobileView) {
      // Set a default selected tab if the screen is not in mobile view
      this.setCurrentSelectedTab();
    }

    window.addEventListener("resize", this.handleScreenSizeChange);
  },
  unmounted() {
    window.removeEventListener("resize", this.handleScreenSizeChange);
  },
  computed: {
    sidebarRegionClass() {
      return [
        {
          "w-35/100 space-y-10": !this.isMobileView,
          "w-full": this.isMobileView,
        },
        "h-full flex flex-col justify-start pt-4",
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
      return [...this.currentSelectedTab.keys()][0];
    },
    /**
     * Get the details of the current selected tab
     */
    currentSelectedTabDetails() {
      return this.currentSelectedTab.get(this.currentSelectedTabName);
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
     * Get the style classes for a particular toggable tab
     */
    getTabToggleClass(tabName) {
      return [
        {
          "transform rotate-90": tabName == this.currentSelectedTabName,
        },
        "w-4 h-4 text-yellow-600 fill-current my-auto transition duration-800 mr-2",
      ];
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
          "text-primary bg-gray-100 border-r-outset border-yellow-500 pl-6 hover:bg-gray-100":
            this.currentSelectedTabName == tabName && !this.isMobileView,
          "text-gray-500 ": this.currentSelectedTabName != tabName && this.isMobileView,
          "text-primary": this.currentSelectedTabName == tabName && this.isMobileView,
          "leading-snug": this.isMobileView,
          "leading-relaxed pl-6": !this.isMobileView,
        },
        "font-medium w-full capitalize whitespace-nowrap lg:text-base md:text-sm bp-500:text-xs text-xl text-left py-1",
      ];
    },
    /**
     * Set the tab which will be selected by default when the menu opens up
     */
    setCurrentSelectedTab() {
      if (this.localSettings != null) {
        let firstHeaderName = [...this.localSettings.keys()][0];
        let firstTabName = [...this.localSettings.get(firstHeaderName).keys()][0];
        let firstTabDetails = this.localSettings.get(firstHeaderName).get(firstTabName);
        this.currentSelectedTab.set(firstTabName, firstTabDetails);
      }
    },
    /**
     * Mark a tab as selected/unselected
     * @param {String} tabName - The name of the tab that is to be marked selected
     * @param {Object} tabDetails - The details of the tab that is to be marked selected
     */
    selectTab(tabName, tabDetails) {
      if (this.isMobileView && tabName == this.currentSelectedTabName) {
        // In mobile view, the tabs are toggable
        // If someone clicks on an already opened tab, close it and currentSelectedTab
        // will be set to empty
        this.currentSelectedTab.clear();
        this.currentSelectedTab = new Map();
      } else {
        // Mark the clicked tab as the currentSelectedTab
        this.currentSelectedTab.clear();
        this.currentSelectedTab.set(tabName, tabDetails);
      }
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
          "ml-auto rounded my-auto lg:h-10 lg:w-10 md:h-8 md:w-8 sm:h-6 sm:w-6 bp-500:w-6 bp-500:h-6 h-8 w-8 border-2 bg-gray-100 text-primary hover:cursor-pointer",
      };
      return inputType in mapping ? mapping[inputType] : "";
    },
    /**
     * Update the settings when a checkbox input type is changed
     * @param {Boolean} isChecked - If the checkbox has been marked checked
     * @param {Object} leafDetails - The setting to which this checkbox belongs to
     */
    updateCheckboxSetting(isChecked, leafDetails) {
      this.hasUnsavedChanges = true;
      leafDetails.value = isChecked;
    },
  },
  emits: ["window-closed", "update:settings", "publish"],
};
</script>
