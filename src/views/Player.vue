<template>
  <div> 
    <div class="player_container" v-if="dataLoaded && isBrowserSupported">
      <div
        id="player"
        class="plyr"
        data-plyr-provider="youtube"
        :data-plyr-embed-id="videoId"
      ></div>
      <div v-for="plioQuestion in plioQuestions" :key="plioQuestion.id.toString()" >
        <PlioQuestion :plioQuestion="plioQuestion" :ref="'position' + plioQuestion.id.toString()"
          @answer-submitted="submitAnswer" @answer-skipped="skipAnswer" @revision-needed="revise"
          @update-journey="updateJourney">
        </PlioQuestion>
      </div>

      <div class="error" v-if="!isFullscreen">
        <button 
          class="btn" @click="this.player.fullscreen.enter()">
          Start <br>
          शुरू करें 
        </button>
      </div>
    </div>
    <Error type="browser_error" :value="browserErrorHandlingValue" v-if="!isBrowserSupported"></Error>
  </div>
</template>

<script>
import Plyr from "plyr";
import axios from "axios";
import PlioQuestion from "../components/PlioQuestion.vue";
import Error from "../views/Error.vue";

// supports indexOf for older browsers
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

// The time period in which Plyr timeupdate event repeats
// in milliseconds
var interval_time = 50;

// upload to s3 after a fixed interval of time 
var upload_interval = 45000;
var timeout = null;

// wait this much time (secs) then show error page
// if browser is not supported
var browserCheckTime = 10;

export default {
  name: "Player",

  data() {
    return {
      userId: '',
      plioQuestions: [],
      dataLoaded: null,
      videoId: null,
      watchTime: 0,
      answers: [],
      times: [],
      plioId: null,
      source: 'unknown',
      isFullscreen: true,
      supportedBrowsers: ['Chrome', 'Chrome Mobile', 'Firefox', 'Firefox Mobile', 'Microsoft Edge'],
      isBrowserSupported: true,
      browserErrorHandlingValue: {
        'failsafeType': 'g-form',
        'failsafeUrl': ''
      },
      journey: [],
      hasVideoPlayed: -1,
      sessionId: 1,
      hasPlyrLoaded: false
    };
  },
  async created() {
    if(!localStorage.phone) {
      this.$router.push({path: '/login/' + this.$route.params.id})
    }

    this.userId = localStorage.phone,
    console.log("Setting student id to: " + this.userId)

    // load plio details
    await this.fetchData();

    document.getElementById('nav').style.display = "none";

    if (this.$route.query.src) {
        this.source = this.$route.query.src;
    }
  },

  components: {
    PlioQuestion,
    Error
  },

  methods: {
    getCurrentDateTime(){
      /* 
      Returns current date-time in format
      YYYY-MM-DD HH:MM:S
      return: string
      */
       
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + ' ' + time;
      return dateTime
    },

    logData() {
      if (this.plioId != undefined && this.player.playing) this.uploadJson()
      timeout = setTimeout(this.logData, upload_interval)
    },

    fetchData() {
      axios
        .get(
          process.env.VUE_APP_BACKEND +
            process.env.VUE_APP_BACKEND_PLIO_DETAILS +
            "?plioId=" +
            this.$route.params.id +
            "&userId=" + this.userId
        )
        .then( (res) => {
          console.log(res.data)
          var questions = res.data.plioDetails.questions.questions;
          this.videoId = res.data.videoId;
          this.plioId = res.data.plioId;
          this.browserErrorHandlingValue.failsafeUrl = res.data.plioDetails.failsafe;
          this.isFullscreen = false;
          this.sessionId = res.data.sessionId;
          this.browser = res.data.userAgent['browser']['family'];

          var i = 0;
          for (i = 0; i < questions.length; i++) {
            let plioQuestion = {
              id: i.toString(),
              item: questions[i],
              user_answer: [],
              state: "notshown",
            }
            this.plioQuestions.push(plioQuestion);

            // set empty answer for each question
            this.answers.push(plioQuestion.user_answer)
          }

          // set the global list of time values
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
              clickToPlay: false
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
              'watch-time': this.watchTime,
              'user-id': this.userId,
              'plio-id': this.plioId,
              'session-id': this.sessionId,
              'source': this.source,
              'retention': this.retention,
              'has-video-played': this.hasVideoPlayed,
              'journey': this.journey
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

    updateJourney(logEvent, details = {}) {
        // handle the case when fullscreen has been clicked but Plyr has not
        // yet loaded -> this.player.currentTime = NaN
        var player_time = this.hasPlyrLoaded ? this.player.currentTime : 0

        this.journey.push({
            'event': logEvent,
            'details': details,
            'system_time': String(this.getCurrentDateTime()),
            'player_time': String(player_time)
        })
    },

    submitAnswer(plioQuestion, answer) {
      // start playing whenever the user submits an answer
      this.player.play()

      // Update state to "answered"
      plioQuestion["state"] = "answered"

      // update answer for this question
      plioQuestion.user_answer = answer

      var currQuesIndex = Number(plioQuestion.id)

      // Checking if the object is empty or not.
      // If empty, push the answer. Otherwise don't.
      if(Object.keys(this.answers[currQuesIndex]).length === 0){
        this.answers[currQuesIndex] = answer
      }

      this.updateJourney(
          "question-submitted", {
            'question': currQuesIndex,
            'option': plioQuestion.item.question.options.indexOf(answer)
          })

      // update response on S3
      this.uploadJson()

      // logging for testing
      console.log("Answer sent");
    },

    skipAnswer(plioQuestion) {
      var currQuesIndex = Number(plioQuestion.id)

      // start playing if the user skips the answer
      this.player.play()

      this.updateJourney(
          "question-skipped", {
              'question': currQuesIndex
          })

      // update response on S3
      this.uploadJson()

      // logging for testing
      console.log("Answer skipped");
    },

    revise(plioQuestion) {
      // Extract where the current question lies in the list of all questions
      var currQuesIndex = Number(plioQuestion.id)

      this.updateJourney(
          "question-revised", {
              'question': currQuesIndex
          })

      // update response on S3
      this.uploadJson()

      this.player.currentTime = (currQuesIndex == 0) ? 0 : this.times[currQuesIndex - 1];
      this.player.play();
    },

    listenToPlayButtons(){
      var status = (this.player.playing) ? "played" : "paused"

      this.updateJourney(status)
      this.uploadJson()
    },

    checkBrowserSupport(){
      /* This logic works because for as long as browserCheckTime,
         the progress bar will stay inactive, so the user will not be
         able to seek forward or backward -> hence player.currentTime
         cannot be changed via user.

         If the video plays or not plays, the user cannot influence it
         (as long as "browserCheckTime"). */

        if(this.hasVideoPlayed == -1 && this.player.playing){
          const timeBefore = Math.round(this.player.currentTime * 100) / 100;

          setTimeout(() => {
              const timeAfter = Math.round(this.player.currentTime * 100) / 100;

              if (timeAfter == timeBefore) {
                // browser unsupported -> show error page
                this.isBrowserSupported = false;
                this.hasVideoPlayed = 0;
              }
              else this.hasVideoPlayed = 1;
              this.uploadJson()

              var progressBar = document.querySelectorAll(".plyr__progress")[0]
              progressBar.firstChild.removeAttribute("disabled");

          }, browserCheckTime * 1000);
        }
    },

    async setPlayerProperties(player) {
      player.on("ready", () => {
        var progressBar = document.querySelectorAll(".plyr__progress")[0];
        // var left = progressBar.getBoundingClientRect().left;
        // var right = progressBar.getBoundingClientRect().right;
        this.plioQuestions.forEach(function (plioQuestion) {
          var question = plioQuestion.item;
          // Add marker to progress bar
          var marker = document.createElement("SPAN");
          marker.classList.add("tooltip");
          marker.classList.remove();
          var pos_percent = 100 * question.time / player.duration; 
          marker.style.setProperty("left", `${pos_percent}%`);
          progressBar.appendChild(marker);
          //plioQuestion["marker"] = marker;
        });

        // mark Plyr as loaded
        this.hasPlyrLoaded = true;
        
        // disabling progressbar
        if (!this.supportedBrowsers.includes(this.browser))
          progressBar.firstChild.disabled = true;

        // initializing the retention array with zeros
        this.retention = Array(this.player.duration).fill(0);
        this.submitted = Array(this.plioQuestions.length).fill(0);
        this.skipped = Array(this.plioQuestions.length).fill(0);
        this.revised = Array(this.plioQuestions.length).fill(0);
        
        // Adding on-click listeners to the two play buttons
        // one big play button in the middle, and one near the
        // progress bar
        const play_buttons = document.querySelectorAll("[data-plyr='play']")
        play_buttons[0].addEventListener(
          'click', this.listenToPlayButtons, false
        );

        play_buttons[1].addEventListener(
          'click', this.listenToPlayButtons, false
        );

      });

      player.on('play', event => {
          const instance = event.detail.plyr;
          instance.fullscreen.enter()
          if (!this.supportedBrowsers.includes(this.browser))
              this.checkBrowserSupport();
      });

      player.on('enterfullscreen', () => {
          this.isFullscreen = true;
          screen.orientation.lock('landscape');

          this.updateJourney("enter-fullscreen")
          this.uploadJson()
      });

      player.on('seeked', () => {
        this.updateJourney("seeked")
      });

      player.on('exitfullscreen', () => {
        this.isFullscreen = false;
        this.player.pause();

        this.updateJourney("exit-fullscreen")
        this.uploadJson()
      })

      var prevTime = -1
      player.on("timeupdate", async () => {

        // Update watch time if the video is playing
        if(this.player.playing) {
          this.watchTime += interval_time;
        }

        // Record how many times a particular second was visited
        var currTime = Math.trunc(this.player.currentTime);
        if (currTime != prevTime) {
            this.retention[currTime] += 1;
            prevTime = currTime
        }
        
        this.plioQuestions.forEach(async (plioQuestion) => {

          var question = plioQuestion.item;
          var t = question.time;
          if (
            // "timeupdate" event is called every interval_time millisecond
            this.player.currentTime > t
            && this.player.currentTime < t + (interval_time/1000)
            //&& plioQuestion["state"] == "notshown"
          ) {
            var id = plioQuestion.id
            this.$refs['position' + id.toString()].openModal();
            while (!document.querySelector(".modal")) {
              await new Promise((r) => setTimeout(r, 500));
            }
            var modal = document.getElementsByClassName("modal")[0];
            if (modal != undefined)   {
              document
                .getElementsByClassName("plyr")[0]
                .appendChild(document.getElementsByClassName("modal")[0]);

              if (plioQuestion["state"] == "notshown") plioQuestion["state"] = "unanswered"; 
                //var marker = plioQuestion["marker"];
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