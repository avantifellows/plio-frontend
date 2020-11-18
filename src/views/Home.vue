<template>
  <div id="app" class="container">
    Welcome to Plio! <br>
    <a href='http://creator.plio.in'>Create a new Plio</a> <br>
    <a href='https://dashboard.plio.in'>Analyze Plios</a> <br>
    <PlioList />
  </div>
</template>

<script>

import PlioList from '../components/PlioList.vue'

export default {
  created() {
    if (!this.isLoggedIn) {
      this.$router.push('/login/')
    }
    document.getElementById('nav').style.display = "inline";
  },

  name: "Home",
  components: {
    PlioList
  },

  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    }
  }
};
</script>

<style>
body {
  background: #e8f7f0;
  line-height: 1.6;
}
.container {
  max-width: 1100px;
  margin: auto;
  overflow: auto;
  padding: 0 2 rem;
}
</style>
