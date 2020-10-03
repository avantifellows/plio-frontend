<template>
  {{ $route.params.id }}

    {{ video_data }}
  <div class="player_container" v-if="video_data">

    <div
      id="player"
      data-plyr-provider="youtube"
      :data-plyr-embed-id="video_data.ivideo_details.video_id"
    ></div>
    <slot>
    <IvideoQuestion ref="ivideo_question">
      <template v-slot:header>
        <h1>Modal title</h1>
      </template>

      <template v-slot:body>
        {{ question_text }}
      </template>

      <template v-slot:footer>
        <div class="d-flex align-items-center justify-content-between">
          <button
            class="btn btn--secondary"
            @click="$refs.modalName.closeModal()"
          >
            Cancel
          </button>
          <button
            class="btn btn--primary"
            @click="$refs.modalName.closeModal()"
          >
            Save
          </button>
        </div>
      </template>
    </IvideoQuestion>
    </slot>
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
      questions: null,
      question_text: null,
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
        .then((res) => (this.video_data = res.data))
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

    setPlayerProperties(player) {
      player.on("ready", () => {
        this.questions = this.video_data.ivideo_details.questions.questions;
        var progressBar = document.querySelectorAll(".plyr__progress")[0];
        var left = progressBar.getBoundingClientRect().left;
        var right = progressBar.getBoundingClientRect().right;

        this.questions.forEach(function (question) {
          var marker = document.createElement("SPAN");

          marker.classList.add("tooltip");
          marker.classList.remove();
          var pos_percent = question.time / player.duration;
          var left_pos = (right - left) * pos_percent;
          marker.style.setProperty("left", `${left_pos}px`);
          progressBar.appendChild(marker);
          question["marker"] = marker;
          question["state"] = "unanswered";  
        });
      });

      player.on("timeupdate", () => {
        
        if (this.player.currentTime > 10 && this.player.currentTime < 11) {
          this.player.pause();
          if (this.player.fullscreen.active ) {
            this.player.fullscreen.toggle()	
            
            
            
          }
          this.$refs.ivideo_question.openModal();
          var player = document.querySelectorAll(".plyr")[0]
          var modalBackdrop = document.querySelectorAll(".modal")[0]
          player.appendChild(modalBackdrop)

          
        }
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