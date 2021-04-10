<template>
  <div id="app">
    <PlioList />
  </div>
</template>

<script>
import { mapState } from "vuex";
import PlioList from "@/components/UI/PlioList.vue";

export default {
  created() {
    if (!this.isLoggedIn) {
      this.$router.push({ name: "PhoneSignIn" });
    }
  },

  name: "Home",
  components: {
    PlioList,
  },

  computed: mapState(["isLoggedIn"]),
};
</script>
