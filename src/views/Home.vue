<template>
  <div id="app" class="container">
    Welcome to Plio! <br>
    <a href='http://dry-atoll-92279.herokuapp.com'>Create a new Plio</a> <br>
    <a href='https://evening-inlet-95322.herokuapp.com'>Analyze Plios</a> <br>
    <IvideoList />
  </div>
</template>

<script>

import IvideoList from '../components/IvideoList.vue'

export default {
  created() {
    if (!this.isLoggedIn) {
      this.$router.push('/login/')
    }
    document.getElementById('nav').style.display = "inline";
  },

  name: "Home",
  components: {
    IvideoList
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
