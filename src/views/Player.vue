<template>
  <div> 
    <div class="player_container" v-if="dataLoaded && isBrowserSupported">
      <div
        id="player"
        class="plyr"
        data-plyr-provider="youtube"
        :data-plyr-embed-id="video_id"
      ></div>
      <div v-for="ivq in ivideo_questions" :key="ivq.id.toString()" >
        <IvideoQuestion :ivq="ivq" :ref="'position' + ivq.id.toString()" @answer-submitted="submitAnswer" @answer-skipped="skipAnswer" @revision-needed="revise">
        </IvideoQuestion>
      </div>

      <div class="error" v-if="!isFullscreen">
        <button 
          class="btn" @click="this.player.fullscreen.enter()">
          Full Screen पे देखें
        </button>
      </div>
    </div>
    <Error type="browser_error" :value="browserErrorHandlingValue" v-if="!isBrowserSupported"></Error>
  </div>
</template>

<script>
import Plyr from "plyr";
import axios from "axios";
import IvideoQuestion from "../components/IvideoQuestion.vue";
import Error from "../views/Error.vue";

// The time period in which Plyr timeupdate event repeats
// in milliseconds
var interval_time = 50;

// upload to s3 after a fixed interval of time 
var upload_interval = 45000;
var timeout = null;

export default {
  name: "Player",

  data() {
    return {
      student_id: '',
      ivideo_questions: [],
      dataLoaded: null,
      video_id: null,
      watch_time: 0,
      answers: [],
      options: [],
      times: [],
      ivideo_id: null,
      source: 'unknown',
      isFullscreen: true,
      supported_browsers: ['Chrome', 'Chrome Mobile', 'Firefox', 'Firefox Mobile', 'Microsoft Edge'],
      isBrowserSupported: true,
      browserErrorHandlingValue: {
        'failsafe_type': 'g-form',
        'failsafe_url': ''
      }
    };
  },
  async created() {
    if(!localStorage.phone) {
      this.$router.push({path: '/login/' + this.$route.params.id})
    }

    this.student_id = localStorage.phone,
    console.log("Setting student id to: " + this.student_id)
    await this.fetchData();

    document.getElementById('nav').style.display = "none";

    if (this.$route.query.src) {
        this.source = this.$route.query.src;
    }
  },

  components: {
    IvideoQuestion,
    Error
  },

  methods: {
    // will change this in next PR
    checkBrowser(browser) {
      console.log(browser)
      this.isBrowserSupported = this.supported_browsers.includes(browser)
    },

    logData() {
      if (this.ivideo_id != undefined && this.player.playing) this.uploadJson()
      timeout = setTimeout(this.logData, upload_interval)
    },

    fetchData() {
      axios
        .get(
          process.env.VUE_APP_BACKEND +
            process.env.VUE_APP_BACKEND_IVIDEO_DETAILS +
            "?ivideo_id=" +
            this.$route.params.id
        )
        .then( (res) => {
          // check browser is a compatible one
          // if not, show error message
          // this.checkBrowser(res.data.user_agent.browser.family)

          console.log(res.data)
          var questions = res.data.ivideo_details.questions.questions;
          this.video_id = res.data.ivideo_details.video_id;
          this.ivideo_id = res.data.ivideo_id;
          this.browserErrorHandlingValue.failsafe_url = res.data.ivideo_details.failsafe;
          this.isFullscreen = false;

          var i = 0;
          for (i = 0; i < questions.length; i++) {
            let ivq = {
              id: i.toString(),
              item: questions[i],
              user_answer: [],
              state: "notshown",
            }
            this.ivideo_questions.push(ivq);

            // set empty answer for each question
            this.answers.push(ivq.user_answer)
          }

          // set the global list of
          // options and time values
          // (this.options, this.times) 
          this.options = res.data.set_of_options
          this.times = res.data.times
        })
        .then( this.dataLoaded = true )
        .then(
          () =>
            (this.player = new Plyr("#player", {
              controls: [
                "play",
                "play-large",
                "progress",
                "current-time",
                "mute",
                "volume",
                "fullscreen",
              ],

              keyboard: {
                focused: false,
                global: false
              },
              
              invertTime: false,
            }))
        )
        .then(() => this.setPlayerProperties(this.player))
        .then(() => this.uploadJson())
        .then(() => this.logData())
        .catch((err) => this.handleQueryError(err));
    },

    handleQueryError(err) {
      if (err.response && err.response.status == 404) {
        this.$router.push('/404-not-found')
      } else { 
        console.log(err)
      }
    },

    // upload responses to S3
    uploadJson() {
      const student_response = {
          'response': {
              'answers': this.answers,
              'options': this.options,
              'watch-time': this.watch_time,
              'source': this.source,
              'retention': this.retention
          },
          'meta': {
              'object_id': this.ivideo_id,
              'student_id': this.student_id
          }
      }
      const json_response = JSON.stringify(student_response)

      fetch(process.env.VUE_APP_BACKEND +
            process.env.VUE_APP_BACKEND_UPDATE_RESPONSE, {method: 'POST', body: json_response,
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          }})
          .then(response => response.json())
          .then(data => console.log(data))
          .catch(err => console.log(err))
    },

    submitAnswer(ivq, answer) {
      // start playing whenever the user submits an answer
      this.player.play()

      // Update state to "answered"
      ivq["state"] = "answered"

      // update answer for this question
      ivq.user_answer = answer

      // TODO: make this better -> not using the
      // benefits of Vue here
      var index = Number(ivq.id)

      // Checking if the object is empty or not.
      // If empty, push the answer. Otherwise don't.
      if(Object.keys(this.answers[index]).length === 0)
        this.answers[index] = answer

      // update response on S3
      this.uploadJson()

      // logging for testing
      console.log("Answer sent");
    },

    skipAnswer() {
      // start playing if the user skips the answer
      this.player.play()

      // update response on S3
      this.uploadJson()

      // logging for testing
      console.log("Answer skipped");
    },

    revise(ivq) {
      // Extract where the current question lies in the list of all questions
      var currQuesIndex = Number(ivq.id)

      // If first question, go to the start of the video
      // else go to the question which came just before the current ones

      // update response on S3
      this.uploadJson()

      this.player.currentTime = (currQuesIndex == 0) ? 0 : this.times[currQuesIndex - 1];
      this.player.play();
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

        // initializing the retention array with zeros
        this.retention = Array(this.player.duration).fill(0);
      });

      player.on('play', event => {
        const instance = event.detail.plyr;
        instance.fullscreen.enter()
      });

      player.on('enterfullscreen', () => {
          this.isFullscreen = true;
          screen.orientation.lock('landscape');
      });

      player.on('exitfullscreen', () => {
        this.isFullscreen = false;
        this.player.pause();
      })

      var prevTime = -1
      player.on("timeupdate", async () => {

        // Update watch time if the video is playing
        if(this.player.playing) {
          this.watch_time += interval_time;
        }

        // Record how many times a particular second was visited
        var currTime = Math.trunc(this.player.currentTime);
        if (currTime != prevTime) {
            this.retention[currTime] += 1;
            prevTime = currTime
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
  beforeUnmount() {
    clearTimeout(timeout)
  }
};

</script>

<style>
@import "https://cdn.plyr.io/3.6.2/plyr.css";

.player_container {
  max-width: 800px;
  margin: auto;
  position: relative;
}

.btn {
    background-color: #4caf50; /* Green */
    border: none;
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    text-decoration: none;
    margin: 2px;
    transition-duration: 0.4s;
    cursor: pointer;
    height: auto;
    align-self: center;
    font-weight: 700;
    font-size: 1rem;
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

.error {
  position: absolute;
  top: 0;
  right: 0;
  text-align: left;
  display: flex;
  justify-content: center;
  bottom: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.8);
}
</style>