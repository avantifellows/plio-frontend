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
        var questions = this.video_data.ivideo_details.questions.questions;
        var progressBar = document.querySelectorAll(".plyr__progress")[0];
        var left = progressBar.getBoundingClientRect().left;
        var right = progressBar.getBoundingClientRect().right;

        questions.forEach(function (question) {
          var marker = document.createElement("SPAN");
          
          marker.classList.add('tooltip')
          marker.classList.remove()
          var pos_percent = (question.time / player.duration);
          var left_pos = (right - left) * pos_percent;
          marker.style.setProperty("left",  `${left_pos}px`);
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
  },
};
</script>

<style>
@import "https://cdn.plyr.io/3.6.2/plyr.css";
.player_container {
  width: 800px;
  margin: auto;
}

.tooltip {
    background: #E69335;
    border-radius: 3px;
    bottom: 100%;
    line-height: 1.3;
    padding: calc(10px / 2) calc(calc(10px / 2) * 1.5);
    pointer-events: none;
    position: absolute;
    transform: translate(-50%,14px) scale(1);
    transform-origin: 50% 100%;
    z-index: 2;
}

</style>