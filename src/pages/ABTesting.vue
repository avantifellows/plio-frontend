<template>
  <div></div>
</template>

<script>
import ExperimentAPIService from "@/services/API/Experiment.js";
import { mapActions } from "vuex";

export default {
  name: "ABTesting",
  props: ["id"], // coming from the router
  data() {
    return {
      assignment: null,
      userConfigs: {},
      plioId: null,
    };
  },

  created() {
    this.getAssignment();
  },
  methods: {
    // object spread operator
    // https://vuex.vuejs.org/guide/state.html#object-spread-operator
    ...mapActions("auth", ["saveConfigs"]),
    getAssignment() {
      ExperimentAPIService.getExperimentAssignment(this.id)
        .then((res) => {
          // separately seting plio ID although it will be the
          // same as assignment for now as we might conduct interface
          // level changes where assignment won't be the same as plio ID
          this.assignment = res.data.assignment;
          this.userConfigs = res.data.config;
          this.plioId = res.data.plioId;
        })
        .then(() => this.saveConfigs(JSON.stringify(this.userConfigs)))
        .then(() => {
          console.log("Assignment: " + this.assignment);
          this.$router.replace({
            name: "Player",
            params: { id: this.plioId },
            query: { experiment: this.id },
          });
        })
        .catch((err) => this.handleQueryError(err));
    },

    handleQueryError(err) {
      if (err.response && err.response.status == 404) {
        this.$router.replace({ name: "404" });
      } else {
        console.log(err);
      }
    },
  },
};
</script>
