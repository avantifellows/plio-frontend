<template>
  <div :class="{ 'opacity-50 pointer-events-none': coverBackground }">
    <div
      class="grid grid-cols-6 sm:grid-cols-7 gap-2 border-b-2 pt-2 border-solid bg-white pl-2 pr-2"
    >
      <!-- top left logo -->
      <router-link
        :to="{ name: 'Home', params: { org: activeWorkspace } }"
        class="h-14 w-11 justify-self-start place-self-center"
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
        class="grid col-start-3 col-end-6 sm:col-start-6 sm:col-end-7 gap-1 bg-primary hover:bg-primary-hover rounded-lg"
      >
        <icon-button
          :titleConfig="createButtonTextConfig"
          class="rounded-md shadow-lg"
          @click="createNewPlio"
        ></icon-button>
      </div>

      <div class="grid col-start-7 sm:gap-1 sm:justify-items-center">
        <!-- named routes - https://router.vuejs.org/guide/essentials/named-routes.html -->
        <!-- logout -->
        <div v-if="!onLoginPage" class="text-lg sm:text-xl place-self-center">
          <router-link v-if="!isAuthenticated" :to="{ name: 'Login' }">
            <button
              class="bg-white-500 hover:text-red-500 text-black font-bold border-0 object-contain"
            >
              {{ $t("nav.login") }}
            </button>
          </router-link>
          <a href="#" v-if="isAuthenticated" @click="logoutUser">
            <button
              class="bg-white-500 hover:text-red-500 text-black font-bold border-0 object-contain px-1 py-2"
            >
              {{ $t("nav.logout") }}
            </button>
          </a>
        </div>
        <!-- locale switcher -->
        <div class="place-self-center">
          <LocaleSwitcher id="locale" class="flex justify-center"></LocaleSwitcher>
        </div>
      </div>
      <user-config ref="userConfig"></user-config>
    </div>
    <router-view />
  </div>
  <dialog-box
    class="fixed top-1/3 left-0 right-0 ml-auto mr-auto"
    v-if="showDialogBox"
    :title="dialogTitle"
    :description="dialogDescription"
    :confirmButtonConfig="dialogConfirmButtonConfig"
    :cancelButtonConfig="dialogCancelButtonConfig"
    @confirm="dialogConfirmed"
    @cancel="dialogCancelled"
  ></dialog-box>
  <vue-progress-bar></vue-progress-bar>
</template>

<script>
import WorkspaceSwitcher from "@/components/UI/WorkspaceSwitcher.vue";
import LocaleSwitcher from "@/components/UI/LocaleSwitcher.vue";
import UserConfig from "@/services/Config/User.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import { mapActions, mapState, mapGetters } from "vuex";
import PlioAPIService from "@/services/API/Plio.js";
import { useToast } from "vue-toastification";
import DialogBox from "@/components/UI/Alert/DialogBox";

export default {
  components: {
    WorkspaceSwitcher,
    LocaleSwitcher,
    UserConfig,
    IconButton,
    DialogBox,
  },
  data() {
    return {
      createButtonTextConfig: {
        value: "Create",
        class: "text-lg md:text-xl lg:text-2xl text-white",
      },
      showDialogBox: false, // to show the dialog box or not
      toast: useToast(), // use the toast component
      dialogTitle: "", // title for the dialog box
      dialogDescription: "", // description for the dialog box
      dialogConfirmButtonConfig: {}, // config for the confirm button of the dialog box
      dialogCancelButtonConfig: {}, // config for the cancel button of the dialog box
      dialogAction: "", // action that needs be performed on interaction with the dialogbox
    };
  },
  created() {
    // place a listener for the event of closing of the browser
    window.addEventListener("beforeunload", this.onClose);
  },
  beforeUnmount() {
    // remove the listener for the event of closing of the browser
    window.removeEventListener("beforeunload", this.onClose);
  },
  mounted() {
    // set locale based on their config
    this.$refs.userConfig.setLocaleFromUserConfig();
  },
  watch: {
    pending(value) {
      // start or finish progress bar depending on the value of "pending"
      if (value) this.$Progress.start();
      else this.$Progress.finish();
    },
    loginStatus(newValue, oldValue) {
      // if user was logged in before but has been logged out now
      // show a popup telling the user that they're logged out
      if (oldValue && !newValue) this.showUserLoggedOutDialog();
    },
  },
  methods: {
    // object spread operator
    // https://vuex.vuejs.org/guide/state.html#object-spread-operator
    ...mapActions("auth", ["unsetAccessToken"]),
    ...mapActions("sync", ["startLoading", "stopLoading"]),
    logoutUser() {
      // logs out the user
      this.unsetAccessToken().then(() => {
        this.$router.replace({ name: "Login" });
      });
    },
    createNewPlio() {
      // invoked when the user clicks on Create
      // creates a new draft plio and redirects the user to the editor
      this.$Progress.start();
      PlioAPIService.createPlio().then((response) => {
        this.$Progress.finish();
        if (response.status == 201) {
          this.$router.push({
            name: "Editor",
            params: { plioId: response.data.uuid, org: this.activeWorkspace },
          });
        } else {
          this.toast.error("Error creating Plio");
        }
      });
    },
    onClose(event) {
      // invoked when trying to close the browser or changing pages
      event.preventDefault();
      event.returnValue = "";
    },
    showUserLoggedOutDialog() {
      // set up the dialog properties when the user has been logged out by the system
      this.dialogTitle = "You've been logged out";
      this.dialogDescription = "Click the button below to log in again";
      this.dialogConfirmButtonConfig = {
        enabled: true,
        text: "Login",
        class:
          "bg-primary-button hover:bg-primary-button-hover focus:outline-none focus:ring-0",
      };
      this.dialogCancelButtonConfig = {
        enabled: false,
        text: "",
        class: "",
      };

      // carry out the loginAgain action when dialog is closed
      this.dialogAction = "loginAgain";
      // show the dialogue
      this.showDialogBox = true;
      // route to the 404 page
      this.$router.replace({ name: "404" });
    },
    dialogConfirmed() {
      // invoked when the confirm button of the dialog box is clicked
      this.showDialogBox = false;
      this.dialogDescription = "";
      // close the dialog box when user clicks the button
      if (this.dialogAction == "loginAgain") {
        this.logoutUser();
        this.showDialogBox = false;
      }
      // reset the dialog action value
      this.dialogAction = "";
    },
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated", "isUserApproved"]),
    ...mapState("auth", ["config", "user", "activeWorkspace", "loginStatus"]),
    ...mapState("sync", ["pending"]),
    showWorkspaceSwitcher() {
      // whether to show workspace switcher
      return (
        this.isAuthenticated &&
        this.onHomePage &&
        this.user.organizations.length &&
        this.isUserApproved
      );
    },
    onLoginPage() {
      // whether the current page is the login page
      return this.$route.name == "Login";
    },
    onHomePage() {
      // whether the current page is the home page
      return this.$route.name == "Home";
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
      // whether to apply opacity to the background
      return this.showDialogBox;
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
