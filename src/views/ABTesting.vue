<template>
  <div></div>
</template>

<script>
import axios from "axios";

export default {
  name: "ABTesting",
  data() {
    return {
      assignment: null,
      userConfig: {},
      plioId: null,
    };
  },

  created() {
    document.getElementById("nav").style.display = "none";
    if (!localStorage.phone) {
      this.$router.push({
        path: "/login/" + this.$route.params.id + "/experiment",
      });
    } else {
      // get variant and redirect user
      this.getAssignment();
    }
  },
  methods: {
    getAssignment() {
      var url =
        process.env.VUE_APP_BACKEND +
        process.env.VUE_APP_BACKEND_EXPERIMENT_ASSIGNMENT +
        "?experimentId=" +
        this.$route.params.id +
        "&userId=" +
        localStorage.phone;
      axios
        .get(url)
        .then((res) => {
          // separately seting plio ID although it will be the
          // same as assignment for now as we might conduct interface
          // level changes where assignment won't be the same as plio ID
          this.assignment = res.data.assignment;
          this.userConfig = res.data.config;
          this.plioId = res.data.plioId;
        })
        .then(() =>
          this.$store.dispatch("saveConfig", {
            config: JSON.stringify(this.userConfig),
          })
        )
        .then(() => {
          console.log("Assignment: " + this.assignment);
          this.$router.push({
            path: "/play/" + this.plioId,
            query: {
              experiment: this.$route.params.id,
            },
          });
        })
        .catch((err) => this.handleQueryError(err));
    },

    handleQueryError(err) {
      if (err.response && err.response.status == 404) {
        this.$router.push("/404-not-found");
      } else {
        console.log(err);
      }
    },
  },
};
</script>

<style scoped></style>
