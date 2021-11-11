<template>
  <div class="flex relative">
    <div
      class="w-full"
      :class="{ 'opacity-20 pointer-events-none': isBackgroundDisabledLocal }"
      @keydown="keyboardPressed"
    >
      <div
        class="grid grid-cols-7 border-b-2 py-2 px-2 border-solid bg-white"
        :class="navBarClass"
      >
        <!-- menu icon -->
        <icon-button
          v-if="isAuthenticated"
          :iconConfig="menuButtonIconConfig"
          :buttonClass="menuButtonClass"
          class="rounded-md"
          @click="toggleMenuButton"
          :isDisabled="pending"
        ></icon-button>

        <div class="grid col-start-6 col-end-8 justify-items-end sm:col-start-7">
          <!-- locale switcher -->
          <div class="self-center">
            <LocaleSwitcher id="locale" class="flex justify-center"></LocaleSwitcher>
          </div>
        </div>
      </div>
      <div :class="{ 'grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': isMenuShown }">
        <div
          class="p-2 sm:p-4 border-r-2 flex flex-col h-screen col-span-3 bp-500:col-span-1 h-screen"
          v-if="isMenuShown"
        >
          <!-- workspace switcher -->
          <div class="place-self-center w-full" v-if="showWorkspaceSwitcher">
            <WorkspaceSwitcher
              class="flex justify-center"
              :isDisabled="pending"
            ></WorkspaceSwitcher>
          </div>

          <!-- create plio button -->
          <icon-button
            :titleConfig="createButtonMenuTextConfig"
            :buttonClass="createButtonClass"
            class="rounded-md shadow-lg my-4"
            @click="createNewPlio"
            :isDisabled="pending"
          ></icon-button>

          <!-- home button -->
          <icon-button
            class="place-self-start"
            :iconConfig="homeButtonIconConfig"
            :titleConfig="homeButtonTextConfig"
            :buttonClass="menuButtonsClass"
            @click="redirectToHome"
            :isDisabled="pending"
          ></icon-button>

          <!-- product guides -->
          <icon-button
            class="place-self-start"
            :iconConfig="productGuidesButtonIconConfig"
            :titleConfig="productGuidesButtonTextConfig"
            :buttonClass="menuButtonsClass"
            @click="redirectToProductGuides"
            :isDisabled="pending"
          ></icon-button>

          <!-- docs -->
          <icon-button
            class="place-self-start"
            :iconConfig="docsButtonIconConfig"
            :titleConfig="docsButtonTextConfig"
            :buttonClass="menuButtonsClass"
            @click="redirectToDocs"
            :isDisabled="pending"
          ></icon-button>

          <!-- whats new -->
          <icon-button
            class="place-self-start"
            :iconConfig="whatsNewButtonIconConfig"
            :titleConfig="whatsNewButtonTextConfig"
            :buttonClass="menuButtonsClass"
            @click="redirectToWhatsNew"
            :isDisabled="pending"
          ></icon-button>

          <!-- logout -->
          <icon-button
            class="place-self-start"
            :iconConfig="logoutButtonIconConfig"
            :titleConfig="logoutButtonTextConfig"
            :buttonClass="menuButtonsClass"
            @click="logoutButtonClicked"
            :isDisabled="pending"
          ></icon-button>
        </div>
        <router-view :class="{ 'col-span-2 lg:col-span-3 xl:col-span-4': isMenuShown }" />
      </div>
    </div>
    <!-- first-time language picker -->
    <div class="fixed w-full my-5 flex justify-center" v-if="showLanguagePickerDialog">
      <div
        class="bg-white w-11/12 sm:w-9/12 lg:w-7/12 p-4 sm:p-10 rounded-lg border border-black"
      >
        <p class="text-center text-2xl sm:text-4xl py-4 sm:py-8">Select your language</p>
        <div class="grid grid-cols-2 space-x-2">
          <div
            class="hover:bg-primary p-4 sm:p-8 rounded-lg border-4 group cursor-pointer"
            @click="setLocale('en')"
          >
            <p class="text-xl sm:text-3xl text-black text-center group-hover:text-white">
              English
            </p>
          </div>
          <div
            class="hover:bg-primary p-4 sm:p-8 rounded-lg border-4 group cursor-pointer"
            @click="setLocale('hi')"
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
        :plioId="plioIdToEmbed"
      ></EmbedPlioDialog>
    </div>
  </div>
  <vue-progress-bar></vue-progress-bar>
</template>

<script>
import WorkspaceSwitcher from "@/components/App/WorkspaceSwitcher.vue";
import LocaleSwitcher from "@/components/App/LocaleSwitcher.vue";
import UserConfigService from "@/services/Config/User.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SharePlioDialog from "@/components/App/SharePlioDialog.vue";
import EmbedPlioDialog from "@/components/App/EmbedPlioDialog.vue";
import PlioAPIService from "@/services/API/Plio.js";
import { mapActions, mapState, mapGetters } from "vuex";
import { useToast } from "vue-toastification";

export default {
  components: {
    LocaleSwitcher,
    SharePlioDialog,
    EmbedPlioDialog,
    WorkspaceSwitcher,
    IconButton,
  },
  data() {
    return {
      showLanguagePickerDialog: false, // whether to show a language picker dialog box
      toast: useToast(), // use the toast component
      userClickedLogout: false, // if the user has clicked the logout button
      // class for the create button
      createButtonClass:
        "bg-primary hover:bg-primary-hover rounded-lg w-full ring-primary p-2 sm:py-4",
      isMenuButtonPressed: false,
      menuButtonsClass: "rounded-lg ring-primary p-2 py-4",
      menuButtonsIconClass: "text-gray-500 fill-current h-4 md:h-6 w-4 md:w-6",
      menuButtonsTextClass: "text-sm md:text-base lg:text-lg ml-4 text-gray-500",
    };
  },
  async created() {
    // whenever the app is set up (on a fresh page load)
    // reset the reAuthenticationState. This is required because if in the
    // previous run, if the user exited while the re-authentication was in process,
    // the reAuthenticationState is set as `in-process` in the store and the next
    // time user reloads, the value will remain the same
    this.setReAuthenticationState("not-started");

    // reset the value of pending while creating the component
    if (this.pending) this.stopLoading();
    // reset the value of whether background is disabled
    if (this.isBackgroundDisabled) this.enableBackground();
    // place a listener for the event of closing of the browser
    window.addEventListener("beforeunload", this.onClose);
    if (this.isAuthenticated) {
      await this.fetchAndUpdateUser();
    }
    // ask user to pick the language if they are visiting for the first time
    if (this.locale == null && this.isAuthenticated) {
      this.showLanguagePickerDialog = true;
    }
  },
  beforeUnmount() {
    // remove the listener for the event of closing of the browser
    window.removeEventListener("beforeunload", this.onClose);
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
      }
    },
    onHomePage(value) {
      // check if the current user actually belongs to the activeWorkspace
      // set in the store. If not, then redirect to the personal workspace
      if (value) {
        let isUserInWorkspace = this.user.organizations.some((org) => {
          // no need to redirect if the user belongs to the workspace
          // or the user is in the personal workspace
          return org.shortcode == this.activeWorkspace || this.activeWorkspace == "";
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

        if (window.innerWidth > 500) this.isMenuButtonPressed = true;
      } else {
        this.isMenuButtonPressed = false;
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
      },
      deep: true,
    },
  },
  methods: {
    // object spread operator
    // https://vuex.vuejs.org/guide/state.html#object-spread-operator
    ...mapActions("auth", [
      "unsetAccessToken",
      "fetchAndUpdateUser",
      "unsetActiveWorkspace",
      "setReAuthenticationState",
    ]),
    ...mapActions("generic", [
      "unsetSharePlioDialog",
      "unsetEmbedPlioDialog",
      "enableBackground",
    ]),
    ...mapActions("sync", ["stopLoading"]),
    redirectToHome() {
      this.$router.push({ name: "Home", params: { org: this.activeWorkspace } });
    },
    redirectToWhatsNew() {
      window.open("https://plio.substack.com/", "_blank", "noopener");
    },
    redirectToDocs() {
      window.open("https://docs.plio.in/", "_blank", "noopener");
    },
    redirectToProductGuides() {
      window.open(
        "https://www.youtube.com/playlist?list=PL3U0Jqw-piJgw2hSpuAZym4K1_Tb0RTRV",
        "_blank",
        "noopener"
      );
    },
    toggleMenuButton() {
      this.isMenuButtonPressed = !this.isMenuButtonPressed;
    },
    createNewPlio() {
      // invoked when the user clicks on Create
      // creates a new draft plio and redirects the user to the editor
      this.$Progress.start();
      this.$mixpanel.track("Click Create");
      this.$mixpanel.people.set_once({
        "First Plio Created": new Date().toISOString(),
      });
      this.$mixpanel.people.set({
        "Last Plio Created": new Date().toISOString(),
      });
      this.$mixpanel.people.increment("Total Plios Created");
      PlioAPIService.createPlio()
        .then((response) => {
          this.$Progress.finish();
          if (response.status == 201) {
            this.$router.push({
              name: "Editor",
              params: { plioId: response.data.uuid, org: this.activeWorkspace },
            });
          }
        })
        .catch(() => this.toast.error(this.$t("error.create_plio")));
    },
    logoutButtonClicked() {
      // set whether the logout action as triggered by the user or not
      this.userClickedLogout = true;
      // logout the user
      this.logoutUser();
    },
    logoutUser() {
      // logs out the user
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
    setLocale(locale) {
      // sets the given locale as the locale for the user
      this.$mixpanel.register({
        "Current Locale": locale,
      });

      this.$i18n.locale = locale;
      UserConfigService.updateLocale();
      this.showLanguagePickerDialog = false;
    },
    keyboardPressed() {
      /**
       * triggered when any keyboard button is pressed
       */

      // prevent keyboard buttons from working if isBackgroundDisabledLocal = true
      if (this.isBackgroundDisabledLocal) event.preventDefault();
    },
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated", "activeWorkspaceSchema", "locale"]),
    ...mapState("auth", ["config", "user", "activeWorkspace"]),
    ...mapState("generic", [
      "isSharePlioDialogShown",
      "isEmbedPlioDialogShown",
      "plioLinkToShare",
      "plioIdToEmbed",
      "isBackgroundDisabled",
    ]),
    ...mapState("sync", ["pending"]),
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
        iconName: "home",
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
          "bg-gray-300": !this.isMenuButtonPressed,
          "bg-primary": this.isMenuButtonPressed,
        },
        `rounded-lg shadow-lg ring-primary w-16 p-2`,
      ];
    },
    menuButtonIconConfig() {
      // config for the icon of menu button
      return {
        enabled: true,
        iconName: "menu",
        iconClass: this.menuIconClass,
      };
    },
    menuIconClass() {
      return [
        {
          "text-white": this.isMenuButtonPressed,
          "text-black": !this.isMenuButtonPressed,
        },
        `fill-current h-8 w-8`,
      ];
    },
    isMenuShown() {
      return this.isAuthenticated && this.isMenuButtonPressed;
    },
    createButtonMenuTextConfig() {
      // config for the text of the main create button
      return {
        value: this.$t("home.create_button"),
        class: "text-md sm:text-lg md:text-xl lg:text-2xl text-white",
      };
    },
    logoutButtonTextConfig() {
      // config for the logout button
      return {
        value: this.$t("nav.logout"),
        class: this.menuButtonsTextClass,
      };
    },
    whatsNewButtonTextConfig() {
      // config for the whats new button
      return {
        value: this.$t("nav.whats_new"),
        class: this.menuButtonsTextClass,
      };
    },
    productGuidesButtonTextConfig() {
      // config for the product guides button
      return {
        value: this.$t("nav.product_guides"),
        class: this.menuButtonsTextClass,
      };
    },
    homeButtonTextConfig() {
      // config for the home button
      return {
        value: this.$t("nav.home"),
        class: this.menuButtonsTextClass,
      };
    },
    docsButtonTextConfig() {
      // config for the plio docs button
      return {
        value: this.$t("nav.docs"),
        class: this.menuButtonsTextClass,
      };
    },
    showWorkspaceSwitcher() {
      // whether to show workspace switcher
      return this.user.organizations.length > 0;
    },
    navBarClass() {
      // dynamic classes for the nav bar
      return {
        hidden: this.isNavBarHidden,
      };
    },
    isNavBarHidden() {
      // whether the nav bar is hidden
      return this.onPlioPage || this.onPlayerPage;
    },
    currentRoute() {
      return this.$route.path;
    },
    onHomePage() {
      // whether the current page is the home page
      return this.$route.name == "Home";
    },
    onPlioPage() {
      // whether the current page is the plio embed page
      return this.$route.name == "Plio";
    },
    onEditorPage() {
      // whether the current page is the editor page
      return this.$route.name == "Editor";
    },
    onPlayerPage() {
      // whether the current page is the player page
      return this.$route.name == "Player";
    },
    onLoginPage() {
      // whether the current page is the login page
      return this.$route.name == "Login";
    },
    isBackgroundDisabledLocal() {
      // whether the background should be disabled
      return (
        this.showLanguagePickerDialog ||
        this.isSharePlioDialogShown ||
        this.isEmbedPlioDialogShown ||
        this.isBackgroundDisabled
      );
    },
    allWorkspaces() {
      // list of shortcodes of all workspaces that the user is a part of
      if (this.user == null) return [];
      var shortcodes = [];

      this.user.organizations.forEach((organization) => {
        shortcodes.push(organization.shortcode);
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
</style>
