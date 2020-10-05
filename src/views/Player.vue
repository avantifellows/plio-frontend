<template>
  {{ $route.params.id }}

  {{ video_data }}
  <div class="player_container" v-if="video_data">
    <div
      id="player"
      class="plyr"
      data-plyr-provider="youtube"
      :data-plyr-embed-id="video_data.ivideo_details.video_id"
    ></div>

      <div v-for="ivq in ivideo_questions" :key="ivq.id.toString()">
        <IvideoQuestion :v-bind:ivq="ivq.question.question.text" :ref="'position' + ivq.id.toString()">
        </IvideoQuestion>
        {{ ivq.question.time }}
        {{ivq.question.question.text}}
        {{ dataLoaded }}
      </div>
  </div>
</template>

<script>
import Plyr from "plyr";
import axios from "axios";
import IvideoQuestion from "../components/IvideoQuestion.vue";

export default {
  name: "Player",

  data() {
    return {
      video_data: null,
      ivideo_questions: [],
      questions: null,
      question_text: null,
      options: null,
      dataLoaded: null,
      markers: null
    };
  },
  async created() {
    await this.fetchData();
  },

  components: {
    IvideoQuestion,
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
        .then((res) => {
          this.video_data = res.data;
          this.questions = this.video_data.ivideo_details.questions.questions;
          var i = 0;
          for (i = 0; i < this.questions.length; i++) {
            console.log(this.questions[i])
            console.log("YO " + i);
            this.ivideo_questions.push({
              id: i.toString(),
              question: this.questions[i],
              user_answer: [],
              state: "notshown",
            });
          }
          console.log(this.ivideo_questions)
        })
        .then(() => this.dataLoaded = true)
        .then(
          () =>
            (this.player = new Plyr("#player", {
              controls: [
                "play",
                "progress",
                "current-time",
                "mute",
                "volume",
                "fullscreen",
              ],
            }))
        )
        
        .then(() => this.setPlayerProperties(this.player))
        .catch((err) => console.log(err));
    },

    async setPlayerProperties(player) {
      player.on("ready", () => {
        var progressBar = document.querySelectorAll(".plyr__progress")[0];
        var left = progressBar.getBoundingClientRect().left;
        var right = progressBar.getBoundingClientRect().right;
        this.markers = {}
        this.ivideo_questions.forEach(function (ivq) {
          var question = ivq.question;
          // Add marker to progress bar
          var marker = document.createElement("SPAN");
          marker.classList.add("tooltip");
          marker.classList.remove();
          var pos_percent = question.time / player.duration;
          var left_pos = (right - left) * pos_percent;
          marker.style.setProperty("left", `${left_pos}px`);
          progressBar.appendChild(marker);
          this.markers[question.time] = marker
        });
      });

      player.on("timeupdate", async () => {
        this.ivideo_questions.forEach(async (ivq) => {
          var question = ivq.question;
          var t = question.time;
          if (
            this.player.currentTime > t &&
            this.player.currentTime < t + 1 &&
            ivq["state"] == "notshown"
          ) {
            console.log(this.$refs)
            console.log(this.player.currentTime)
            console.log(ivq.id)
            var id = ivq.id
            this.$refs['position' + id.toString()].openModal();
            while (!document.querySelector(".modal")) {
              await new Promise((r) => setTimeout(r, 500));
            }
            var modal = document.getElementsByClassName("modal")[0];
            if (modal != undefined) {
              document
                .getElementsByClassName("plyr")[0]
                .appendChild(document.getElementsByClassName("modal")[0]);
              ivq["state"] = "unanswered";
              var marker = this.markers[t];
              this.player.pause();
              marker.remove();
            }
          }
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
  max-width: 800px;
  margin: auto;
  position: relative;
}

.tooltip {
  background: #e69335;
  border-radius: 3px;
  bottom: 100%;
  line-height: 1.3;
  padding: calc(10px / 2) calc(calc(10px / 2) * 1.5);
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, 14px) scale(1);
  transform-origin: 50% 100%;
  z-index: 2;
}
</style>