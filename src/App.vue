<template>
  <div id="nav" class="grid grid-cols-5 gap-2 border-b-2 border-solid bg-white">
    <!-- top left logo -->
    <router-link
      v-if="isLoggedIn"
      :to="{ name: 'Home' }"
      class="h-15 w-11 justify-self-start p-0.5 mt-1 ml-5"
    >
      <img
        class="h-full w-full object-scale-down"
        id="logo"
        src="@/assets/images/logo.png"
      />
    </router-link>

    <!-- page heading -->
    <div v-if="isLoggedIn" class="col-start-3 col-span-1 place-self-center">
      <p class="text-2xl sm:text-4xl">{{ currentPageName }}</p>
    </div>

    <!-- logo in the center - only on login screen -->
    <router-link
      v-if="!isLoggedIn"
      :to="{ name: 'Home' }"
      class="h-15 w-10 place-self-center p-0.5 mt-1 col-start-3 col-span-1 place-self-center"
    >
      <img
        class="h-full w-full object-scale-down"
        id="logo"
        src="@/assets/images/logo.png"
      />
    </router-link>

    <!-- logout and locale switcher -->
    <div class="grid col-start-5 gap-1 mt-2 justify-items-auto justify-self-end mr-5">
      <!-- named routes - https://router.vuejs.org/guide/essentials/named-routes.html -->
      <div v-if="!onLoginPage" class="text-lg sm:text-2xl place-self-center">
        <router-link v-if="!isLoggedIn" :to="{ name: 'PhoneSignIn' }">
          <button
            class="bg-white-500 hover:text-red-500 text-black font-bold border-0 object-contain px-1 py-2"
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
import { mapActions, mapState } from "vuex";

export default {
  components: {
    LocaleSwitcher,
    UserProperties,
    LoadingSpinner,
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
      this.logout().then(() => {
        this.$router.push({ name: "PhoneSignIn" });
      });
    },
  },
  computed: {
    ...mapState(["pending", "isLoggedIn", "configs"]),
    hasLocalUserConfigs() {
      return this.configs != null;
    },
    onLoginPage() {
      return this.$route.name == "PhoneSignIn";
    },
    onPlayerPage() {
      return this.$route.name == "Player";
    },
    currentPageName() {
      var routerObject;
      if (this.$route.name) {
        if (this.$route.name == "Player" || this.$route.name == "ABTesting") {
          routerObject = "";
        } else {
          routerObject = this.$t("nav." + this.$route.name.toLowerCase());
        }
      }
      return routerObject;
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
