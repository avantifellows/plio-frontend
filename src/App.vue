<template>
  <div class="flex relative">
    <div
      class="w-full"
      :class="{ 'opacity-20 pointer-events-none': coverBackground }"
      @keydown="keyboardPressed"
    >
      <div class="grid grid-cols-7 border-b-2 py-2 px-2 border-solid bg-white">
        <!-- top left logo -->
        <router-link
          :to="{ name: 'Home', params: { org: activeWorkspace } }"
          class="h-14 w-11 justify-self-start place-self-center"
          v-if="!onLoginPage"
        >
          <img
            class="h-full w-full object-scale-down"
            id="logo"
            src="@/assets/images/logo.png"
          />
        </router-link>

        <!-- workspace switcher -->
        <div class="place-self-center hidden sm:flex" v-if="showWorkspaceSwitcher">
          <WorkspaceSwitcher class="flex justify-center"></WorkspaceSwitcher>
        </div>

        <!-- page heading -->
        <div
          v-if="isAuthenticated"
          class="hidden sm:grid sm:col-start-4 sm:col-span-1 sm:place-self-center"
        >
          <p class="text-2xl sm:text-4xl">{{ currentPageName }}</p>
        </div>

        <!-- create plio button -->
        <div
          v-if="showCreateButton"
          class="grid col-start-3 col-end-6 sm:col-start-6 sm:col-end-7 gap-1"
        >
          <icon-button
            :titleConfig="createButtonTextConfig"
            :buttonClass="createButtonClass"
            class="rounded-md shadow-lg"
            @click="createNewPlio"
          ></icon-button>
        </div>

        <div class="grid col-start-6 col-end-8 justify-items-end sm:col-start-7">
          <!-- named routes - https://router.vuejs.org/guide/essentials/named-routes.html -->
          <!-- logout -->
          <div v-if="showLogout" class="text-lg sm:text-xl">
            <router-link v-if="!isAuthenticated" :to="{ name: 'Login' }">
              <button
                class="bg-white-500 hover:text-red-500 text-black font-bold border-0 object-contain"
              >
                {{ $t("nav.login") }}
              </button>
            </router-link>
            <a href="#" v-if="isAuthenticated" @click="logoutButtonClicked">
              <button
                class="bg-white-500 hover:text-red-500 text-black font-bold border-0 object-contain px-1 py-2"
              >
                {{ $t("nav.logout") }}
              </button>
            </a>
          </div>
          <!-- locale switcher -->
          <div class="self-center">
            <LocaleSwitcher id="locale" class="flex justify-center"></LocaleSwitcher>
          </div>
        </div>
      </div>
      <router-view />
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
  </div>
  <vue-progress-bar></vue-progress-bar>
</template>

<script>
import WorkspaceSwitcher from "@/components/App/WorkspaceSwitcher.vue";
import LocaleSwitcher from "@/components/App/LocaleSwitcher.vue";
import UserConfigService from "@/services/Config/User.js";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import SharePlioDialog from "@/components/App/SharePlioDialog.vue";
import PlioAPIService from "@/services/API/Plio.js";
import { mapActions, mapState, mapGetters } from "vuex";
import { useToast } from "vue-toastification";

export default {
  components: {
    WorkspaceSwitcher,
    LocaleSwitcher,
    IconButton,
    SharePlioDialog,
  },
  data() {
    return {
      showLanguagePickerDialog: false, // whether to show a language picker dialog box
      toast: useToast(), // use the toast component
      userClickedLogout: false, // if the user has clicked the logout button
    };
  },
  async created() {
    // reset the value of pending while creating the component
    if (this.pending) this.stopLoading();
    // place a listener for the event of closing of the browser
    window.addEventListener("beforeunload", this.onClose);
    if (this.isAuthenticated) {
      await this.fetchAndUpdateUser();
      this.setupChatwoot();
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
    // set locale based on their config
    UserConfigService.setLocaleFromUserConfig();
  },
  watch: {
    currentRoute() {
      // unset `isSharePlioDialogShown` if the share plio dialog is visible when the app is being loaded
      if (this.isSharePlioDialogShown) this.unsetSharePlioDialog();
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
        // setup chatwoot bubble
        this.setupChatwoot();
        if (this.locale == null) this.showLanguagePickerDialog = true;
      }
    },
    onHomePage(value) {
      // check if the current user actually belongs to the activeWorkspace
      // set in the store. If not, then redirect to the personal workspace
      if (value) {
        var isUserInWorkspace = this.user.organizations.some((org) => {
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
        }
      }

      // hide the chatwoot bubble if the user navigates away from the home page
      var chatwootBubble = document.querySelector(".woot-widget-bubble");
      if (chatwootBubble != undefined) {
        if (value) chatwootBubble.classList.remove("hidden");
        else chatwootBubble.classList.add("hidden");
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
    ...mapActions("auth", ["unsetAccessToken", "fetchAndUpdateUser"]),
    ...mapActions("generic", ["unsetSharePlioDialog"]),
    ...mapActions("sync", ["stopLoading"]),
    mountChatwoot() {
      // mounting chatwoot SDK to the DOM
      let chatwootScript = document.createElement("script");
      chatwootScript.innerHTML = `(function(d,t) {
          var BASE_URL="${process.env.VUE_APP_CHATWOOT_URL}";
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src=BASE_URL+"/packs/js/sdk.js";
          g.id="chatwoot_sdk_mount"
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            window.chatwootSDK.run({
              websiteToken: '${process.env.VUE_APP_CHATWOOT_TOKEN}',
              baseUrl: BASE_URL
            })
          }
        })(document,"script");`;
      chatwootScript.id = "chatwoot_script";
      document.head.appendChild(chatwootScript);
    },
    setupChatwoot() {
      // set up chatwoot instance and add event listener
      if (window.$chatwoot != undefined) window.$chatwoot.reset();
      this.mountChatwoot();
      window.addEventListener("chatwoot:ready", this.assignUserToChatwoot);
    },
    teardownChatwoot() {
      // teardown chatwoot instance

      // reset the instance
      if (window.$chatwoot != undefined) window.$chatwoot.reset();

      // hide the bubble
      var chatwootBubble = document.querySelector(".woot-widget-bubble");
      if (chatwootBubble != undefined) chatwootBubble.classList.add("hidden");
    },
    assignUserToChatwoot() {
      if (this.isAuthenticated) {
        // unhide chatwoot bubble if it was hidden before
        var chatwootBubble = document.querySelector(".woot-widget-bubble");
        if (chatwootBubble != undefined) {
          chatwootBubble.classList.remove("hidden");
          chatwootBubble.style.bottom = "60px";

          // hide the chatwoot bubble for all the pages except "Home"
          if (this.onHomePage) chatwootBubble.classList.remove("hidden");
          else chatwootBubble.classList.add("hidden");
        }

        // set the user for the chatwoot instance
        window.$chatwoot.setUser(this.user.id, {
          email: this.user.email || "no_email",
          name: this.user.first_name + this.user.last_name || "no_name",
        });

        window.removeEventListener("chatwoot:ready", this.assignUserToChatwoot);
      }
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
        this.teardownChatwoot();
      });
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
    onClose(event) {
      // invoked when trying to close the browser or changing pages
      // only works on Editor page or the Player page
      if (this.onEditorPage || this.onPlayerPage) {
        event.preventDefault();
        event.returnValue = "";
      }

      // unset the share plio variable if it was set as true when the app is being loaded
      if (this.isSharePlioDialogShown) this.unsetSharePlioDialog();
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
      // triggered when any keyboard button is pressed

      // prevent keyboard buttons from working if coverBackground = true
      if (this.coverBackground) event.preventDefault();
    },
  },
  computed: {
    ...mapGetters("auth", [
      "isAuthenticated",
      "isUserApproved",
      "activeWorkspaceSchema",
      "locale",
    ]),
    ...mapState("auth", ["config", "user", "activeWorkspace"]),
    ...mapState("generic", ["isSharePlioDialogShown", "plioLinkToShare"]),
    ...mapState("sync", ["pending"]),
    currentRoute() {
      return this.$route.path;
    },
    showLogout() {
      // whether to show the logout button
      return this.onHomePage;
    },
    createButtonTextConfig() {
      // config for the text of the main create button
      return {
        value: this.$t("home.create_button"),
        class: "text-lg md:text-xl lg:text-2xl text-white",
      };
    },
    createButtonClass() {
      // class for the create button
      return "bg-primary hover:bg-primary-hover rounded-lg ring-primary px-2";
    },
    showWorkspaceSwitcher() {
      // whether to show workspace switcher
      return (
        this.isAuthenticated &&
        this.onHomePage &&
        this.user.organizations.length &&
        this.isUserApproved
      );
    },
    onHomePage() {
      // whether the current page is the home page
      return this.$route.name == "Home";
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
    showCreateButton() {
      // whether to show the Create button
      return this.isAuthenticated && this.$route.name == "Home" && this.isUserApproved;
    },
    currentPageName() {
      // name of the current page as saved in assets/locales
      var pageName;
      if (this.$route.name) {
        pageName = this.$t("nav." + this.$route.name.toLowerCase());
      }
      return pageName;
    },
    coverBackground() {
      // whether to apply opacity on the background
      return this.showLanguagePickerDialog || this.isSharePlioDialogShown;
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
