<template>
  <div id="app" class="container">
    {{ $t("home.welcome") }}<br />
    <a href="http://creator.plio.in">{{ $t("home.create_plio") }}</a> <br />
    <a href="https://dashboard.plio.in">{{ $t("home.analyze_plio") }}</a> <br />
    <PlioList />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import PlioList from "@/components/UI/PlioList.vue";

export default {
  created() {
    if (!this.isLoggedIn) {
      this.$router.push({ name: 'PhoneSignIn' });
    }
  },

  name: "Home",
  components: {
    PlioList,
  },

  computed: mapState(['isLoggedIn'])
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
