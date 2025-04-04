<template>
  <div class="flex relative">
    <div
      class="w-full"
      :class="{ 'opacity-20 pointer-events-none': isBackgroundDisabled }"
      @keydown="keyboardPressed"
    >
      <div
        class="grid grid-cols-3 border-b-2 py-2 px-2 border-solid bg-white"
        :class="navBarClass"
      >
        <!-- menu icon -->
        <icon-button
          v-if="isAuthenticated && isMenuButtonShown && !isPageLoading"
          :iconConfig="menuButtonIconConfig"
          :buttonClass="menuButtonClass"
          @click="toggleMenuButton"
          :isDisabled="pending"
        ></icon-button>

        <!-- create plio button - visible only in mobile screens -->
        <CreatePlioButton
        :onMobile="onHomePage"
        :titleConfig="createButtonMenuTextConfig"
        :buttonClass="createButtonClass"
         :isDisabled="pending"
        :handleClick="createNewPlio"
/>

        <div
          class="grid justify-items-end z-10"
          :class="{
            'col-span-3': !isAuthenticated || isPageLoading,
            'col-span-2': !isMobileScreen || !onHomePage,
            'col-span-1': isMobileScreen,
            'bp-500:col-span-3': onHomePage,
          }"
        >
          <!-- locale switcher -->
          <LocaleSwitcher id="locale" class="flex justify-center"></LocaleSwitcher>
        </div>
      </div>
      <!-- main container -->
      <div :class="gridContainerClass">
        <transition :name="menuSlideTransition">
          <!-- menu -->
          <div :class="menuContainerClass" v-if="isMenuShown">
            <!-- workspace switcher -->
            <div class="place-self-center w-full" v-if="showWorkspaceSwitcher">
              <WorkspaceSwitcher
                class="flex justify-center"
                :isDisabled="pending"
              ></WorkspaceSwitcher>
            </div>

            <!-- create plio button - not visible in mobile screens -->
            <CreatePlioButton
  :onMobile="onHomePage"
  :titleConfig="createButtonMenuTextConfig"
  :buttonClass="createButtonClass"
  :isDisabled="pending"
  :handleClick="createNewPlio"
/>

            <!-- home button -->
            <icon-button
              class="place-self-start w-full"
              :iconConfig="homeButtonIconConfig"
              :titleConfig="homeButtonTextConfig"
              :buttonClass="menuButtonsClass"
              :innerContainerClass="menuButtonsInnerContainerClass"
              @click="redirectToHome"
              :isDisabled="pending"
            ></icon-button>

            <!-- settings button -->
            <icon-button
              v-if="onHomePage && hasAnySettingsToRender"
              class="place-self-start w-full"
              :iconConfig="settingsButtonIconConfig"
              :titleConfig="settingsButtonTextConfig"
              :buttonClass="menuButtonsClass"
              :innerContainerClass="menuButtonsInnerContainerClass"
              @click="showSettingsMenu"
              :isDisabled="pending"
              data-test="settingsButton"
            ></icon-button>

            <!-- plio for teams -->
            <icon-button
              class="place-self-start w-full"
              :iconConfig="teamsButtonIconConfig"
              :titleConfig="teamsButtonTextConfig"
              :buttonClass="menuButtonsClass"
              :innerContainerClass="menuButtonsInnerContainerClass"
              :isDisabled="pending"
              @click="redirectToTeamsPage"
              v-if="isPersonalWorkspace"
              data-test="teams"
            ></icon-button>

            <!-- product guides -->
            <icon-button
              class="place-self-start w-full"
              :iconConfig="productGuidesButtonIconConfig"
              :titleConfig="productGuidesButtonTextConfig"
              :buttonClass="menuButtonsClass"
              :innerContainerClass="menuButtonsInnerContainerClass"
              @click="redirectToProductGuides"
              :isDisabled="pending"
              data-test="productGuides"
            ></icon-button>

            <!-- docs -->
            <icon-button
              class="place-self-start w-full"
              :iconConfig="docsButtonIconConfig"
              :titleConfig="docsButtonTextConfig"
              :buttonClass="menuButtonsClass"
              :innerContainerClass="menuButtonsInnerContainerClass"
              @click="redirectToDocs"
              :isDisabled="pending"
              data-test="docs"
            ></icon-button>

            <!-- whats new -->
            <icon-button
              class="place-self-start w-full"
              :iconConfig="whatsNewButtonIconConfig"
              :titleConfig="whatsNewButtonTextConfig"
              :buttonClass="menuButtonsClass"
              :innerContainerClass="menuButtonsInnerContainerClass"
              @click="redirectToWhatsNew"
              :isDisabled="pending"
              data-test="whatsNew"
            ></icon-button>

            <!-- logout -->
            <icon-button
              class="place-self-start w-full"
              :iconConfig="logoutButtonIconConfig"
              :titleConfig="logoutButtonTextConfig"
              :buttonClass="menuButtonsClass"
              :innerContainerClass="menuButtonsInnerContainerClass"
              @click="logoutButtonClicked"
              :isDisabled="pending"
              data-test="logout"
            ></icon-button>
          </div>
        </transition>
        <router-view :class="routerViewClass" :key="$route.fullPath" />
      </div>
    </div>
    <!-- generic dialog box -->
    <div class="w-full fixed top-1/3">
      <dialog-box
        v-if="isDialogBoxShown"
        :class="dialogBoxClass"
        :title="dialogTitle"
        :description="dialogDescription"
        :confirmButtonConfig="dialogConfirmButtonConfig"
        :cancelButtonConfig="dialogCancelButtonConfig"
        :isCloseButtonShown="isDialogCloseButtonShown"
        @confirm="dialogConfirmed"
        @cancel="dialogCancelled"
        @close="resetDialogBox"
        v-click-away="resetDialogBox"
        data-test="dialogBox"
      ></dialog-box>
    </div>
    <!-- first-time language picker -->
    <div
      class="fixed w-full top-1/4 my-5 flex justify-center"
      v-if="(

        (
          checkIfIsSSOUser && 
          isFirstTimeLanguagePickerShownBySetting !== null &&
          isFirstTimeLanguagePickerShownBySetting == true
        ) ||
        (!checkIfIsSSOUser && showLanguagePickerDialog)
      )"
    >
      <div
        class="bg-white w-11/12 sm:w-9/12 lg:w-7/12 p-4 sm:p-10 rounded-lg border border-black"
      >
        <p class="text-center text-2xl sm:text-4xl py-4 sm:py-8">Select your language</p>
        <div class="grid grid-cols-2 space-x-2">
          <div
            class="hover:bg-primary p-4 sm:p-8 rounded-lg border-4 group cursor-pointer"
            @click="setLocale('en')"
            data-test="languagePicker-en"
          >
            <p class="text-xl sm:text-3xl text-black text-center group-hover:text-white">
              English
            </p>
          </div>
          <div
            class="hover:bg-primary p-4 sm:p-8 rounded-lg border-4 group cursor-pointer"
            @click="setLocale('hi')"
            data-test="languagePicker-hi"
          >
            <p class="text-xl sm:text-3xl text-black text-center group-hover:text-white">
              हिंदी
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- dialog for sharing plio -->
    <div class="fixed top-1/3 w-full flex justify-center">
      <SharePlioDialog
        v-if="isSharePlioDialogShown"
        v-click-away="unsetSharePlioDialog"
        :plioLink="plioLinkToShare"
      ></SharePlioDialog>
    </div>
    <!-- dialog for embedding plio -->
    <div class="fixed w-full flex justify-center">
      <EmbedPlioDialog
        v-if="isEmbedPlioDialogShown"
        :plioId="selectedPlioId"
      ></EmbedPlioDialog>
    </div>
    <!-- list of options that can be selected -->
    <div class="fixed top-1/6 w-full flex justify-center">
      <ListSingleSelector
        v-if="isSingleSelectorShown"
        v-click-away="hideSelector"
        :options="selectorOptions"
        :title="selectorTitle"
        :info="selectorInfo"
        @close="hideSelector"
        @select="selectOption"
        ref="listSingleSelector"
      ></ListSingleSelector>
    </div>
    <!-- spinner -->
    <inline-svg
      v-if="isSpinnerShown"
      :src="getImageSource('spinner.svg')"
      class="fixed animate-spin h-10 top-1/2 w-full"
    ></inline-svg>
  </div>
  <vue-progress-bar></vue-progress-bar>
  <!-- settings menu -->
  <Settings
    v-if="isSettingsMenuShown"
    class="fixed z-20 justify-top mx-auto"
    v-model:settings="settingsToRender"
    :isInfoMessageVisible="true"
    v-click-away="closeSettingsMenu"
    @updated="updateSettings"
    @window-closed="closeSettingsMenu"
  ></Settings>
</template>

<script>
import WorkspaceSwitcher from "@/components/App/WorkspaceSwitcher.vue";
import LocaleSwitcher from "@/components/App/LocaleSwitcher.vue";
import UserConfigService from "@/services/Config/User.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SharePlioDialog from "@/components/App/SharePlioDialog.vue";
import EmbedPlioDialog from "@/components/App/EmbedPlioDialog.vue";
import ListSingleSelector from "@/components/UI/Selectors/ListSingleSelector.vue";
import PlioAPIService from "@/services/API/Plio.js";
import Settings from "@/components/App/Settings.vue";
import DialogBox from "@/components/UI/Alert/DialogBox";
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import SettingsUtilities from "@/services/Functional/Utilities/Settings.js";
import UserAPIService from "@/services/API/User.js";
import OrganizationAPIService from "@/services/API/Organization.js";
import { mapActions, mapState, mapGetters } from "vuex";
import { useToast } from "vue-toastification";
import globalDefaultSettings from "@/services/Config/GlobalDefaultSettings.js";
import CreatePlioButton from '@/components/CreatePlioButton.vue';

let clonedeep = require("lodash.clonedeep");

export default {
  components: {
    CreatePlioButton, 
    LocaleSwitcher,
    SharePlioDialog,
    EmbedPlioDialog,
    WorkspaceSwitcher,
    IconButton,
    DialogBox,
    Settings,
    ListSingleSelector,
  },
  data() {
    return {
      showLanguagePickerDialog: false, 
      toast: useToast(),
      userClickedLogout: false, 

      createButtonClass:
        "bg-primary hover:bg-primary-hover rounded-md shadow-lg w-full ring-primary p-2 sm:py-4",
      isMenuButtonActive: false, 
      menuButtonsClass: "rounded-lg ring-primary p-2 py-4 hover:bg-gray-200", 
      menuButtonsInnerContainerClass: "w-full flex justify-start", 
      menuButtonsIconClass:
        "text-gray-500 group-hover:text-primary fill-current h-4 md:h-6 w-4 md:w-6", 
      menuButtonsTextClass:
        "text-xl bp-500:text-sm md:text-base lg:text-lg ml-4 text-gray-500 group-hover:text-primary", 
      menuSlideTransition: "", 
      isSettingsMenuShown: false,
      settingsToRender: {}, 
      settingsWatchers: [], 
    };
  },
  async created() {

    this.setReAuthenticationState("not-started");

    this.resetAppState();


    window.addEventListener("beforeunload", this.onClose);
    if (this.isAuthenticated) {
      await this.fetchAndUpdateUser();
      this.constructSettingsMenu();
    }

    if (this.locale == null && this.user != null) {
      this.showLanguagePickerDialog = true;
    }


    window.Offline.on("down", this.showInternetLostToast);
    window.Offline.on("up", this.showInternetRestoredToast);


    if (!this.onHomePage) this.menuSlideTransition = "slide-fade";

    this.setWindowProperties();
    window.addEventListener("resize", this.setWindowProperties);


    if (!this.isMenuButtonActive && !this.isMobileScreen && this.onHomePage)
      this.isMenuButtonActive = true;
  },
  beforeUnmount() {

    window.removeEventListener("beforeunload", this.onClose);
    window.removeEventListener("resize", this.setWindowProperties);


    window.Offline.off("down", this.showInternetLostToast);
    window.Offline.off("up", this.showInternetRestoredToast);
  },
  mounted() {

    if (location.hash) {
      location.replace(location.hash.replace("#", ""));
    }


    UserConfigService.setLocaleFromUserConfig();
  },
  watch: {
    userSettings() {
      this.constructSettingsMenu();
    },
    activeWorkspaceSettings() {
      this.constructSettingsMenu();
    },
    activeWorkspace() {

      if (this.isMobileScreen) this.resetMenuState();
      this.constructSettingsMenu();
    },
    currentRoute() {

      this.resetState();
    },
    isAuthenticated(value) {

      if (!value && !this.userClickedLogout) {

        this.logoutUser();
      }

      if (value) {

        this.userClickedLogout = false;
        if (this.locale == null) this.showLanguagePickerDialog = true;
        this.constructSettingsMenu();
      }
    },
    onHomePage(value) {

      if (value) {
        this.menuSlideTransition = "";
        let isUserInWorkspace = this.user.organizations.some((organization) => {

          return (
            organization.shortcode == this.activeWorkspace || this.activeWorkspace == ""
          );
        });

        if (!isUserInWorkspace) {

          this.$router.replace({
            name: "Home",
            query: this.$route.query,
          });

          this.unsetActiveWorkspace();
        }


        if (!this.isMobileScreen) this.isMenuButtonActive = true;
      } else {

        this.resetMenuState();
        this.menuSlideTransition = "slide-fade";
      }
    },
    user: {
      handler() {

        if (this.user == null) return;
        if (this.$mixpanel.get_distinct_id() != this.user.id.toString()) {
          this.$mixpanel.alias(this.user.id.toString());
          this.$mixpanel.people.set({
            $first_name: this.user.first_name,
            $last_name: this.user.last_name,
            $email: this.user.email,
            $phone: this.user.mobile,
            "User DB ID": this.user.id,
          });
          this.$mixpanel.identify(this.user.id);
        }
        this.$mixpanel.people.set({
          "All Workspaces": this.allWorkspaces,
          "Current Workspace": this.activeWorkspace,
          "User Status": this.user.status,
          "Current Locale": this.user.config.locale,
          "Last Logged In": new Date().toISOString(),
        });
        this.$mixpanel.register({
          "User Status": this.user.status,
          "Current Workspace": this.activeWorkspace,
        });

        this.constructSettingsMenu();
      },
      deep: true,
    },
  },
  methods: {
    getImageSource: GenericUtilities.getImageSource,

    ...mapActions("auth", [
      "unsetAccessToken",
      "fetchAndUpdateUser",
      "setActiveWorkspace",
      "unsetActiveWorkspace",
      "setReAuthenticationState",
    ]),
    ...mapActions("auth", {

      updateUserStoreSettings: "setUserSettings",

      setWorkspaceStoreSettings: "setWorkspaceSettings",
    }),
    ...mapActions("generic", [
      "unsetSharePlioDialog",
      "unsetEmbedPlioDialog",
      "hideSpinner",
      "setWindowInnerWidth",
      "setWindowInnerHeight",
      "showSpinner",
      "hideSpinner",
      "unsetFirstTimeLanguagePickerShownBySetting",
    ]),
    ...mapActions("sync", ["stopLoading"]),
    ...mapActions("dialog", [
      "hideDialogBox",
      "unsetDialogTitle",
      "unsetDialogDescription",
      "unsetDialogBoxClass",
      "unsetConfirmButtonConfig",
      "unsetCancelButtonConfig",
      "setConfirmClicked",
      "setCancelClicked",
      "unsetConfirmClicked",
      "unsetCancelClicked",
      "unsetDialogCloseButton",
    ]),
    ...mapActions("selectors", ["hideSelector"]),

    updateSettings(updatedSettings) {

      let newWorkspaceSettings = null;
      let newUserSettings = null;
      Object.keys(updatedSettings).forEach((key) => {
        let setting = updatedSettings[key];

        if (setting.isWorkspaceSetting) {
          if (newWorkspaceSettings == null)
            newWorkspaceSettings = clonedeep(this.activeWorkspaceSettings);
          if (newWorkspaceSettings.has(setting.headerName) == false) {
            newWorkspaceSettings.set(
              setting.headerName,
              clonedeep(globalDefaultSettings.get(setting.headerName))
            );
          }
          const header = newWorkspaceSettings.get(setting.headerName);
          if (header.children.has(setting.tabName) == false) {
            header.children.set(
              setting.tabName,
              clonedeep(
                globalDefaultSettings
                  .get(setting.headerName)
                  .children.get(setting.tabName)
              )
            );
          }
          const tab = header.children.get(setting.tabName);
          if (tab.children.has(setting.leafName) == false) {
            tab.children.set(
              setting.leafName,
              clonedeep(
                globalDefaultSettings
                  .get(setting.headerName)
                  .children.get(setting.tabName)
                  .children.get(setting.leafName)
              )
            );
          }
          tab.children.get(setting.leafName).value = setting.newValue;
        } else {
          if (newUserSettings == null) newUserSettings = clonedeep(this.userSettings);


          if (newUserSettings.has(setting.headerName) == false) {
            newUserSettings.set(
              setting.headerName,
              clonedeep(globalDefaultSettings.get(setting.headerName))
            );
          }
          const header = newUserSettings.get(setting.headerName);
          if (header.children.has(setting.tabName) == false) {
            header.children.set(
              setting.tabName,
              clonedeep(
                globalDefaultSettings
                  .get(setting.headerName)
                  .children.get(setting.tabName)
              )
            );
          }
          const tab = header.children.get(setting.tabName);
          if (tab.children.has(setting.leafName) == false) {
            tab.children.set(
              setting.leafName,
              clonedeep(
                globalDefaultSettings
                  .get(setting.headerName)
                  .children.get(setting.tabName)
                  .children.get(setting.leafName)
              )
            );
          }
          tab.children.get(setting.leafName).value = setting.newValue;
        }
      });

      if (newWorkspaceSettings != null) {
        this.setWorkspaceStoreSettings({ settings: newWorkspaceSettings });
        OrganizationAPIService.updateWorkspaceSettings(
          this.activeWorkspaceId,
          newWorkspaceSettings
        );
      }

      if (newUserSettings != null) {
        this.updateUserStoreSettings(newUserSettings);
        UserAPIService.updateUserSettings(this.userId, newUserSettings);
      }
    },

    constructSettingsMenu() {

      if (!(this.userSettings instanceof Map)) return;
      if (!this.isPersonalWorkspace && !(this.activeWorkspaceSettings instanceof Map))
        return;


      this.settingsWatchers.forEach((unwatch) => unwatch());

      if (this.isPersonalWorkspace) this.settingsToRender = clonedeep(this.userSettings);
      else
        this.settingsToRender = SettingsUtilities.mergeSettings(
          clonedeep(this.userSettings),
          clonedeep(this.activeWorkspaceSettings)
        );


      SettingsUtilities.prepareSettingsToRender(this.settingsToRender, true, "App.vue");
    },
    closeSettingsMenu() {
      if (this.isMobileScreen) this.resetMenuState();
      this.isSettingsMenuShown = false;
    },
    showSettingsMenu() {
      this.isSettingsMenuShown = true;
    },

    resetAppState() {
      if (this.pending) this.stopLoading();
      if (this.isSpinnerShown) this.hideSpinner();
      if (this.isDialogBoxShown) this.resetDialogBox();
      if (this.isSingleSelectorShown) this.hideSelector();
    },

    dialogConfirmed() {
      this.resetDialogBox();
      this.setConfirmClicked();
    },

    dialogCancelled() {
      this.resetDialogBox();
      this.setCancelClicked();
    },

    resetDialogBox() {
      this.hideDialogBox();
      this.unsetDialogTitle();
      this.unsetDialogDescription();
      this.unsetConfirmButtonConfig();
      this.unsetCancelButtonConfig();
      this.unsetConfirmClicked();
      this.unsetCancelClicked();
      this.unsetDialogBoxClass();
      this.unsetDialogCloseButton();
    },

    resetMenuState() {
      this.isMenuButtonActive = false;
    },

    setWindowProperties() {
      this.setWindowInnerWidth(window.innerWidth);
      this.setWindowInnerHeight(window.innerHeight);
    },

    showInternetLostToast() {

      this.toast.dismiss("internetRestoredToast");

      this.toast.error(this.$t("toast.error.internet_lost"), {
        id: "internetLostToast",
        position: "bottom-center",
        timeout: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      });
    },

    showInternetRestoredToast() {

      this.toast.dismiss("internetLostToast");

      this.toast.success(this.$t("toast.success.internet_restored"), {
        id: "internetRestoredToast",
        position: "bottom-center",
      });
    },

    logoutButtonClicked() {

      this.userClickedLogout = true;
      this.logoutUser();
    },

    redirectToHome() {
      if (this.isMobileScreen) this.resetMenuState();
      this.$router.push({ name: "Home", params: { workspace: this.activeWorkspace } });
    },

    redirectToWhatsNew() {
      window.open(
        "https://avantifellows.notion.site/What-s-New-1dc885b3ccc74e0aaa9c6789ab319abf/",
        "_blank",
        "noopener"
      );
    },

    redirectToDocs() {
      window.open("https://docs.plio.in/", "_blank", "noopener");
    },

    redirectToTeamsPage() {
      window.open("https://docs.plio.in/plio-for-teams/", "_blank", "noopener");
    },

    redirectToProductGuides() {
      window.open(
        "https://www.youtube.com/playlist?list=PL3U0Jqw-piJgw2hSpuAZym4K1_Tb0RTRV",
        "_blank",
        "noopener"
      );
    },

    toggleMenuButton() {
      this.isMenuButtonActive = !this.isMenuButtonActive;
    },

    async createNewPlio() {
      this.$Progress.start();
      this.$mixpanel.track("Click Create");
      this.$mixpanel.people.set_once({
        "First Plio Created": new Date().toISOString(),
      });
      this.$mixpanel.people.set({
        "Last Plio Created": new Date().toISOString(),
      });
      this.$mixpanel.people.increment("Total Plios Created");

      let isUserInWorkspace = this.user.organizations.some((organization) => {

        return (
          organization.shortcode == this.activeWorkspace || this.activeWorkspace == ""
        );
      });
      if (!isUserInWorkspace) this.unsetActiveWorkspace();
      let createPlioResponse = await PlioAPIService.createPlio();
      this.$Progress.finish();
      if (createPlioResponse.status == 201) {

        let plioUuid = createPlioResponse.data.uuid;
        let newPlioSettings = this.isPersonalWorkspace
          ? this.userSettings.get("player")
          : this.activeWorkspaceSettings.get("player");
        let updatePlioSettingsResponse = await PlioAPIService.updatePlioSettings(
          plioUuid,
          new Map(
            Object.entries({
              player: newPlioSettings,
            })
          )
        );
        if (updatePlioSettingsResponse.status == 200) {
          this.$router.push({
            name: "Editor",
            params: { plioId: plioUuid, workspace: this.activeWorkspace },
          });
        }
      } else this.toast.error(this.$t("toast.error.create_plio"));
    },

    logoutUser() {
      this.unsetAccessToken().then(() => {
        this.$router.replace({
          name: "Login",
          params: { userClickedLogout: this.userClickedLogout },
        });

        this.$mixpanel.reset();
        this.$mixpanel.track("Logout");

        this.stopLoading();

        this.unsetActiveWorkspace();
      });
    },
    onClose(event) {

      if (this.onEditorPage || this.onPlayerPage) {
        event.preventDefault();
        event.returnValue = "";
      }

      this.resetState();
    },

    resetState() {
      if (this.isSharePlioDialogShown) this.unsetSharePlioDialog();
      if (this.isEmbedPlioDialogShown) this.unsetEmbedPlioDialog();
    },

    setLocale(locale) {
      this.$mixpanel.register({
        "Current Locale": locale,
      });

      this.$i18n.locale = locale;
      UserConfigService.updateLocale();
      this.showLanguagePickerDialog = false;
      this.unsetFirstTimeLanguagePickerShownBySetting();
    },

    keyboardPressed() {

      if (this.isBackgroundDisabled) event.preventDefault();
    },

    selectOption(selectedOptionValue) {
      this.hideSelector();
      this.showSpinner();
      PlioAPIService.copyToWorkspace(this.selectedPlioId, {
        workspace: selectedOptionValue,
      })
        .then(() => {
          this.hideSpinner();

          const routeData = this.$router.resolve({
            name: "Home",
            params: { workspace: selectedOptionValue },
          });
          window.open(routeData.href, "_blank");
        })
        .catch(() => {
          this.hideSpinner();
          this.toast.error(this.$t("toast.error.generic"));
        });
    },
  },
  computed: {
    ...mapGetters("auth", [
      "isAuthenticated",
      "activeWorkspaceSchema",
      "locale",
      "isPersonalWorkspace",
      "activeWorkspaceSettings",
      "userRoleInActiveWorkspace",
      "activeWorkspaceId",
    ]),
    ...mapGetters("generic", [
      "isMobileScreen",
      "isFirstTimeLanguagePickerShownBySetting",
    ]),
    ...mapState("auth", ["config", "user", "activeWorkspace", "userId", "userSettings"]),
    ...mapState("generic", [
      "isSharePlioDialogShown",
      "isEmbedPlioDialogShown",
      "plioLinkToShare",
      "selectedPlioId",
      "isSpinnerShown",
    ]),
    ...mapState("sync", ["pending"]),
    ...mapState("dialog", {
      dialogTitle: "title",
      dialogDescription: "description",
      isDialogBoxShown: "isShown",
      isDialogCloseButtonShown: "isCloseButtonShown",
      dialogConfirmButtonConfig: "confirmButtonConfig",
      dialogCancelButtonConfig: "cancelButtonConfig",
      dialogBoxClass: "boxClass",
      dialogAction: "action",
    }),
    ...mapState("selectors", {
      selectorOptions: "options",
      selectorTitle: "title",
      selectorInfo: "info",
    }),
    ...mapGetters("selectors", ["isSingleSelectorShown"]),
    hasAnySettingsToRender() {
      return this.settingsToRender.size > 0;
    },

    isRouterViewShown() {
      return !(this.isMenuShownInline && this.isMobileScreen);
    },

    isMenuButtonShown() {
      return !this.onHomePage || this.isMobileScreen;
    },

    routerViewClass() {
      return [
        {
          "col-span-2 lg:col-span-3 xl:col-span-4": this.isMenuShownInline,
          "col-span-full": !this.isMenuShown,
          "opacity-50 pointer-events-none w-full": this.isMenuShownOverlay,
          hidden: !this.isRouterViewShown,
        },
      ];
    },

    menuContainerClass() {
      return [
        {
          "absolute z-10 bg-white w-full bp-500:w-1/3 lg:w-1/4":
            this.isMenuShownOverlay || (!this.isMenuShown && !this.onHomePage),
        },
        `p-2 sm:p-4 border-r-2 flex flex-col col-span-3 bp-500:col-span-1 h-screen`,
      ];
    },

    gridContainerClass() {
      return {
        "grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 h-screen":
          this.isMenuShownInline || !this.isMenuShownOverlay,
        flex: this.isMenuShownOverlay,
      };
    },

    logoutButtonIconConfig() {
      return {
        enabled: true,
        iconName: "logout",
        iconClass: this.menuButtonsIconClass,
      };
    },

    docsButtonIconConfig() {
      return {
        enabled: true,
        iconName: "docs",
        iconClass: this.menuButtonsIconClass,
      };
    },

    teamsButtonIconConfig() {
      return {
        enabled: true,
        iconName: "teams",
        iconClass: this.menuButtonsIconClass,
      };
    },

    productGuidesButtonIconConfig() {
      return {
        enabled: true,
        iconName: "exclamation-circle-solid",
        iconClass: this.menuButtonsIconClass,
      };
    },

    homeButtonIconConfig() {
      return {
        enabled: true,
        iconName: "home-rounded",
        iconClass: this.menuButtonsIconClass,
      };
    },

    whatsNewButtonIconConfig() {
      return {
        enabled: true,
        iconName: "gift",
        iconClass: this.menuButtonsIconClass,
      };
    },

    menuButtonClass() {
      return [
        {
          "bg-gray-300": !this.isMenuButtonActive,
          "bg-primary": this.isMenuButtonActive,
        },
        `rounded-md border shadow-lg ring-primary h-12 w-12 p-2 self-center`,
      ];
    },

    menuButtonIconConfig() {

      return {
        enabled: true,
        iconName: "menu",
        iconClass: this.menuIconClass,
      };
    },

    menuIconClass() {
      return [
        {
          "text-white": this.isMenuButtonActive,
          "text-black": !this.isMenuButtonActive,
        },
        `fill-current h-8 w-8`,
      ];
    },
    settingsButtonIconConfig() {
      return {
        enabled: true,
        iconName: "settings",
        iconClass: this.menuButtonsIconClass,
      };
    },

    isMenuShown() {
      return this.isMenuShownInline || this.isMenuShownOverlay;
    },

    isMenuShownInline() {
      return this.isAuthenticated && this.isMenuButtonActive && this.onHomePage;
    },

    isMenuShownOverlay() {
      return this.isAuthenticated && this.isMenuButtonActive && !this.onHomePage;
    },

    createButtonMenuTextConfig() {
      return {
        value: this.$t("home.create_button"),
        class: "text-xl bp-500:text-lg md:text-xl lg:text-2xl text-white",
      };
    },

    logoutButtonTextConfig() {
      return {
        value: this.$t("nav.logout"),
        class: this.menuButtonsTextClass,
      };
    },

    whatsNewButtonTextConfig() {
      return {
        value: this.$t("nav.whats_new"),
        class: this.menuButtonsTextClass,
      };
    },

    productGuidesButtonTextConfig() {
      return {
        value: this.$t("nav.product_guides"),
        class: this.menuButtonsTextClass,
      };
    },

    homeButtonTextConfig() {
      return {
        value: this.$t("nav.home"),
        class: this.menuButtonsTextClass,
      };
    },
    settingsButtonTextConfig() {
      return {
        value: this.$t("nav.settings"),
        class: this.menuButtonsTextClass,
      };
    },

    docsButtonTextConfig() {
      return {
        value: this.$t("nav.docs"),
        class: this.menuButtonsTextClass,
      };
    },

    teamsButtonTextConfig() {
      return {
        value: this.$t("nav.teams"),
        class: this.menuButtonsTextClass,
      };
    },

    showWorkspaceSwitcher() {
      return this.user.organizations != null && this.user.organizations.length > 0;
    },

    navBarClass() {
      return {
        hidden: this.isNavBarHidden,
      };
    },

    isNavBarHidden() {
      return this.onPlioPage || this.onPlayerPage;
    },

    currentRoute() {
      return this.$route.path;
    },

    onHomePage() {
      return this.$route.name == "Home";
    },

    isPageLoading() {
      return this.$route.name == undefined;
    },

    onPlioPage() {
      return this.$route.name == "Plio";
    },

    onEditorPage() {
      return this.$route.name == "Editor";
    },

    onPlayerPage() {
      return this.$route.name == "Player";
    },

    onLoginPage() {
      return this.$route.name == "Login";
    },
    checkIfIsSSOUser() {
      const output = "api_key" in this.$route.query && "unique_id" in this.$route.query;
      return output;
    },

    isBackgroundDisabled() {
      const output =
        (this.checkIfIsSSOUser &&
          this.isFirstTimeLanguagePickerShownBySetting !== null &&
          this.isFirstTimeLanguagePickerShownBySetting == true) ||
        (!this.checkIfIsSSOUser && this.showLanguagePickerDialog) ||
        this.isSharePlioDialogShown ||
        this.isEmbedPlioDialogShown ||
        this.isDialogBoxShown ||
        this.isSpinnerShown ||
        this.isSettingsMenuShown ||
        this.isSingleSelectorShown;
      return output;
    },

    allWorkspaces() {
      if (this.user == null) return [];
      var shortcodes = [];

      this.user.organizations.forEach((workspace) => {
        shortcodes.push(workspace.shortcode);
      });

      return shortcodes;
    },
  },
};
</script>
<style>
#app {
  font-family: "KrutiDev", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
@font-face {
  font-family: "Kruti Dev";
  src: local("Kruti Dev"), url("./assets/fonts/Kruti_Dev_10.TTF") format("truetype");
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-100%);
}
</style>
