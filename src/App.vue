<template>
  <div id="header">
    <div id="nav">
      <router-link to="/">{{ $t("nav.home") }}</router-link> |
      <router-link v-if="!isLoggedIn" to="/login/">{{ $t("nav.login") }}</router-link>
      <a href="#" v-if="isLoggedIn" @click="logout">{{ $t("nav.logout") }}</a>
    </div>
    <div class="overlay">
      <LocaleSwitcher id="locale"></LocaleSwitcher>
    </div>
    <set-user-properties ref="userProperties"></set-user-properties>
  </div>
  <router-view />
</template>

<script>
import LocaleSwitcher from "./components/LocaleSwitcher.vue";
import SetUserProperties from "./components/SetUserProperties.vue";

export default {
  components: {
    LocaleSwitcher,
    SetUserProperties,
  },
  mounted() {
    if (this.isLoggedIn && !this.hasLocalUserConfigs) {
      // fetch user config for logged in users if not already present
      this.$refs.userProperties.saveLocalUserConfigs();
    }
    // set locale based on their config
    this.$refs.userProperties.setLocale();
  },
  methods: {
    logout() {
      this.$store.dispatch("logout").then(this.$router.push("/login/"));
    },
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    hasLocalUserConfigs() {
      return this.$store.getters.getConfigs != null;
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
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#header {
  position: relative;
  padding-top: 20px;
  padding-bottom: 20px;
}

#locale {
  height: 100%;
  display: flex;
  align-items: center;
  vertical-align: center;
}

.overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  align-items: center;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

@font-face {
  font-family: "Kruti Dev";
  src: local("Kruti Dev"), url("./fonts/Kruti_Dev_10.TTF") format("truetype");
}
</style>
