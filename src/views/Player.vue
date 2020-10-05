<template>
  {{ $route.params.id }}

  <div class="player_container" v-if="dataLoaded">
    <div
      id="player"
      class="plyr"
      data-plyr-provider="youtube"
      :data-plyr-embed-id="video_id"
    ></div>
      <div v-for="ivq in ivideo_questions" :key="ivq.id.toString()" >
        <IvideoQuestion :ivq="ivq" :ref="'position' + ivq.id.toString()" v-on:answer-submitted="submitAnswer">
        </IvideoQuestion>
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
      ivideo_questions: [],
      dataLoaded: null,
      video_id: null,
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
        .then( (res) => {
          console.log(res.data)
          var questions = res.data.ivideo_details.questions.questions;
          this.video_id = res.data.ivideo_details.video_id;
          var i = 0;
          for (i = 0; i < questions.length; i++) {
            this.ivideo_questions.push({
              id: i.toString(),
              item: questions[i],
              user_answer: [],
              state: "notshown",
            });
          }
        } )
        .then( this.dataLoaded = true )
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

    submitAnswer(ivq, answer) {
      console.log("Answer to be submitted here to Django");
      console.log("Question: " + ivq.item.question.text)
      console.log("Submitted answer: " + answer)
    },

    async setPlayerProperties(player) {
      player.on("ready", () => {
        var progressBar = document.querySelectorAll(".plyr__progress")[0];
        // var left = progressBar.getBoundingClientRect().left;
        // var right = progressBar.getBoundingClientRect().right;
        this.ivideo_questions.forEach(function (ivq) {
          var question = ivq.item;
          // Add marker to progress bar
          var marker = document.createElement("SPAN");
          marker.classList.add("tooltip");
          marker.classList.remove();
          var pos_percent = 100 * question.time / player.duration; 
          marker.style.setProperty("left", `${pos_percent}%`);
          progressBar.appendChild(marker);
          ivq["marker"] = marker;
        });
      });


      player.on("timeupdate", async () => {
        this.ivideo_questions.forEach(async (ivq) => {
          var question = ivq.item;
          var t = question.time;
          if (
            this.player.currentTime > t
            && this.player.currentTime < t + 1 
            && ivq["state"] == "notshown"
          ) {
            var id = ivq.id
            this.$refs['position' + id.toString()].openModal();
            while (!document.querySelector(".modal")) {
              await new Promise((r) => setTimeout(r, 500));
            }
            var modal = document.getElementsByClassName("modal")[0];
            if (modal != undefined)   {
              document
                .getElementsByClassName("plyr")[0]
                .appendChild(document.getElementsByClassName("modal")[0]);
              ivq["state"] = "unanswered";
              var marker = ivq["marker"];
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
  background:red;
  border-radius: 3px;
  bottom: 100%;
  padding: 5px 3px;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, 14px);
  z-index: 2;
}
</style>