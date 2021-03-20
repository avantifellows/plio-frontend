<template>
  <div></div>
</template>

<script>
import ExperimentService from '@/APIClients/experimentService.js'
import { mapActions, mapState } from 'vuex'

export default {
  name: "ABTesting",
  props: ['id'], // coming from the router
  data() {
    return {
      assignment: null,
      userConfigs: {},
      plioId: null,
    };
  },

  created() {
    document.getElementById("nav").style.display = "none";
    if (!this.isLoggedIn) {
      this.$router.push({
        name: 'PhoneSignIn',
        params: { id: this.id, type: 'experiment'}
      });
    } else {
      // get variant and redirect user
      this.getAssignment();
    }
  },
  computed: mapState(['isLoggedIn', 'userId']),
  methods: {
    // object spread operator
    // https://vuex.vuejs.org/guide/state.html#object-spread-operator
    ...mapActions(['saveConfigs']),
    getAssignment() {
      ExperimentService.getExperimentAssignment(
        this.id,
        this.userId
      )
      .then((res) => {
        // separately seting plio ID although it will be the
        // same as assignment for now as we might conduct interface
        // level changes where assignment won't be the same as plio ID
        this.assignment = res.data.assignment;
        this.userConfigs = res.data.config;
        this.plioId = res.data.plioId;
      })
      .then(() =>
        this.saveConfigs({
          configs: JSON.stringify(this.userConfigs),
        })
      )
      .then(() => {
        console.log("Assignment: " + this.assignment);
        this.$router.push({
          name: 'Player',
          params: { id: this.plioId },
          query: { experiment: this.id }
        });
      })
      .catch((err) => this.handleQueryError(err));
    },

    handleQueryError(err) {
      if (err.response && err.response.status == 404) {
        this.$router.push({ name: '404' });
      } else {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped></style>
