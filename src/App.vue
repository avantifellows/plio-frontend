<template>
  <div
    id="nav"
    class="grid grid-cols-6 sm:grid-cols-7 gap-2 border-b-2 pt-2 border-solid bg-white pl-2 pr-2"
  >
    <!-- top left logo -->
    <router-link
      :to="{ name: 'Home' }"
      class="h-14 w-11 justify-self-start place-self-center"
    >
      <img
        class="h-full w-full object-scale-down"
        id="logo"
        src="@/assets/images/logo.png"
      />
    </router-link>

    <!-- page heading -->
    <div
      v-if="isLoggedIn"
      class="hidden sm:grid sm:col-start-4 sm:col-span-1 sm:place-self-center"
    >
      <p class="text-2xl sm:text-4xl">{{ currentPageName }}</p>
    </div>

    <!-- create plio button -->
    <div
      v-if="showCreateButton"
      class="grid col-start-3 col-end-6 sm:col-start-6 sm:col-end-7 gap-1"
    >
      <icon-button :titleConfig="createButtonTextConfig" class="rounded-md"></icon-button>
    </div>

    <!-- logout and locale switcher -->
    <div class="grid col-start-7 sm:gap-1 sm:justify-items-center">
      <!-- named routes - https://router.vuejs.org/guide/essentials/named-routes.html -->
      <div v-if="!onLoginPage" class="text-lg sm:text-xl place-self-center">
        <router-link v-if="!isLoggedIn" :to="{ name: 'PhoneSignIn' }">
          <button
            class="bg-white-500 hover:text-red-500 text-black font-bold border-0 object-contain"
          >
            {{ $t("nav.login") }}
          </button>
        </router-link>
        <a href="#" v-if="isLoggedIn" @click="logoutUser">
          <button
            class="bg-white-500 hover:text-red-500 text-black font-bold border-0 object-contain px-1 py-2"
          >
            {{ $t("nav.logout") }}
          </button>
        </a>
      </div>
      <div class="place-self-center">
        <LocaleSwitcher id="locale" class="flex justify-center"></LocaleSwitcher>
      </div>
    </div>
    <user-properties ref="userProperties"></user-properties>
  </div>
  <loading-spinner v-if="pending"></loading-spinner>
  <router-view />
</template>

<script>
import LocaleSwitcher from "@/components/UI/LocaleSwitcher.vue";
import UserProperties from "@/services/Config/User.vue";
import LoadingSpinner from "@/components/UI/LoadingSpinner.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import { mapActions, mapState } from "vuex";

export default {
  components: {
    LocaleSwitcher,
    UserProperties,
    LoadingSpinner,
    IconButton,
  },
  data() {
    return {
      createButtonTextConfig: {
        value: "Create",
        class: "text-lg md:text-xl lg:text-2xl text-white",
      },
    };
  },
  mounted() {
    if (this.isLoggedIn && !this.hasLocalUserConfigs) {
      // fetch user config for logged in users if not already present
      this.$refs.userProperties.saveLocalUserConfigs();
    }
    // set locale based on their config
    this.$refs.userProperties.setLocaleFromUserConfig();
  },
  methods: {
    // object spread operator
    // https://vuex.vuejs.org/guide/state.html#object-spread-operator
    ...mapActions(["logout"]),
    logoutUser() {
      // logs out the user
      this.logout().then(() => {
        this.$router.push({ name: "PhoneSignIn" });
      });
    },
  },
  computed: {
    ...mapState(["pending", "isLoggedIn", "configs"]),
    hasLocalUserConfigs() {
      // whether the use configs have been set
      return this.configs != null;
    },
    onLoginPage() {
      // whether the current page is the login page
      return this.$route.name == "PhoneSignIn";
    },
    showCreateButton() {
      // whether to show the Create button
      return this.isLoggedIn && this.$route.name == "Home";
    },
    currentPageName() {
      // name of the current page as saved in assets/locales
      var pageName;
      if (this.$route.name) {
        pageName = this.$t("nav." + this.$route.name.toLowerCase());
      }
      return pageName;
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

/* #nav {
  padding: 10px;
  margin-left: auto;
  margin-right: auto;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
} */

/* #header {
  display: flex;
  padding-top: 20px;
  padding-bottom: 20px;
} */

/* #locale {
  height: 100%;
  display: flex;
  align-items: center;
  vertical-align: center;
} */
/*
.left {
  margin-right: auto;
}

.right {
  margin-left: auto;
}

.hidden {
  visibility: hidden;
} */

/* #nav a.router-link-exact-active {
  color: #42b983;
} */

/* #logo {
  position: absolute;
  height: 100%;
  width: 100%;
} */

@font-face {
  font-family: "Kruti Dev";
  src: local("Kruti Dev"), url("./assets/fonts/Kruti_Dev_10.TTF") format("truetype");
}
</style>
