<template>
  {{ $route.params.id }}

  <div class="player_container" v-if="video_data">
    {{ video_data }}

    <div
      id="player"
      data-plyr-provider="youtube"
      :data-plyr-embed-id="video_data.ivideo_details.video_id"
    ></div>
  </div>
</template>

<script>
import Plyr from "plyr";
import axios from "axios";

export default {
  name: "Player",
  data() {
    return {
      video_data: null,
    };
  },
  async created() {
    await this.fetchData();
  },
  methods: {
    fetchData() {
      axios
        .get(
          process.env.VUE_APP_BACKEND_URL +
            process.env.VUE_APP_BACKEND_IVIDEO_DETAILS +
            "?ivideo_id=" +
            this.$route.params.id
        )
        .then((res) => (this.video_data = res.data))
        .then(() => (this.player = new Plyr("#player")))
        .then(() => this.setPlayerProperties(this.player))
        .catch((err) => console.log(err));
    },

    setPlayerProperties(player) {
      player.on("ready", () => {
        console.log(this.video_data);
        var questions = this.video_data.ivideo_details.questions.questions;
        var progressBar = document.querySelectorAll(".plyr__progress")[0];

        questions.forEach(function (question) {
          console.log(question.time);
          var marker = document.createElement("SPAN");
          marker.className = "plyr__tooltip";
          marker.style.setProperty("opacity", 1);
          marker.style.setProperty("background-color", "#ff0");
          marker.style.setProperty("bottom", "80%");
          marker.style.setProperty("height", "80%");
          var pos_percent = (question.time / player.duration) * 100;
          marker.style.setProperty("left", `${pos_percent}%`);
          progressBar.appendChild(marker);
        });
      });
    },
  },
  computed: {
    playerOptions() {
      const options = {
        title: "This is an example video",
        playsinline: true,
        volume: 0,
        controls: ["play", "play-large"],
        debug: false,
      };
      return options;
    },
  },
  mounted() {
    // Store in data
    console.log(
      process.env.VUE_APP_BACKEND_URL +
        process.env.VUE_APP_BACKEND_IVIDEO_DETAILS +
        "?ivideo_id=" +
        this.$route.params.id
    );
  },
};
</script>

<style>
@import "https://cdn.plyr.io/3.6.2/plyr.css";
.player_container {
  width: 800px;
  margin: auto;
}
</style>