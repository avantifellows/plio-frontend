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
        <IvideoQuestion :ivq="ivq" :ref="'position' + ivq.id.toString()" @answer-submitted="submitAnswer" @answer-skipped="skipAnswer">
        </IvideoQuestion>
      </div>
  </div>
</template>

<script>
import Plyr from "plyr";
import axios from "axios";
import IvideoQuestion from "../components/IvideoQuestion.vue";

// The time period in which Plyr timeupdate event repeats
// in milliseconds
var interval_time = 50

export default {
  name: "Player",

  data() {
    return {
      ivideo_questions: [],
      dataLoaded: null,
      video_id: null,
      watch_time: 0,
      is_playing: false
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
      // start playing whenever the user submits an answer
      this.player.play()

      // Update state to "answered"
      ivq["state"] = "answered"

      // logging for testing
      console.log("Answer to be submitted here to Django");
      console.log("Question: " + ivq.item.question.text)
      console.log("Submitted answer: " + answer)
    },

    skipAnswer() {
      // start playing if the user skips the answer
      this.player.play()

      // logging for testing
      console.log("Answer skipped");
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
          //ivq["marker"] = marker;
        });
      });

      // sets isPlaying = true if the video is playing
      player.on("playing", async () => {
          this.is_playing = true
      });

      // sets isPlaying = false if the video is NOT playing
      player.on("pause", async () => {
          this.is_playing = false
      });

      player.on("timeupdate", async () => {

        // Update watch time if the video is playing
        if(this.is_playing) {
          this.watch_time += interval_time;
        }

        this.ivideo_questions.forEach(async (ivq) => {

          var question = ivq.item;
          var t = question.time;
          if (
            // "timeupdate" event is called every interval_time millisecond
            this.player.currentTime > t
            && this.player.currentTime < t + (interval_time/1000)
            //&& ivq["state"] == "notshown"
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

              if (ivq["state"] == "notshown") ivq["state"] = "unanswered"; 
              //var marker = ivq["marker"];
              this.player.pause();
              //marker.remove();
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