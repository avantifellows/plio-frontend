<template>
  <div id="nav">
    <router-link to="/">{{ $t("nav.home") }}</router-link> |
    <router-link v-if="!isLoggedIn" to="/login/">{{ $t("nav.login") }}</router-link>
    <a href="#" v-if="isLoggedIn" @click="logout">{{ $t("nav.logout") }}</a>
  </div>
  <LocaleSwitcher></LocaleSwitcher>
  <router-view />
</template>

<script>
import LocaleSwitcher from "./components/LocaleSwitcher.vue";
export default {
  components: {
    LocaleSwitcher,
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
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

@font-face {
  font-family: "Kruti Dev";
  src: local("Kruti Dev"), url("./fonts/Kruti_Dev_10.TTF") format("truetype");
}
</style>
