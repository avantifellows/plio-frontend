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
              {{ $t(`settings.sidebar.header.${headerName}`) }}
            </div>
            <!-- tab names -->
            <div
              v-for="[tabName, tabDetails] in headerDetails"
              :key="tabName"
              class="flex flex-col"
            >
              <div class="flex flex-row bp-500:ml-0 ml-4">
                <inline-svg
                  v-if="isMobileScreen"
                  @click="selectTab(tabName, tabDetails, headerName)"
                  :src="getImageSource('play.svg')"
                  :class="getTabToggleClass(tabName)"
                ></inline-svg>
                <button
                  @click="selectTab(tabName, tabDetails, headerName)"
                  :class="getTabStyleClasses(tabName)"
                  :data-test="`tab-${tabName}`"
                >
                  {{ $t(`settings.sidebar.tab.${tabName}`) }}
                </button>
              </div>

              <!-- content region in mobile view -->
              <div v-if="isMobileScreen && isTabSelected(tabName)">
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
                    <!-- badge to mark an admin setting -->
                    <simple-badge
                      v-if="leafDetails.isWorkspaceSetting"
                      text="admin"
                      :badgeClass="adminBadgeClass"
                    ></simple-badge>
                  </div>
                  <input
                    v-if="isCheckboxSetting(leafDetails.type)"
                    type="checkbox"
                    :class="getInputElementClass(leafDetails.type)"
                    style="box-shadow: none"
                    :checked="leafDetails.value"
                    @change="
                      updateCheckboxSetting($event.target.checked, leafDetails, leafName)
                    "
                    data-test="input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- save button in mobile view -->
        <div
          v-if="isMobileScreen"
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
      <div :class="contentRegionClass" v-if="!isMobileScreen">
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
              v-if="leafDetails.isWorkspaceSetting"
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
            @change="updateCheckboxSetting($event.target.checked, leafDetails, leafName)"
            data-test="input"
          />

          <!-- button to configure webhook settings  -->
          <icon-button
            v-if="leafDetails.type == 'button'"
            :iconConfig="{
              enabled: true,
              iconName: 'settings',
              iconClass: 'text-primary group-hover:text-white fill-current h-4 w-4 bp-500:h-6 bp-500:w-6',
            }"
            :buttonClass="'bg-gray-100 hover:bg-primary bp-500:p-2 p-1 bp-500:px-4 px-2 rounded-md border-b-outset mt-2 max-h-12'"
            @click="openConfigureWebhookWindow"
            data-test="configureWebhookButton"
            id="buttonInSetting"
          ></icon-button>
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
        <!-- footer buttons - save + cancel -->
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

  <!-- configure webhook window -->
  <configure-webhook-window
    v-if="iscConfigureWebhookWindowVisible"
    :plioStatus="plioStatus"
    :customWebhookSettings="webhookSettings"
    @updated="updateChangedLeavesByWebhookSettings"
    @close-signal="closeConfigureWebhookWindow"
  ></configure-webhook-window>
</template>

<script>
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import SimpleBadge from "@/components/UI/Badges/SimpleBadge.vue";
import ConfigureWebhookWindow from "./ConfigureWebhookWindow.vue";
import { mapGetters } from "vuex";
import globalDefaultSettings from "@/services/Config/GlobalDefaultSettings.js";

let clonedeep = require("lodash.clonedeep");

export default {
  components: {
    IconButton,
    SimpleBadge,
    ConfigureWebhookWindow
  },
  data() {
    return {
      cancelButtonClass:
        "bp-500:px-7 bp-500:py-2 bp-360:px-16 px-10 py-2 transition ease-in duration-200 text-center text-base font-semibold shadow-lg rounded-lg bg-white border-b-outset",
      saveButtonClass:
        "bp-500:px-8 bp-500:py-2 bp-360:px-16 px-10 py-2 transition ease-in duration-200 text-center font-semibold shadow-lg rounded-lg bg-primary border-b-outset border-primary",
      saveButtonTitleConfig: {
        value: this.$t(`settings.buttons.save.${this.plioStatus}`),
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
      adminBadgeClass:
        "rounded-md border text-black text-xs px-2 border-gray-500 bg-gray-200",
      currentSelectedTabName: null,
      currentSelectedTabDetails: new Map(),
      changedLeaves: {}, // details about those leaf settings that have been changed by the user
      currentSelectedHeaderName: null, // name of the header of the current selected tab
      localSettings: null,
      iscConfigureWebhookWindowVisible: false,
    };
  },
  props: {
    settings: {
      // this contains all the settings and their metadata which needs to be rendered
      type: Object,
      default: null,
    },
    isInfoMessageVisible: {
      // if the info message is visible in the settings menu
      type: Boolean,
      default: false,
    },
    plioStatus: {
      type: String,
      default: "draft",
    },
  },
  watch: {
    settings: {
      handler() {
        // whenever the settings prop changes, set a default selected tab
        this.setDefaultSelectedTab();
      },
      deep: true,
    },
  },
  created() {
    this.createLocalSettings();
    if (this.localSettings != null) this.attachLeafWatchers();
    if (!this.isMobileScreen) {
      // set a default selected tab if the screen is not in mobile view
      this.setDefaultSelectedTab();
    }

    window.addEventListener("resize", this.handleScreenSizeChange);
  },
  unmounted() {
    window.removeEventListener("resize", this.handleScreenSizeChange);
  },
  computed: {
    ...mapGetters("generic", ["isMobileScreen"]),
    ...mapGetters("auth", ["isPersonalWorkspace"]),
    webhookSettings() {
      if (!this.localSettings.has("player")) {
        this.localSettings.set("player", clonedeep(globalDefaultSettings.player));
      } else {
        if (!this.localSettings.get("player").has("advanced")) {
          this.localSettings.get("player").set("advanced", clonedeep(globalDefaultSettings.player.advanced));
        } else {
          if (!this.localSettings.get("player").get("advanced").has("customWebhook")) {
            this.localSettings.get("player").get("advanced").set("customWebhook", clonedeep(globalDefaultSettings.player.advanced.customWebhook));
          }
        }
      }

      return this.localSettings.get("player").get("advanced").get("customWebhook");
    },
    hasUnsavedChanges() {
      return !GenericUtilities.isObjectEmpty(this.changedLeaves);
    },
    sidebarRegionClass() {
      return [
        {
          "w-35/100 space-y-10": !this.isMobileScreen,
          "w-full": this.isMobileScreen,
        },
        "h-full flex flex-col justify-start pt-4",
      ];
    },
    mainContainerClass() {
      return [
        {
          "left-0 right-0 top-0 bottom-0": this.isMobileScreen,
          "top-15/100 bottom-35/100 2xl:left-20/100 2xl:right-20/100 xl:left-15/100 xl:right-15/100 sm:left-10/100 sm:right-10/100 left-5/100 right-5/100": !this
            .isMobileScreen,
        },
        "border-2 border-gray-200 shadow-lg rounded-lg bg-white m-auto flex flex-col  fixed z-30 justify-center mx-auto",
      ];
    },
    saveButtonTooltip() {
      return this.hasUnsavedChanges
        ? this.$t("tooltip.settings.buttons.save.hasUnsavedChanges")
        : this.$t("tooltip.settings.buttons.save.noUnsavedChanges");
    },
  },
  methods: {
    openConfigureWebhookWindow() {
      this.iscConfigureWebhookWindowVisible = true;
    },
    closeConfigureWebhookWindow() {
      this.iscConfigureWebhookWindowVisible = false;
    },
    getImageSource: GenericUtilities.getImageSource,
    createLocalSettings() {
      this.localSettings = this.settings == null ? null : clonedeep(this.settings);
    },
    updateChangedLeavesByWebhookSettings(data) {
      const headerName = "player";
      const tabName = "advanced";
      const leafName = "customWebhook";
      let keyName = `${headerName}_${tabName}_${leafName}`;
      this.changedLeaves[keyName] = {
        headerName,
        tabName,
        leafName,
        newValue: data,
        isWorkspaceSetting: this.localSettings.get(headerName).get(tabName).get(leafName).isWorkspaceSetting,
      };
    },
    attachLeafWatchers() {
      for (let [headerName, headerDetails] of this.localSettings) {
        for (let [tabName, tabDetails] of headerDetails) {
          for (let [leafName, leafDetails] of tabDetails) {
            this.$watch(
              () =>
                clonedeep(
                  this.localSettings.get(headerName).get(tabName).get(leafName).value
                ),
              (newValue, oldValue) => {
                // return if the value hasn't changed
                if (newValue === oldValue) return;

                // a unique key name for each leaf setting.
                // used to check if a user has toggled a setting two times, nullifying the change
                let keyName = `${headerName}_${tabName}_${leafName}`;

                // if the changed value picked up by the watcher is the same as the original value,
                // delete the existing change if it exists in memory and return
                if (
                  newValue ===
                  this.settings.get(headerName).get(tabName).get(leafName).value
                ) {
                  if (keyName in this.changedLeaves) delete this.changedLeaves[keyName];
                  return;
                }

                // add the details of the changed setting in an object
                this.changedLeaves[keyName] = {
                  headerName,
                  tabName,
                  leafName,
                  newValue,
                  isWorkspaceSetting: leafDetails.isWorkspaceSetting,
                };
              },
              { deep: true }
            );
          }
        }
      }
    },
    isCheckboxSetting(settingType) {
      return settingType == "checkbox";
    },
    isTabSelected(tabName) {
      return this.currentSelectedTabName == tabName;
    },
    /**
     * Get the style classes for a particular toggable tab
     */
    getTabToggleClass(tabName) {
      return [
        {
          "transform rotate-90": this.isTabSelected(tabName),
        },
        "w-4 h-4 text-yellow-600 fill-current my-auto transition duration-800 mr-2",
      ];
    },
    /**
     * Get style classes for how a tab looks on the sidebar region
     * @param {String} tabName - The name of the tab for which the style classes are required
     */
    getTabStyleClasses(tabName) {
      return [
        {
          "text-primary bg-gray-100 border-r-outset border-yellow-500 pl-6 hover:bg-gray-100":
            this.isTabSelected(tabName) && !this.isMobileScreen,
          "text-gray-500 ": !this.isTabSelected(tabName) && this.isMobileScreen,
          "text-primary": this.isTabSelected(tabName) && this.isMobileScreen,
          "leading-snug": this.isMobileScreen,
          "leading-relaxed pl-6": !this.isMobileScreen,
        },
        "font-medium w-full capitalize whitespace-nowrap lg:text-base md:text-sm bp-500:text-xs text-xl text-left py-1",
      ];
    },
    /**
     * Set the tab which will be selected by default when the menu opens up
     */
    setDefaultSelectedTab() {
      if (this.localSettings != null) {
        let firstHeaderName = [...this.localSettings.keys()][0];
        let firstTab = this.localSettings.get(firstHeaderName);
        let firstTabName = [...firstTab.keys()][0];
        let firstTabDetails = firstTab.get(firstTabName);
        this.selectTab(firstTabName, firstTabDetails, firstHeaderName);
      }
    },
    /**
     * Mark a tab as selected/unselected
     * @param {String} tabName - the name of the tab that is to be marked selected
     * @param {Object} tabDetails - the details of the tab that is to be marked selected
     * @param {String} headerName - name of the header to which the selected tab belongs to
     */
    selectTab(tabName, tabDetails, headerName) {
      if (this.isMobileScreen && this.isTabSelected(tabName)) {
        // in mobile view, the tabs are toggable
        // if someone clicks on an already opened tab, close it
        // and currentSelectedTabName and currentSelectedTabDetails will be reset to empty
        this.currentSelectedTabName = null;
        this.currentSelectedTabDetails = null;
        this.currentSelectedHeaderName = null;
      } else {
        // update currentSelectedTabName and currentSelectedTabDetails
        this.currentSelectedTabName = tabName;
        this.currentSelectedTabDetails = tabDetails;
        this.currentSelectedHeaderName = headerName;
      }
    },
    /**
     * Emit the changed settings and close the menu
     */
    saveChanges() {
      this.$emit("update:settings", this.localSettings);
      this.$emit("updated", this.changedLeaves);
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
     * @param {Object} leafDetails - The leaf details to which this checkbox belongs to
     * @param {String} leafName - The leaf name to which this checkbox belongs to
     */
    updateCheckboxSetting(isChecked, leafDetails, leafName) {
      this.localSettings
        .get(this.currentSelectedHeaderName)
        .get(this.currentSelectedTabName)
        .get(leafName).value = isChecked;
    },
  },
  emits: ["window-closed", "update:settings", "updated", "publish"],
};
</script>
