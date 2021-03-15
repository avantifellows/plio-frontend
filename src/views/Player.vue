<template>
  <div>
    <div class="player_container" v-if="dataLoaded && isBrowserSupported">
      <LoadingSpinner v-if="!hasPlyrLoaded"></LoadingSpinner>

      <div
        id="player"
        class="plyr"
        data-plyr-provider="youtube"
        :data-plyr-embed-id="videoId"
      ></div>
      <div v-for="plioQuestion in plioQuestions" :key="plioQuestion.id.toString()">
        <PlioQuestion
          :plioQuestion="plioQuestion"
          :ref="'position' + plioQuestion.id.toString()"
          :isTutorialComplete="isTutorialComplete"
          :tutorialProgress="tutorialProgress"
          :progressBarInfo="progressBarInfo"
          @answer-submitted="submitAnswer"
          @answer-skipped="skipAnswer"
          @revision-needed="revise"
          @update-journey="updateJourney"
          @question-closed="recordAnswer"
        >
        </PlioQuestion>
      </div>

      <div class="error" v-if="!isFullscreen">
        <button class="btn start-button" @click="startVideo" id="start-button">
          {{ $t("player.start") }}
        </button>
        <start-button-pointer v-if="!isTutorialComplete && !tutorialProgress['start']">
        </start-button-pointer>
      </div>
    </div>
    <Error
      type="browser_error"
      :value="browserErrorHandlingValue"
      v-if="!isBrowserSupported"
    ></Error>
    <user-properties ref="userProperties"></user-properties>
  </div>
</template>

<script>
import Plyr from "plyr";
import PlioQuestion from "../components/PlioQuestion.vue";
import Error from "../views/Error.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import StartButtonPointer from "../components/tutorial/StartButtonPointer.vue";
import UserProperties from "../components/UserProperties.vue";

import PlioService from '@/services/PlioService.js'
import UserService from '@/services/UserService.js'
import { mapState } from 'vuex';

// supports indexOf for older browsers
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (elt /*, from*/) {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = from < 0 ? Math.ceil(from) : Math.floor(from);
    if (from < 0) from += len;

    for (; from < len; from++) {
      if (from in this && this[from] === elt) return from;
    }
    return -1;
  };
}

// The time period in which Plyr timeupdate event repeats
// in milliseconds
const INTERVAL_TIME = 50;

// How precisely should the question pop-up logic
// be measured. Time in milliseconds
const POP_UP_PRECISION_TIME = 500;

// upload to s3 after a fixed interval of time
const UPLOAD_INTERVAL = 45000;
var TIMEOUT = null;

// wait this much time (secs) then show error page
// if browser is not supported
const BROWSER_CHECK_TIME = 10;

// how many seconds to step back (currentTime) when a user comes back to
// a plio for a new session
const STEP_BACK_TIME = 5;

// This buffer time is because currentTime and duration cannot be
// exactly equal. Hence taking a ballpark of 2 seconds
const COMPLETED_BUFFER_TIME = 2;

export default {
  name: "Player",
  props: {
    experiment: {
      default: "",
      type: String,
    },
    id: {
      default: "",
      type:String
    }
  },

  data() {
    return {
      plioQuestions: [],
      dataLoaded: null,
      videoId: null,
      watchTime: 0,
      answers: [],
      times: [],
      plioId: null,
      source: "unknown",
      isFullscreen: true,
      supportedBrowsers: [
        "Chrome",
        "Chrome Mobile",
        "Firefox",
        "Firefox Mobile",
        "Microsoft Edge",
      ],
      isBrowserSupported: true,
      browserErrorHandlingValue: {
        failsafeType: "g-form",
        failsafeUrl: "",
        youtubeId: "",
      },
      journey: [],
      hasVideoPlayed: -1, // Three possible values: -1(don't know), 0(didn't play), 1(played)
      sessionId: 0,
      hasPlyrLoaded: false,
      retention: [],
      previousPlayerTime: 0,
      configs: {},
      isTutorialComplete: false,
      tutorialProgress: {},
      isTutorialUploadRequired: false,
      isModalOnScreen: false,
      componentProperties: {},
      progressBarInfo: {
        config: {},
        progressPercent: 0,
        totalQuestions: 0,
      },
    };
  },
  async created() {
    if (!this.userId) {
      this.$router.push({ 
        name: 'Phone Sign In', 
        params: {id: this.id}  
      });
    }

    console.log("Setting student id to: " + this.userId);

    // load the systemwide component properties
    this.componentProperties = require("../assets/" + "component-properties.json");

    // load plio details
    await this.fetchData();

    document.getElementById("nav").style.display = "none";

    if (this.$route.query.src) {
      this.source = this.$route.query.src;
    }
  },

  components: {
    PlioQuestion,
    Error,
    LoadingSpinner,
    StartButtonPointer,
    UserProperties,
  },

  methods: {
    getCurrentDateTime() {
      /*
      Returns current date-time in format
      YYYY-MM-DD HH:MM:S
      return: string
      */

      var today = new Date();
      var date =
        today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date + " " + time;
      return dateTime;
    },

    waitFor(conditionFunction) {
      const poll = (resolve) => {
        if (conditionFunction()) resolve();
        else setTimeout(() => poll(resolve), 400);
      };
      return new Promise(poll);
    },

    logData() {
      if (this.plioId != undefined && this.player.playing) this.uploadJson();
      TIMEOUT = setTimeout(this.logData, UPLOAD_INTERVAL);
    },

    startVideo() {
      var x = document.getElementById("start-button");
      x.classList.remove("start-button");
      x.classList.add("start-button-active");
      setTimeout(() => {
        this.player.fullscreen.enter();
        this.waitFor(
          () => this.player.fullscreen.active === true && this.isModalOnScreen === false
        ).then(() => this.player.play());
      }, 400);

      this.tutorialProgress["start"] = true;
      this.isTutorialUploadRequired = !this.isTutorialComplete;
    },

    fetchData() {
        PlioService.getPlioDetails(
          this.id,
          this.userId
        )
        .then((res) => {
          console.log(res.data);
          var questions = res.data.plioDetails.questions.questions;
          this.videoId = res.data.videoId;
          this.plioId = res.data.plioId;
          this.browserErrorHandlingValue.failsafeUrl = res.data.plioDetails.failsafe;
          this.browserErrorHandlingValue.youtubeId =
            "https://www.youtube.com/embed/" + this.videoId;
          this.isFullscreen = false;
          this.sessionId = res.data.sessionId;
          this.browser = res.data.userAgent["browser"]["family"];
          this.userConfigs = res.data.userConfigs;
          this.isTutorialComplete = this.userConfigs.tutorial.isComplete;
          this.tutorialProgress = this.userConfigs.tutorial.progress;

          // fetching plio config and verifying it with the component-properties.json
          if ("plioConfig" in res.data && "player" in res.data.plioConfig) {
            this.plioPlayerConfig = res.data.plioConfig["player"];
          } else this.plioPlayerConfig = {};

          for (const [feature, details] of Object.entries(this.componentProperties)) {
            this.plioPlayerConfig[feature] = details;
          }

          this.progressBarInfo["config"] = {};
          if ("progress_bar" in this.plioPlayerConfig)
            this.progressBarInfo["config"] = this.plioPlayerConfig["progress_bar"];

          this.progressBarInfo["progressPercent"] = 0;

          var i = 0;
          for (i = 0; i < questions.length; i++) {
            let plioQuestion = {
              id: i.toString(),
              item: questions[i],
              user_answer: [],
              state: "notshown",
            };
            this.plioQuestions.push(plioQuestion);

            // set empty answer for each question
            this.answers.push(plioQuestion.user_answer);
          }

          this.progressBarInfo["totalQuestions"] = this.plioQuestions.length;

          // set the global list of time values
          this.times = res.data.times;

          // merge the previous session data
          if (res.data.sessionData != "") {
            this.answers = res.data.sessionData.answers;

            questions.forEach((question, index) => {
              this.plioQuestions[index].user_answer = this.answers[index];
              this.plioQuestions[index].state =
                this.answers[index].length == 0 ? "notshown" : "answered";

              if (this.plioQuestions[index].state == "answered") {
                this.progressBarInfo["progressPercent"] += 1;
              }
            });

            this.journey = res.data.sessionData.journey;

            this.previousPlayerTime = 0;
            if (this.journey.length > 0) {
              this.previousPlayerTime = this.journey[this.journey.length - 1][
                "player_time"
              ];
            }

            this.watchTime = res.data.sessionData["watch-time"];
            this.retention = res.data.sessionData.retention;
            if (questions.length > 0) {
              var currCompletion = this.progressBarInfo["progressPercent"];
              this.progressBarInfo["progressPercent"] = Math.ceil(
                (currCompletion / questions.length) * 100
              );
            }
          }
        })
        .then((this.dataLoaded = true))
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
                global: false,
              },

              invertTime: false,
              clickToPlay: false,
            }))
        )
        .then(() => this.setPlayerProperties(this.player))
        .then(() => this.uploadJson())
        .then(() => this.logData())
        .catch((err) => this.handleQueryError(err));
    },

    handleQueryError(err) {
      if (err.response && err.response.status == 404) {
        this.$router.push({ name: '404' });
      } else {
        console.log(err);
      }
    },

    // upload responses to S3
    uploadJson() {
      const student_response = {
        response: {
          answers: this.answers,
          "watch-time": this.watchTime,
          "user-id": this.userId,
          "plio-id": this.plioId,
          "session-id": this.sessionId,
          source: this.source,
          retention: this.retention,
          "has-video-played": this.hasVideoPlayed,
          journey: this.journey,
          experiment: this.experiment,
        },
      };
      const json_response = JSON.stringify(student_response);

      UserService.postUserResponse(json_response) 
      .then((data) => console.log(data))
      .catch((err) => console.log(err));

      if (this.isTutorialUploadRequired) {
        this.userConfigs["tutorial"]["isComplete"] = this.isTutorialComplete;
        this.userConfigs["tutorial"]["progress"] = this.tutorialProgress;

        // update user config remotely and locally
        this.$refs.userProperties.updateUserConfigs(this.userConfigs);

        if (this.isTutorialComplete) this.isTutorialUploadRequired = false;
      }
    },

    updateJourney(logEvent, details = {}) {
      // handle the case when fullscreen has been clicked but Plyr has not
      // yet loaded -> this.player.currentTime = NaN
      var player_time = this.hasPlyrLoaded ? this.player.currentTime : 0;

      this.journey.push({
        event: logEvent,
        details: details,
        system_time: String(this.getCurrentDateTime()),
        player_time: String(player_time),
      });

      if (logEvent == "option-selected") {
        this.tutorialProgress["options"] = true;
        this.isTutorialUploadRequired = true;
      }
    },

    recordAnswer(plioQuestion, answer, newProgressBarInfo) {
      // this function is called when the close button is clicked
      // Update state to "answered"
      plioQuestion["state"] = "answered";

      this.progressBarInfo["progressPercent"] = newProgressBarInfo["progressPercent"];

      this.tutorialProgress["close"] = true;
      this.isTutorialUploadRequired = true;
      this.isTutorialComplete = true;

      // update answer for this question
      plioQuestion.user_answer = answer;

      var currQuesIndex = Number(plioQuestion.id);

      // Checking if the object is empty or not.
      // If empty, push the answer. Otherwise don't.
      if (Object.keys(this.answers[currQuesIndex]).length === 0) {
        this.answers[currQuesIndex] = answer;
      }

      this.updateJourney("question-submitted", {
        question: currQuesIndex,
        option: plioQuestion.item.question.options.indexOf(answer),
      });

      // update response on S3
      this.uploadJson();

      // logging for testing
      console.log("Answer sent");

      // start playing whenever the user submits an answer
      this.player.play();

      this.isModalOnScreen = false;
    },

    submitAnswer() {
      // this function is called when the submit button is clicked
      this.tutorialProgress["submit"] = true;
      this.isTutorialUploadRequired = true;
      this.uploadJson();
    },

    skipAnswer(plioQuestion) {
      var currQuesIndex = Number(plioQuestion.id);

      this.updateJourney("question-skipped", {
        question: currQuesIndex,
      });

      // update response on S3
      this.uploadJson();

      // logging for testing
      console.log("Answer skipped");

      // start playing if the user skips the answer
      this.player.play();
      this.isModalOnScreen = false;
    },

    revise(plioQuestion) {
      // Extract where the current question lies in the list of all questions
      var currQuesIndex = Number(plioQuestion.id);

      this.updateJourney("question-revised", {
        question: currQuesIndex,
      });

      // update response on S3
      this.uploadJson();

      // after revise is clicked, make the user land just next to the marker
      // and not on the marker so that question pops up again
      this.player.currentTime =
        currQuesIndex == 0
          ? 0
          : this.times[currQuesIndex - 1] + POP_UP_PRECISION_TIME / 1000;

      this.player.play();

      // logging for testing
      console.log("Answer revised");
      this.isModalOnScreen = false;
    },

    listenToPlayButtons() {
      var status = this.player.playing ? "played" : "paused";

      this.updateJourney(status);
      this.uploadJson();
    },

    checkBrowserSupport() {
      /* This logic works because for as long as BROWSER_CHECK_TIME,
         the progress bar will stay inactive, so the user will not be
         able to seek forward or backward -> hence player.currentTime
         cannot be changed via user.

         If the video plays or not plays, the user cannot influence it
         (as long as "BROWSER_CHECK_TIME"). */

      if (this.hasVideoPlayed == -1 && this.player.playing) {
        const timeBefore = Math.round(this.player.currentTime * 100) / 100;

        setTimeout(() => {
          const timeAfter = Math.round(this.player.currentTime * 100) / 100;

          if (timeAfter == timeBefore) {
            // browser unsupported -> show error page
            this.isBrowserSupported = false;
            this.hasVideoPlayed = 0;
          } else this.hasVideoPlayed = 1;
          this.uploadJson();

          var plyrProgressBar = document.querySelectorAll(".plyr__progress")[0];
          plyrProgressBar.firstChild.removeAttribute("disabled");
        }, BROWSER_CHECK_TIME * 1000);
      }
    },

    async setPlayerProperties(player) {
      player.on("ready", () => {
        // start playing from 5 seconds before where the user left off in previous session
        if (this.previousPlayerTime > STEP_BACK_TIME) {
          this.player.currentTime = this.previousPlayerTime - STEP_BACK_TIME;
        }

        // start from beginning if video was watched till the end in the last session
        if (this.player.duration - this.previousPlayerTime <= COMPLETED_BUFFER_TIME) {
          this.player.currentTime = 0;
        }

        var plyrProgressBar = document.querySelectorAll(".plyr__progress")[0];
        this.plioQuestions.forEach(function (plioQuestion) {
          var question = plioQuestion.item;
          // Add marker to progress bar
          var marker = document.createElement("SPAN");
          marker.setAttribute("id", "marker");
          marker.classList.add("tooltip");

          if (plioQuestion.state == "answered") {
            marker.classList.add("tooltip-answered");
          }

          var pos_percent = (100 * question.time) / player.duration;
          marker.style.setProperty("left", `${pos_percent}%`);
          plyrProgressBar.appendChild(marker);
        });

        // mark Plyr as loaded
        this.hasPlyrLoaded = true;

        // disabling plyrProgressBar
        if (!this.supportedBrowsers.includes(this.browser))
          plyrProgressBar.firstChild.disabled = true;

        // initializing the retention array with zeros
        if (this.retention.length == 0) {
          this.retention = Array(this.player.duration).fill(0);
        }

        // Adding on-click listeners to the two play buttons
        // one big play button in the middle, and one near the
        // progress bar
        const play_buttons = document.querySelectorAll("[data-plyr='play']");
        play_buttons[0].addEventListener("click", this.listenToPlayButtons, false);

        play_buttons[1].addEventListener("click", this.listenToPlayButtons, false);
      });

      player.on("play", (event) => {
        const instance = event.detail.plyr;

        if (!instance.fullscreen.active) instance.fullscreen.enter();

        if (!this.supportedBrowsers.includes(this.browser)) {
          this.checkBrowserSupport();
        } else {
          this.hasVideoPlayed = 1;
        }
      });

      player.on("enterfullscreen", () => {
        this.isFullscreen = true;
        screen.orientation.lock("landscape");

        this.updateJourney("enter-fullscreen");
        this.uploadJson();
      });

      player.on("seeked", () => {
        this.updateJourney("seeked");
      });

      player.on("exitfullscreen", () => {
        this.isFullscreen = false;
        this.player.pause();

        this.updateJourney("exit-fullscreen");
        this.uploadJson();
      });

      // Keep checking when to pop up the question
      setInterval(() => {
        this.plioQuestions.forEach(async (plioQuestion) => {
          var question = plioQuestion.item;
          var t = question.time;

          if (
            // if the seeker is within "POP_UP_PRECISION_TIME" of the specific question time
            // then fire this logic
            this.player.currentTime >= t &&
            this.player.currentTime < t + POP_UP_PRECISION_TIME / 1000
          ) {
            var id = plioQuestion.id;
            this.$refs["position" + id.toString()].openModal();
            while (!document.querySelector(".modal")) {
              await new Promise((r) => setTimeout(r, 500));
            }
            var modal = document.getElementsByClassName("modal")[0];
            if (modal != undefined) {
              this.player.pause();
              this.isModalOnScreen = true;

              document.getElementsByClassName("plyr")[0].appendChild(modal);

              if (plioQuestion["state"] == "notshown")
                plioQuestion["state"] = "unanswered";
            }
          }
        });
      }, POP_UP_PRECISION_TIME);

      var prevTime = -1;
      player.on("timeupdate", async () => {
        // Update watch time if the video is playing
        if (this.player.playing) {
          this.watchTime += INTERVAL_TIME;
        }

        // Record how many times a particular second was visited
        var currTime = Math.trunc(this.player.currentTime);
        if (currTime != prevTime) {
          this.retention[currTime] += 1;
          prevTime = currTime;
        }
      });
    },
  },
  computed: {
    ...mapState(['userId']),
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
    clearTimeout(TIMEOUT);
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
  font-size: 1.5rem;
}

.start-button {
  margin: 2em;
  box-shadow: -5px 9px #402e0e, -5px 9px #402e0e, -1px 1px #402e0e;
}

.start-button-active {
  background-color: #437044; /* Green */
  box-shadow: -3px 5px #402e0e, -3px 3px #402e0e, -3px 0px #402e0e;
  transform: translate(-4px, 4px);
}

.tooltip {
  background: red;
  border-radius: 3px;
  bottom: 100%;
  padding: 5px 3px;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, 14px);
  z-index: 2;
}

.tooltip-answered {
  background: green;
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
  flex-direction: column;
  align-items: center;
}

.hand-pointer {
  font-size: 4em;
  animation: point 1s ease-in-out infinite alternate;
}

@keyframes point {
  100% {
    transform: translateY(-30px);
  }
}
</style>
