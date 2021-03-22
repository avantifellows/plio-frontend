<template>
  <div id="header">
    <div class="left">
      <LocaleSwitcher id="locale" class="hidden"></LocaleSwitcher>
    </div>
    <div id="nav">
      <!-- named routes - https://router.vuejs.org/guide/essentials/named-routes.html -->
      <router-link :to="{ name: 'Home' }">{{ $t("nav.home") }}</router-link> |
      <router-link v-if="!isLoggedIn" :to="{ name: 'PhoneSignIn' }">{{
        $t("nav.login")
      }}</router-link>
      <a href="#" v-if="isLoggedIn" @click="logoutUser">{{ $t("nav.logout") }}</a>
    </div>
    <div class="right">
      <LocaleSwitcher id="locale"></LocaleSwitcher>
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
  },
};
</script>
<style>
#app {
  font-family: "KrutiDev", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 10px;
  margin-left: auto;
  margin-right: auto;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#header {
  display: flex;
  padding-top: 20px;
  padding-bottom: 20px;
}

#locale {
  height: 100%;
  display: flex;
  align-items: center;
  vertical-align: center;
}

.left {
  margin-right: auto;
}

.right {
  margin-left: auto;
}

.hidden {
  visibility: hidden;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

@font-face {
  font-family: "Kruti Dev";
  src: local("Kruti Dev"), url("./assets/fonts/Kruti_Dev_10.TTF") format("truetype");
}
</style>
