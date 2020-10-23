<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link v-if="!isLoggedIn" to="/login/">Login</router-link>  
    <a href="#" v-if="isLoggedIn" @click="logout"> Logout</a> 
  </div>
  <router-view/>
</template>

<script>

export default {
  data() {
    return {
      phone_number: null,
    };
  },

  created() {
    if (localStorage.phone) {
      this.phone_number = localStorage.phone
    }
  },

  methods: {
    logout() {
      this.$store.dispatch('logout')
      .then(this.$router.push('/login/'))

    }
  }, 
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    }
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
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
</style>
