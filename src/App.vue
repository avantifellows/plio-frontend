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
        <icon-button
          v-if="onHomePage"
          :titleConfig="createButtonMenuTextConfig"
          :buttonClass="createButtonClass"
          class="bp-500:hidden"
          @click="createNewPlio"
          :isDisabled="pending"
        ></icon-button>

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
          <LocaleSwitcher
            id="locale"
            class="flex justify-center"
          ></LocaleSwitcher>
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
            <icon-button
              :titleConfig="createButtonMenuTextConfig"
              :buttonClass="createButtonClass"
              class="my-4 border-b-outset border-primary"
              :class="{ 'hidden bp-500:inline': onHomePage }"
              @click="createNewPlio"
              :isDisabled="pending"
            ></icon-button>

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
      v-if="
        (checkIfIsSSOUser &&
          isFirstTimeLanguagePickerShownBySetting !== null &&
          isFirstTimeLanguagePickerShownBySetting == true) ||
        (!checkIfIsSSOUser && showLanguagePickerDialog)
      "
    >
      <div
        class="bg-white w-11/12 sm:w-9/12 lg:w-7/12 p-4 sm:p-10 rounded-lg border border-black"
      >
        <p class="text-center text-2xl sm:text-4xl py-4 sm:py-8">
          Select your language
        </p>
        <div class="grid grid-cols-2 space-x-2">
          <div
            class="hover:bg-primary p-4 sm:p-8 rounded-lg border-4 group cursor-pointer"
            @click="setLocale('en')"
            data-test="languagePicker-en"
          >
            <p
              class="text-xl sm:text-3xl text-black text-center group-hover:text-white"
            >
              English
            </p>
          </div>
          <div
            class="hover:bg-primary p-4 sm:p-8 rounded-lg border-4 group cursor-pointer"
            @click="setLocale('hi')"
            data-test="languagePicker-hi"
          >
            <p
              class="text-xl sm:text-3xl text-black text-center group-hover:text-white"
            >
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
import PlioFunctionalService from "@/services/Functional/Plio.js";
import Settings from "@/components/App/Settings.vue";
import DialogBox from "@/components/UI/Alert/DialogBox";
import GenericUtilities from "@/services/Functional/Utilities/Generic.js";
import SettingsUtilities from "@/services/Functional/Utilities/Settings.js";
import UserAPIService from "@/services/API/User.js";
import OrganizationAPIService from "@/services/API/Organization.js";
import { mapActions, mapState, mapGetters } from "vuex";
import { useToast } from "vue-toastification";
import globalDefaultSettings from "@/services/Config/GlobalDefaultSettings.js";

let clonedeep = require("lodash.clonedeep");

export default {
  components: {
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
      showLanguagePickerDialog: false, // whether to show a language picker dialog box
      toast: useToast(),
      userClickedLogout: false, // if the user has clicked the logout button
      // class for the create button
      createButtonClass:
        "bg-primary hover:bg-primary-hover rounded-md shadow-lg w-full ring-primary p-2 sm:py-4",
      isMenuButtonActive: false, // whether the menu button is active
      menuButtonsClass: "rounded-lg ring-primary p-2 py-4 hover:bg-gray-200", // common classes for the menu buttons
      menuButtonsInnerContainerClass: "w-full flex justify-start", // common classes for the inner container of the menu buttons
      menuButtonsIconClass:
        "text-gray-500 group-hover:text-primary fill-current h-4 md:h-6 w-4 md:w-6", // common classes for the icon of the menu buttons
      menuButtonsTextClass:
        "text-xl bp-500:text-sm md:text-base lg:text-lg ml-4 text-gray-500 group-hover:text-primary", // common classes for the text of the menu buttons
      menuSlideTransition: "", // transition name for menu sliding effect
      isSettingsMenuShown: false,
      settingsToRender: {}, // the settings object that will be rendered when settings menu is opened
      settingsWatchers: [], // the unwatch callbacks to the watchers attached to individual settings
    };
  },
  async created() {
    // whenever the app is set up (on a fresh page load)
    // reset the reAuthenticationState. This is required because if in the
    // previous run, if the user exited while the re-authentication was in process,
    // the reAuthenticationState is set as `in-process` in the store and the next
    // time user reloads, the value will remain the same
    this.setReAuthenticationState("not-started");

    this.resetAppState();

    // place a listener for the event of closing of the browser
    window.addEventListener("beforeunload", this.onClose);
    if (this.isAuthenticated) {
      await this.fetchAndUpdateUser();
      this.constructSettingsMenu();
    }
    // ask user to pick the language if they are visiting for the first time
    if (this.locale == null && this.user != null) {
      this.showLanguagePickerDialog = true;
    }

    // add event listeners to track if network connection went up or down
    window.Offline.on("down", this.showInternetLostToast);
    window.Offline.on("up", this.showInternetRestoredToast);

    // if user does not land on the home page, apply a transition
    if (!this.onHomePage) this.menuSlideTransition = "slide-fade";

    this.setWindowProperties();
    window.addEventListener("resize", this.setWindowProperties);

    // prevent menu from getting hidden on hot reload + when new
    // changes are fetched for the first time for a user
    if (!this.isMenuButtonActive && !this.isMobileScreen && this.onHomePage)
      this.isMenuButtonActive = true;
  },
  beforeUnmount() {
    // remove the listener for the event of closing of the browser
    window.removeEventListener("beforeunload", this.onClose);
    window.removeEventListener("resize", this.setWindowProperties);

    // remove the listeners set to track network connection
    window.Offline.off("down", this.showInternetLostToast);
    window.Offline.off("up", this.showInternetRestoredToast);
  },
  mounted() {
    // remove hash from the url if it is present
    if (location.hash) {
      location.replace(location.hash.replace("#", ""));
    }

    // set locale based on their config
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
      // close the side menu if in mobile mode and the workspace changes
      if (this.isMobileScreen) this.resetMenuState();
      this.constructSettingsMenu();
    },
    currentRoute() {
      // when the page is being changed, reset the state variables
      this.resetState();
    },
    isAuthenticated(value) {
      // if user was logged in before but has been logged out now
      // show a popup telling the user that they're logged out
      if (!value && !this.userClickedLogout) {
        // logout user when `isAuthenticated` value changes from true to false
        // and if the logout action was not triggered by the user
        this.logoutUser();
      }

      if (value) {
        // whenever the user logs in again,
        // reset the value of `userClickedLogout`
        this.userClickedLogout = false;
        if (this.locale == null) this.showLanguagePickerDialog = true;
        this.constructSettingsMenu();
      }
    },
    onHomePage(value) {
      // check if the current user actually belongs to the activeWorkspace
      // set in the store. If not, then redirect to the personal workspace
      if (value) {
        this.menuSlideTransition = "";
        let isUserInWorkspace = this.user.organizations.some((organization) => {
          // no need to redirect if the user belongs to the workspace
          // or the user is in the personal workspace
          return (
            organization.shortcode == this.activeWorkspace ||
            this.activeWorkspace == ""
          );
        });

        if (!isUserInWorkspace) {
          // make sure to pass the query params as it is so they're not lost
          // while redirecting
          this.$router.replace({
            name: "Home",
            query: this.$route.query,
          });
          // make sure to unset the active workspace as well
          this.unsetActiveWorkspace();
        }

        // if the user visits the home page on a non-mobile device, activate the menu button
        if (!this.isMobileScreen) this.isMenuButtonActive = true;
      } else {
        // if the user moves away from the home page, hide the menu button
        this.resetMenuState();
        this.menuSlideTransition = "slide-fade";
      }
    },
    user: {
      handler() {
        // identify on mixpanel if not already identified
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
        // reconstruct the settings menu whenever the user gets updated
        this.constructSettingsMenu();
      },
      deep: true,
    },
  },
  methods: {
    getImageSource: GenericUtilities.getImageSource,
    // object spread operator
    // https://vuex.vuejs.org/guide/state.html#object-spread-operator
    ...mapActions("auth", [
      "unsetAccessToken",
      "fetchAndUpdateUser",
      "setActiveWorkspace",
      "unsetActiveWorkspace",
      "setReAuthenticationState",
    ]),
    ...mapActions("auth", {
      /** update the user settings stored in vuex */
      updateUserStoreSettings: "setUserSettings",
      /** set the workspace settings stored in vuex */
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
    /**
     * Update the settings stored in the store and on the server as well
     * @param {Object} updatedSettings - details about the leaf settings that the user has updated
     */
    updateSettings(updatedSettings) {
      // The updatedSettings object contains all the settings that have been updated.
      // Each updated setting has the following keys:
      // headerName - name of the header to which the updated setting belongs to
      // tabName - name of the tab to which the updated setting belongs to
      // leafName - name of the updated leaf setting
      // newValue - the updated value
      // isWorkspaceSetting - whether the updated setting is a workspace setting
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
          if (newUserSettings == null)
            newUserSettings = clonedeep(this.userSettings);
          // newUserSettings
          //   .get(setting.headerName)
          //   .children.get(setting.tabName)
          //   .children.get(setting.leafName).value = setting.newValue;

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
    /**
     * This method constructs the settings menu that needs to be rendered when settings menu is open.
     * We iterate through the different levels of a settings object.
     * This settings object is the user's settings or the merger of users/workspace's settings depending on the active workspace.
     * For each of the leaf settings, which are the last leaf of the object, we attach some metadata to it,
     * and add a watcher which will trigger when the value for that setting has been changed.
     */
    constructSettingsMenu() {
      // by the time this method is invoked, if the userSettings store variable or activeWorkspaceSettings store variable
      // hasn't been updated, don't proceed and return.
      // userSettings / activeWorkspaceSettings should be Maps
      if (!(this.userSettings instanceof Map)) return;
      if (
        !this.isPersonalWorkspace &&
        !(this.activeWorkspaceSettings instanceof Map)
      )
        return;

      // unwatch any attached watchers
      this.settingsWatchers.forEach((unwatch) => unwatch());

      if (this.isPersonalWorkspace)
        this.settingsToRender = clonedeep(this.userSettings);
      else
        this.settingsToRender = SettingsUtilities.mergeSettings(
          clonedeep(this.userSettings),
          clonedeep(this.activeWorkspaceSettings)
        );

      // preparing settings to render but only for the App.vue component
      SettingsUtilities.prepareSettingsToRender(
        this.settingsToRender,
        true,
        "App.vue"
      );
    },
    closeSettingsMenu() {
      if (this.isMobileScreen) this.resetMenuState();
      this.isSettingsMenuShown = false;
    },
    showSettingsMenu() {
      this.isSettingsMenuShown = true;
    },
    /**
     * resets various state variables when the app is created
     */
    resetAppState() {
      if (this.pending) this.stopLoading();
      if (this.isSpinnerShown) this.hideSpinner();
      if (this.isDialogBoxShown) this.resetDialogBox();
      if (this.isSingleSelectorShown) this.hideSelector();
    },
    /**
     * invoked when the confirm button of the dialog box is clicked
     */
    dialogConfirmed() {
      this.resetDialogBox();
      this.setConfirmClicked();
    },
    /**
     * invoked when the cancel button of the dialog box is clicked;
     */
    dialogCancelled() {
      this.resetDialogBox();
      this.setCancelClicked();
    },
    /**
     * resets the config of the dialog box
     */
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
    /** resets the state of the menu button to inactive */
    resetMenuState() {
      this.isMenuButtonActive = false;
    },
    /** sets various properties dependent on the window size */
    setWindowProperties() {
      this.setWindowInnerWidth(window.innerWidth);
      this.setWindowInnerHeight(window.innerHeight);
    },
    /**
     * Show a toast telling the user that the internet connection went down
     */
    showInternetLostToast() {
      // dismiss the internet restored toast if it exists
      this.toast.dismiss("internetRestoredToast");
      // show a internet lost toast
      this.toast.error(this.$t("toast.error.internet_lost"), {
        id: "internetLostToast",
        position: "bottom-center",
        timeout: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      });
    },
    /**
     * Show a toast telling the user that the internet connection is up now
     */
    showInternetRestoredToast() {
      // dismiss the internet lost toast if it exists
      this.toast.dismiss("internetLostToast");
      // show an internet restored toast
      this.toast.success(this.$t("toast.success.internet_restored"), {
        id: "internetRestoredToast",
        position: "bottom-center",
      });
    },
    /** sets that the user intentionally wants to log out and logs out the user */
    logoutButtonClicked() {
      // set whether the logout action was triggered by the user
      this.userClickedLogout = true;
      this.logoutUser();
    },
    /** redirects to the home page */
    redirectToHome() {
      if (this.isMobileScreen) this.resetMenuState();
      this.$router.push({
        name: "Home",
        params: { workspace: this.activeWorkspace },
      });
    },
    /** redirects to the What's New page */
    redirectToWhatsNew() {
      window.open(
        "https://avantifellows.notion.site/What-s-New-1dc885b3ccc74e0aaa9c6789ab319abf/",
        "_blank",
        "noopener"
      );
    },
    /** redirects to the Documentation page */
    redirectToDocs() {
      window.open("https://docs.plio.in/", "_blank", "noopener");
    },
    /** redirects to the Plio for Teams page */
    redirectToTeamsPage() {
      window.open("https://docs.plio.in/plio-for-teams/", "_blank", "noopener");
    },
    /** redirects to the playlist for the Product Guides */
    redirectToProductGuides() {
      window.open(
        "https://www.youtube.com/playlist?list=PL3U0Jqw-piJgw2hSpuAZym4K1_Tb0RTRV",
        "_blank",
        "noopener"
      );
    },
    /** toggles the state of the menu button between active/inactive */
    toggleMenuButton() {
      this.isMenuButtonActive = !this.isMenuButtonActive;
    },
    /**
     * creates a new draft plio and redirects the user to the editor
     */
    async createNewPlio() {
      await PlioFunctionalService.createNewPlio(this);
    },
    /** logs out the user */
    logoutUser() {
      this.unsetAccessToken().then(() => {
        this.$router.replace({
          name: "Login",
          params: { userClickedLogout: this.userClickedLogout },
        });
        // resets the distinct ID so that multiple users can use the same device
        this.$mixpanel.reset();
        this.$mixpanel.track("Logout");

        // added here so that if someone clicks on logout while
        // some activity is pending
        this.stopLoading();

        // clear active workspace
        this.unsetActiveWorkspace();
      });
    },
    onClose(event) {
      // invoked when trying to close the browser or changing pages
      // only works on Editor page or the Player page
      if (this.onEditorPage || this.onPlayerPage) {
        event.preventDefault();
        event.returnValue = "";
      }

      // when the page is being closed, reset the state variables
      this.resetState();
    },
    /**
     * resets various state variables in the store
     */
    resetState() {
      if (this.isSharePlioDialogShown) this.unsetSharePlioDialog();
      if (this.isEmbedPlioDialogShown) this.unsetEmbedPlioDialog();
    },
    /**
     * sets the given locale as the locale for the user
     */
    setLocale(locale) {
      this.$mixpanel.register({
        "Current Locale": locale,
      });

      this.$i18n.locale = locale;
      UserConfigService.updateLocale();
      this.showLanguagePickerDialog = false;
      this.unsetFirstTimeLanguagePickerShownBySetting();
    },
    /**
     * triggered when any keyboard button is pressed
     */
    keyboardPressed() {
      // prevent keyboard buttons from working if the background is disabled
      if (this.isBackgroundDisabled) event.preventDefault();
    },
    /**
     * takes action based on the option selected in the list selector
     * @param {String} selectedOptionValue - the value of the option selected
     */
    selectOption(selectedOptionValue) {
      this.hideSelector();
      this.showSpinner();
      PlioAPIService.copyToWorkspace(this.selectedPlioId, {
        workspace: selectedOptionValue,
      })
        .then(() => {
          this.hideSpinner();
          // this.$router.push({ name: "Home", params: { workspace: selectedOptionValue } });
          // earlier this used to reload in place, but now we want to open in a new tab
          // because if someone is copying multiple plios to another workspace, they shouldn't have to
          // go back and forth between the workspaces
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
    ...mapState("auth", [
      "config",
      "user",
      "activeWorkspace",
      "userId",
      "userSettings",
    ]),
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
    /**
     * whether the router view is shown
     */
    isRouterViewShown() {
      return !(this.isMenuShownInline && this.isMobileScreen);
    },
    /**
     * whether the menu button is shown
     */
    isMenuButtonShown() {
      return !this.onHomePage || this.isMobileScreen;
    },
    /**
     * classes for the router view
     */
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
    /**
     * classes for the menu container
     */
    menuContainerClass() {
      return [
        {
          "absolute z-10 bg-white w-full bp-500:w-1/3 lg:w-1/4":
            this.isMenuShownOverlay || (!this.isMenuShown && !this.onHomePage),
        },
        `p-2 sm:p-4 border-r-2 flex flex-col col-span-3 bp-500:col-span-1 h-screen`,
      ];
    },
    /**
     * classes for the main grid
     */
    gridContainerClass() {
      return {
        "grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 h-screen":
          this.isMenuShownInline || !this.isMenuShownOverlay,
        flex: this.isMenuShownOverlay,
      };
    },
    /**
     * config of the icon for the logout button
     */
    logoutButtonIconConfig() {
      return {
        enabled: true,
        iconName: "logout",
        iconClass: this.menuButtonsIconClass,
      };
    },
    /**
     * config of the icon for the docs button
     */
    docsButtonIconConfig() {
      return {
        enabled: true,
        iconName: "docs",
        iconClass: this.menuButtonsIconClass,
      };
    },
    /**
     * config of the icon for the plio for teams button
     */
    teamsButtonIconConfig() {
      return {
        enabled: true,
        iconName: "teams",
        iconClass: this.menuButtonsIconClass,
      };
    },
    /**
     * config of the icon for the product guides button
     */
    productGuidesButtonIconConfig() {
      return {
        enabled: true,
        iconName: "exclamation-circle-solid",
        iconClass: this.menuButtonsIconClass,
      };
    },
    /**
     * config of the icon for the home button
     */
    homeButtonIconConfig() {
      return {
        enabled: true,
        iconName: "home-rounded",
        iconClass: this.menuButtonsIconClass,
      };
    },
    /**
     * config of the icon for the what's new button
     */
    whatsNewButtonIconConfig() {
      return {
        enabled: true,
        iconName: "gift",
        iconClass: this.menuButtonsIconClass,
      };
    },
    /**
     * classes for the menu button
     */
    menuButtonClass() {
      return [
        {
          "bg-gray-300": !this.isMenuButtonActive,
          "bg-primary": this.isMenuButtonActive,
        },
        `rounded-md border shadow-lg ring-primary h-12 w-12 p-2 self-center`,
      ];
    },
    /**
     * config of the icon for the menu button
     */
    menuButtonIconConfig() {
      // config for the icon of menu button
      return {
        enabled: true,
        iconName: "menu",
        iconClass: this.menuIconClass,
      };
    },
    /**
     * classes for the icon of the menu button
     */
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
    /**
     * whether the menu has been shown
     */
    isMenuShown() {
      return this.isMenuShownInline || this.isMenuShownOverlay;
    },
    /**
     * whether the menu has been shown in line with the router view
     */
    isMenuShownInline() {
      return this.isAuthenticated && this.isMenuButtonActive && this.onHomePage;
    },
    /**
     * whether the menu has been shown as an overlay on top of the router view
     */
    isMenuShownOverlay() {
      return (
        this.isAuthenticated && this.isMenuButtonActive && !this.onHomePage
      );
    },
    /**
     * config for the text of the create button
     */
    createButtonMenuTextConfig() {
      return {
        value: this.$t("home.create_button"),
        class: "text-xl bp-500:text-lg md:text-xl lg:text-2xl text-white",
      };
    },
    /**
     * config for the text of the logout button
     */
    logoutButtonTextConfig() {
      return {
        value: this.$t("nav.logout"),
        class: this.menuButtonsTextClass,
      };
    },
    /**
     * config for the text of the what's new button
     */
    whatsNewButtonTextConfig() {
      return {
        value: this.$t("nav.whats_new"),
        class: this.menuButtonsTextClass,
      };
    },
    /**
     * config for the text of the product guides button
     */
    productGuidesButtonTextConfig() {
      return {
        value: this.$t("nav.product_guides"),
        class: this.menuButtonsTextClass,
      };
    },
    /**
     * config for the text of the home button
     */
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
    /**
     * config for the text of the docs button
     */
    docsButtonTextConfig() {
      return {
        value: this.$t("nav.docs"),
        class: this.menuButtonsTextClass,
      };
    },
    /**
     * config for the text of the teams button
     */
    teamsButtonTextConfig() {
      return {
        value: this.$t("nav.teams"),
        class: this.menuButtonsTextClass,
      };
    },
    /**
     * whether to show workspace switcher
     */
    showWorkspaceSwitcher() {
      return (
        this.user.organizations != null && this.user.organizations.length > 0
      );
    },
    /**
     * dynamic classes for the nav bar
     */
    navBarClass() {
      return {
        hidden: this.isNavBarHidden,
      };
    },
    /**
     * whether the nav bar is hidden
     */
    isNavBarHidden() {
      return this.onPlioPage || this.onPlayerPage;
    },
    /**
     * the current route that the user is on
     */
    currentRoute() {
      return this.$route.path;
    },
    /**
     * whether the current page is the home page
     */
    onHomePage() {
      return this.$route.name == "Home";
    },
    /**
     * whether the page is still loading
     */
    isPageLoading() {
      return this.$route.name == undefined;
    },
    /**
     * whether the current page is the plio embed page
     */
    onPlioPage() {
      return this.$route.name == "Plio";
    },
    /**
     * whether the current page is the editor page
     */
    onEditorPage() {
      return this.$route.name == "Editor";
    },
    /**
     * whether the current page is the player page
     */
    onPlayerPage() {
      return this.$route.name == "Player";
    },
    /**
     * whether the current page is the login page
     */
    onLoginPage() {
      return this.$route.name == "Login";
    },
    checkIfIsSSOUser() {
      const output =
        "api_key" in this.$route.query && "unique_id" in this.$route.query;
      return output;
    },
    /**
     * whether the background should be disabled
     */
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
    /**
     * list of shortcodes of all workspaces that the user is a part of
     */
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
  src: local("Kruti Dev"),
    url("./assets/fonts/Kruti_Dev_10.TTF") format("truetype");
}
/* defines the transition that happens upon toggling the menu button */
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
