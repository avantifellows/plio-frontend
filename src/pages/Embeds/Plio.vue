<template>
  <div :id="plioContainerId">
    <!-- skeleton loading -->
    <video-skeleton v-if="!isPlioLoaded && !previewMode"></video-skeleton>
    <div v-if="isPlioLoaded" class="flex relative shadow-lg" :class="containerClass">
      <!-- video player component -->
      <video-player
        :videoId="videoId"
        :plyrConfig="plyrConfig"
        :id="plioVideoPlayerElementId"
        ref="videoPlayer"
        :currentTime="currentTimestamp"
        @ready="playerReady"
        @initiated="playerInitiated"
        @play="playerPlayed"
        @pause="playerPaused"
        @seeked="videoSeeked"
        @update="videoTimestampUpdated"
        @enterfullscreen="enterPlayerFullscreen"
        @exitfullscreen="exitPlayerFullscreen"
        @buffered="checkAndSetPlayerAspectRatio"
        @playback-ended="popupScorecard"
        class="w-full z-0"
      ></video-player>
      <!-- minimize button -->
      <transition name="maximize-btn-transition">
        <div
          class="absolute z-20 px-6 md:px-8 xl:px-12 flex w-full justify-end p-1 mt-2"
          v-if="isModalMinimized && isItemModalShown"
          id="plioMaximizeButton"
        >
          <icon-button
            :titleConfig="maximizeButtonTitleConfig"
            :buttonClass="maximizeButtonClass"
            @click="maximizeModal"
          >
          </icon-button>
        </div>
      </transition>

      <!-- transition for minimizing/maximizing item modal -->
      <transition enter-active-class="grow" leave-active-class="shrink">
        <!-- item modal component -->
        <item-modal
          v-if="!isModalMinimized"
          :id="plioModalElementId"
          class="absolute z-10"
          :class="{ hidden: !isItemModalShown }"
          :selectedItemIndex="currentItemIndex"
          :itemList="items"
          :itemDetailList="itemDetails"
          :previewMode="false"
          :isModalMinimized="isModalMinimized"
          :isFullscreen="isFullscreen"
          :videoPlayerElementId="plioVideoPlayerElementId"
          v-model:isFullscreen="isFullscreen"
          v-model:responseList="itemResponses"
          :configuration="configuration"
          @skip-question="skipQuestion"
          @proceed-question="proceedQuestion"
          @revise-question="reviseQuestion"
          @submit-question="submitQuestion"
          @option-selected="optionSelected"
          @toggle-minimize="minimizeModal"
          data-test="item-modal"
          ref="plioModal"
        ></item-modal>
      </transition>
      <Scorecard
        id="scorecardmodal"
        class="absolute z-10"
        :class="{ hidden: !isScorecardShown }"
        :metrics="scorecardMetrics"
        :progressPercentage="scorecardProgress"
        :isShown="isScorecardShown"
        :plioTitle="plioTitle"
        :numQuestionsAnswered="numQuestionsAnswered"
        :greeting="$t('player.scorecard.greeting')"
        @restart-video="restartVideo"
        ref="scorecard"
      ></Scorecard>
    </div>
  </div>
</template>

<script>
import VideoPlayer from "@/components/UI/Player/VideoPlayer";
import VideoSkeleton from "@/components/UI/Skeletons/VideoSkeleton.vue";
import Scorecard from "@/components/Items/Scorecard.vue";
import PlioAPIService from "@/services/API/Plio.js";
import UserAPIService from "@/services/API/User.js";
import SessionAPIService from "@/services/API/Session.js";
import EventAPIService from "@/services/API/Event.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import ItemFunctionalService from "@/services/Functional/Item.js";
import ItemModal from "@/components/Player/ItemModal.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import { useToast } from "vue-toastification";
import { mapActions, mapState, mapGetters } from "vuex";
import { resetConfetti } from "@/services/Functional/Utilities/Generic.js";
import SettingsUtilities from "@/services/Functional/Utilities/Settings.js";
import globalDefaultSettings from "@/services/Config/GlobalDefaultSettings.js";

var isEqual = require("deep-eql");
let clonedeep = require("lodash.clonedeep");

// difference in seconds between consecutive checks for item pop-up
var POP_UP_CHECKING_FREQUENCY = 0.5;
var POP_UP_PRECISION_TIME = POP_UP_CHECKING_FREQUENCY * 1000;

// the time period in which Plyr timeupdate event repeats
// in seconds
const PLYR_INTERVAL_TIME = 0.05;

// upload data periodically - period in milliseconds
const UPLOAD_INTERVAL = 20000;
var UPLOAD_INTERVAL_TIMEOUT = null;

// screen width below which the volume bar won't be shown in the player controls
const PLAYER_VOLUME_DISPLAY_WIDTH_THRESHOLD = 640;

export default {
  components: {
    VideoPlayer,
    VideoSkeleton,
    ItemModal,
    IconButton,
    Scorecard,
  },
  data() {
    return {
      plyrConfig: {
        controls: [
          "play",
          "play-large",
          "progress",
          "current-time",
          "mute",
          "volume",
          "fullscreen",
          "settings",
        ],

        keyboard: {
          focused: false,
          global: false,
        },

        clickToPlay: false,

        invertTime: false,
      },
      videoId: "", // video Id for the Plio
      componentProperties: {}, // properties of the plio player
      items: [], // holds the list of all items for this plio
      itemDetails: [], // list of all the items' details created for this plio
      itemResponses: [], // holds the responses to each item
      watchTime: 0, // keeps a count of the watch time in seconds for the plio by the user
      watchTimeIncrement: 0, // maintains the increase in watch time since the last time it was logged
      currentItemIndex: null, // current item being displayed
      markerClass: [
        // class for the item marker displayed on top of the video slider
        "bg-red-600",
        "absolute",
        "z-10",
        "transform",
        "translate",
        "-translate-x-2/4",
        "translate-y-4",
        "py-1.5",
        "px-1",
        "bottom-full",
        "pointer-events-none",
        "rounded-md",
      ],
      scorecardMarkerClass: [
        "absolute",
        "z-10",
        "transform",
        "translate",
        "-translate-x-2/4",
        "translate-y-6",
        "bottom-full",
        "pointer-events-none",
        "text-2xl",
      ],
      lastCheckTimestamp: 0, // time in milliseconds when the last check for item pop-up took place
      isFullscreen: false, // is the player in fullscreen
      currentTimestamp: 0, // tracks the current timestamp in the video
      plioDBId: null, // id for this plio in the plio DB table
      sessionDBId: null, // id for this session in the plio DB table
      retention: [], // array to store video retention value
      lastTimestampRetention: null, // last recorded timestamp in the retention array
      toast: useToast(),
      isModalMinimized: false, // whether the item modal is minimized or not
      // styling class for the maximise button
      maximizeButtonClass:
        "px-3 sm:p-2 sm:px-6 lg:p-4 lg:px-8 bg-primary hover:bg-primary-hover p-1 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none",
      numCorrect: 0, // number of correctly answered questions
      numWrong: 0, // number of wrongly answered questions
      numSkipped: 0, // number of skipped questions
      isScorecardShown: false, // to show the scorecard or not
      plioTitle: "", // title of the plio
      isAspectRatioChecked: false, // whether the check for aspect ratio has been done
      watchingEventDBId: null, // the DB id of the latest 'watching' event for a given session
      plioSettings: null, // stores this plio's settings
      lastAnsweredInteractionIndex: -1, // index of the interaction that was last answered
    };
  },
  watch: {
    isFullscreen(newIsFullscreen) {
      // track the fullscreen status

      if (newIsFullscreen) {
        // trigger player fullscreen enter only if it is not already entered full screen
        // by other modes like player controls or double click on the video.
        if (!this.player.fullscreen.active) {
          this.player.fullscreen.enter();
        }
      } else {
        // trigger player full screen exit only if it is not already exited full screen
        // by other modes like player controls or double click on the video.
        if (this.player.fullscreen.active) {
          this.player.fullscreen.exit();
        }
      }
    },
    isPlioLoaded(value) {
      // emit if a plio has completed loading
      if (value) this.$emit("loaded");
    },
    showItemModal(value) {
      // emit if an item's visibility has been toggled
      this.$emit("item-toggle", value);
    },
    itemResponses: {
      handler(value) {
        // whenever itemResponses is updated, re-render the markers
        // and re-calculate the scorecard metrics
        if (value != undefined && this.player != undefined) {
          this.showItemMarkersOnSlider();
        }
      },
      deep: true,
    },
  },
  async created() {
    // Creating a promise for the third party auth functionality.
    // If the app needs to authenticate via third party, resolve this promise only when all tasks are done
    // and the authenticated user is set.
    // If the app does not need third party auth, resolve the promise instantly.
    // All the remaining code will run only when this promise is resolved.
    let thirdPartyAuthPromiseResolve;
    let thirdPartyAuthPromise = new Promise((resolve) => {
      thirdPartyAuthPromiseResolve = resolve;
    });

    if (this.isThirdPartyAuth) {
      // convert the third party token into Plio's internal token
      // and set the user accordingly
      UserAPIService.generateExternalAuthToken({
        unique_id: this.thirdPartyUniqueId,
        api_key: this.thirdPartyApiKey,
      })
        .then(async (response) => {
          await this.setAccessToken(response.data);
          await this.setActiveWorkspace(this.workspace);
          thirdPartyAuthPromiseResolve();
        })
        .catch((error) => {
          // if there's some error in the query params,
          // reload the page and remove the auth query params
          // if the user is authenticated -- they will be able to see the plio
          // if the user is not -- they will be asked to log in and then see the plio

          // if for some reason the API call didn't go through and there's no response
          // object, then redirect the user to a 404 page
          if (error.response != undefined && error.response.status === 400) {
            this.$router.replace({
              name: "Player",
              params: {
                workspace: this.workspace,
                plioId: this.plioId,
              },
            });
            thirdPartyAuthPromiseResolve();
          } else this.$router.replace({ name: "404" });
        });
    } else thirdPartyAuthPromiseResolve();

    // wait for the third party auth process to complete and then proceed
    await thirdPartyAuthPromise;

    // load plio details
    this.fetchPlioCreateSession();

    // add listener for screen size being changed
    window.addEventListener("resize", this.setScreenProperties);
  },
  beforeUnmount() {
    // remove timeout
    clearTimeout(UPLOAD_INTERVAL_TIMEOUT);
  },
  unmounted() {
    // remove listeners
    window.removeEventListener("resize", this.setScreenProperties);
  },
  props: {
    plioId: {
      default: "",
      type: String,
    },
    workspace: {
      default: "",
      type: String,
    },
    thirdPartyUniqueId: {
      default: null,
      type: String,
    },
    thirdPartyApiKey: {
      default: null,
      type: String,
    },
    /**
     * whether it is being opened in preview mode
     * in which case no sessions would be created
     */
    previewMode: {
      default: false,
      type: Boolean,
    },
    /**
     * custom classes for the plio container
     */
    containerClass: {
      default: "h-screen",
      type: String,
    },
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
    ...mapState("generic", ["windowInnerWidth", "windowInnerHeight"]),
    numItems() {
      return this.items.length;
    },
    isSkipEnabled() {
      // if a custom configuration is provided, then use that otherwise
      // use the global settings
      if (this.configuration != null && this.configuration.has("skipEnabled"))
        return this.configuration.get("skipEnabled").value;
      return this.defaultConfiguration.get("skipEnabled").value;
    },
    defaultConfiguration() {
      return globalDefaultSettings.get("player").children.get("configuration").children;
    },
    configuration() {
      return this.plioSettings.get("player").children.get("configuration").children;
    },
    /**
     * whether player has the correct aspect ratio as desired
     */
    isAspectRatioCorrect() {
      return (
        document
          .getElementById(this.plioContainerId)
          .getElementsByClassName("plyr__video-embed")[0].style.paddingBottom ==
        `${this.getDesiredPlayerAspectRatio}%`
      );
    },
    /**
     * the desired aspect ratio for the player
     */
    getDesiredPlayerAspectRatio() {
      return (100 * this.windowInnerHeight) / this.windowInnerWidth;
    },
    /**
     * id of the DOM element for the main container of the plio
     */
    plioContainerId() {
      return `plio${this.plioId}`;
    },
    /**
     * id of the DOM element for the video player
     */
    plioVideoPlayerElementId() {
      return `plioVideoPlayer${this.plioId}`;
    },
    /**
     * id of the DOM element for the modal
     */
    plioModalElementId() {
      return `plioModal${this.plioId}`;
    },
    /**
     * whether the scorecard is enabled or not
     */
    isScorecardEnabled() {
      return this.items != undefined && this.hasAnyItems;
    },
    /**
     * progress value (0-100) to be passed to the Scorecard component
     */
    scorecardProgress() {
      const totalAttempted = this.numCorrect + this.numWrong;
      if (totalAttempted == 0) return null;
      return (this.numCorrect / totalAttempted) * 100;
    },
    /**
     * defines all the metrics to show in the scorecard here
     */
    scorecardMetrics() {
      return [
        {
          name: this.$t("player.scorecard.metric.description.correct"),
          icon: {
            source: "check.svg",
            class: "text-green-500",
          },
          value: this.numCorrect,
        },
        {
          name: this.$t("player.scorecard.metric.description.wrong"),
          icon: {
            source: "times-solid.svg",
            class: "text-red-500",
          },
          value: this.numWrong,
        },
        {
          name: this.$t("player.scorecard.metric.description.skipped"),
          icon: {
            source: "skip.svg",
            class: "text-yellow-700",
          },
          value: this.numSkipped,
        },
      ];
    },
    /**
     * number of questions that have been answered
     */
    numQuestionsAnswered() {
      return this.numCorrect + this.numWrong;
    },
    /**
     * if the app needs to authenticate using a third party auth or not
     */
    isThirdPartyAuth() {
      return this.thirdPartyUniqueId != null && this.thirdPartyApiKey != null;
    },
    /**
     * type of the current selected item
     * eg - question, note etc
     */
    currentItemType() {
      return this.items[this.currentItemIndex].type;
    },
    /**
     * config for the title of the maximise button
     */
    maximizeButtonTitleConfig() {
      return {
        value: this.isModalMinimized
          ? this.$t(`editor.buttons.show_${this.currentItemType}`)
          : this.$t("editor.buttons.show_video"),
        class: "text-white text-md sm:text-base lg:text-xl font-bold",
      };
    },
    /**
     * whether the plio has been loaded
     */
    isPlioLoaded() {
      return this.videoId != "";
    },
    /**
     * whether there are any items
     */
    hasAnyItems() {
      return this.numItems != 0;
    },
    /**
     * whether any item is currently active
     */
    isAnyItemActive() {
      return this.currentItemIndex != null;
    },
    /**
     * whether the item modal needs to be shown
     */
    isItemModalShown() {
      return this.hasAnyItems && this.isAnyItemActive;
    },
    /**
     * list of the timestamps for each of the items
     */
    itemTimestamps() {
      return ItemFunctionalService.getItemTimestamps(this.items);
    },
    /**
     * whether the session has been defined and begun
     */
    hasSessionStarted() {
      return this.sessionDBId != null;
    },
    /**
     * returns the player instance
     */
    player() {
      return this.$refs.videoPlayer.player;
    },
    /**
     * config for the text of the fullscreen toggle button
     */
    fullscreenButtonTitleConfig() {
      return {
        value: this.$t("player.fullscreen.enter"),
        class: "text-white text-lg font-bold",
      };
    },
    /**
     * class for the fullscreen button
     */
    fullscreenButtonClass() {
      return `ring-2 ring-red-100 bg-primary hover:bg-primary-hover p-4 rounded-md shadow-xl place-self-center animate-bounce m-auto`;
    },
  },
  methods: {
    ...mapActions("auth", ["setAccessToken", "setActiveWorkspace"]),

    /**
     * sets various properties based on the screen size
     */
    setScreenProperties() {
      this.setPlayerAspectRatio();
      this.setPlayerVolumeVisibility();
    },
    /**
     * hides the volume control bar when the screen size is less than the threshold
     */
    setPlayerVolumeVisibility() {
      let plyrInstance = document.getElementById(this.plioContainerId);
      let plyrVolumeElement = plyrInstance.getElementsByClassName("plyr__volume")[0];
      if (plyrVolumeElement == undefined) return;
      if (plyrInstance.clientWidth < PLAYER_VOLUME_DISPLAY_WIDTH_THRESHOLD) {
        plyrVolumeElement.style.display = "none";
      } else {
        plyrVolumeElement.style.display = "flex";
      }
    },
    /**
     * sets the aspect ratio based on the current window height and width
     * to cover the full screen
     */
    setPlayerAspectRatio() {
      /**
       * refer to this comment from the creator of plyr on how he
       * handles responsiveness: https://github.com/sampotts/plyr/issues/339#issuecomment-287603966
       * the solution below is just generalizing what he had done
       */
      const plyrElement = document
        .getElementById(this.plioContainerId) // to ensure that only this plio instance is affected and not other plyr instances
        .getElementsByClassName("plyr__video-embed")[0];
      if (plyrElement != undefined)
        plyrElement.style.paddingBottom = `${this.getDesiredPlayerAspectRatio}%`;
    },
    /**
     * checks whether the correct aspect ratio has been set; if not,
     * sets the aspect ratio to the correct value
     */
    checkAndSetPlayerAspectRatio() {
      if (!this.isAspectRatioChecked && !this.isAspectRatioCorrect) {
        this.setPlayerAspectRatio();
        this.isAspectRatioChecked = true;
      }
    },
    /**
     * Show the scorecard on top of the player
     */
    popupScorecard() {
      if (this.checkMovingToTimestampAllowed(this.player.duration) != null) return;
      if (!this.isScorecardShown) {
        this.isScorecardShown = true;
        var scorecardModal = document.getElementById("scorecardmodal");
        if (scorecardModal != undefined) this.mountOnFullscreenPlyr(scorecardModal);
      }
    },
    /**
     * Checks whether the item at the provided itemIndex is a subjective question
     * and if the user has answered the question or not
     * @param {Number} itemIndex - The index of the item to be checked
     * @param {String, Number, Object} userAnswer - User's answer to that item
     */
    isSubjectiveQuestionAnswered(itemIndex, userAnswer) {
      return (
        this.isItemSubjectiveQuestion(itemIndex) &&
        userAnswer != null &&
        userAnswer.trim() != ""
      );
    },
    /**
     * Update the number of correct answers, wrong answers and skipped items
     * @param  {Number} itemIndex -  The index of the item to be considered for the calculation
     * @param  {String, Number, Object} userAnswer - User's answer to that item
     */
    updateNumCorrectWrongSkipped(itemIndex, userAnswer) {
      if (this.isItemMCQ(itemIndex) && !isNaN(userAnswer)) {
        const correctAnswer = this.itemDetails[itemIndex].correct_answer;
        userAnswer == correctAnswer ? (this.numCorrect += 1) : (this.numWrong += 1);
        // reduce numSkipped by 1 if numCorrect or numWrong increases
        this.numSkipped -= 1;
      } else if (
        this.isItemCheckboxQuestion(itemIndex) &&
        userAnswer != null &&
        userAnswer.length > 0
      ) {
        // for checkbox questions, check if the answers match exactly
        const correctAnswer = this.itemDetails[itemIndex].correct_answer;

        isEqual(userAnswer, correctAnswer)
          ? (this.numCorrect += 1)
          : (this.numWrong += 1);
        this.numSkipped -= 1;
      } else if (this.isSubjectiveQuestionAnswered(itemIndex, userAnswer)) {
        // for subjective questions, as long as the viewer has given any answer
        // their response is considered correct
        this.numCorrect += 1;
        this.numSkipped -= 1;
      }
    },
    /**
     * Calculate the scorecard metrics
     * @param {Number} [itemIndex = null] - If null, iterate through all items else just consider the provided item
     * @param {Number} [userAnswer = null] - the response given by the user corresponding to the item
     */
    calculateScorecardMetrics(itemIndex = null, userAnswer = null) {
      if (itemIndex == null) {
        this.itemResponses.forEach((itemResponse, itemIndex) => {
          this.updateNumCorrectWrongSkipped(itemIndex, itemResponse.answer);
        }, this);
      } else {
        this.updateNumCorrectWrongSkipped(itemIndex, userAnswer);
      }
    },
    /**
     * remove the scorecard, restart the video and remove the confetti
     */
    restartVideo() {
      this.isScorecardShown = false;
      this.player.restart();
      resetConfetti();
    },
    mountOnFullscreenPlyr(elementToMount) {
      var plyrInstance = document
        .getElementById(this.plioContainerId)
        .getElementsByClassName("plyr")[0];
      plyrInstance.insertBefore(elementToMount, plyrInstance.firstChild);
    },
    maximizeModal() {
      // toggle the minimized state of the modal
      this.isModalMinimized = false;
    },
    minimizeModal(positions) {
      // invoked when minimize button is clicked
      this.isModalMinimized = true;

      // set some CSS variables which tells the animation where the modal should shrink to
      // and where the maximize button should pop up. These variables are defined in `Editor.vue`
      let root = document.documentElement;
      root.style.setProperty("--t-origin-x", positions.centerX + "px");
      root.style.setProperty("--t-origin-y", positions.centerY + "px");

      // insert the button inside the plyr instance so that it shows up in fullscreen mode
      this.$nextTick(() => {
        let maximizeButton = document.getElementById("plioMaximizeButton");
        if (maximizeButton != undefined) this.mountOnFullscreenPlyr(maximizeButton);
      });
    },
    checkMovingToTimestampAllowed(timestamp) {
      if (!this.isSkipEnabled && this.lastAnsweredInteractionIndex < this.numItems - 1) {
        const firstUnansweredInteraction = this.items[
          this.lastAnsweredInteractionIndex + 1
        ];
        if (timestamp > firstUnansweredInteraction.time)
          return firstUnansweredInteraction;
      }
    },
    videoSeeked() {
      const firstUnansweredInteraction = this.checkMovingToTimestampAllowed(
        this.player.currentTime
      );
      if (firstUnansweredInteraction != null) {
        this.setPlayerTime(firstUnansweredInteraction.time - POP_UP_CHECKING_FREQUENCY);
        setTimeout(() => {
          this.toast.error(this.$t("toast.player.cannot_skip_interaction"), {
            id: "internetLostToast",
            position: "bottom-center",
          });
        }, 500);
        return;
      }
      // invoked when a seek operation ends
      this.createEvent("video_seeked", { currentTime: this.player.currentTime });
    },
    optionSelected(optionIndex) {
      // invoked when an option of a question is selected
      this.createEvent("option_selected", {
        itemIndex: this.currentItemIndex,
        optionIndex: optionIndex,
      });
    },
    reviseQuestion() {
      // after revise is clicked, take the user either to the beginning
      // of the video if the question is the first item else to the end of
      // the previous item
      this.player.currentTime =
        this.currentItemIndex == 0
          ? 0
          : this.itemTimestamps[this.currentItemIndex - 1] + POP_UP_PRECISION_TIME / 1000;
      // create an event for the revise action
      this.createEvent("question_revised", { itemIndex: this.currentItemIndex });
      this.closeItemModal();
    },
    /**
     * saves the answer to the question at the current index
     */
    submitQuestion() {
      let itemResponse = this.itemResponses[this.currentItemIndex];

      /**
       * update the session answer on server if the user is authenticated
       * and the plio is not opened in preview mode
       */
      if (this.isAuthenticated && !this.previewMode) {
        SessionAPIService.updateSessionAnswer(itemResponse);
        // create an event for the submit action
        this.createEvent("question_answered", {
          itemIndex: this.currentItemIndex,
          answer: itemResponse.answer,
        });
      }

      this.lastAnsweredInteractionIndex = clonedeep(this.currentItemIndex);

      // update the marker colors on the player
      this.showItemMarkersOnSlider();

      // recalculate the scorecard metrics
      this.calculateScorecardMetrics(this.currentItemIndex, itemResponse.answer);
    },
    skipQuestion() {
      // invoked when the user skips the question
      this.closeItemModal();
      this.createEvent("question_skipped", { itemIndex: this.currentItemIndex });
    },
    proceedQuestion() {
      // invoked when the user has answered the question and wishes to proceed
      this.closeItemModal();
      this.createEvent("question_proceed", { itemIndex: this.currentItemIndex });
    },
    /**
     * fetches plio details and creates a new session
     */
    fetchPlioCreateSession() {
      PlioAPIService.getPlio(this.plioId, true)
        .then((plioDetails) => {
          /**
           * redirect to 404 if the plio is not published
           * and the plio is not opened in preview mode
           */
          if (plioDetails.status != "published" && !this.previewMode)
            this.$router.replace({ name: "404" });
          this.items = plioDetails.items || [];
          this.itemDetails = plioDetails.itemDetails || [];
          // setting numSkipped to number of items. This value will keep reducing
          // as numCorrect and numWrong are calculated
          this.numSkipped = this.numItems;
          this.plioDBId = plioDetails.plioDBId;
          this.videoId = this.getVideoIDfromURL(plioDetails.videoURL);
          this.plioTitle = plioDetails.plioTitle;
          this.plioSettings = SettingsUtilities.setPlioSettings(plioDetails.config);
        })
        .then(() => this.createSession())
        .then(() => this.logData());
    },
    /**
     * periodically logs data to the server
     */
    logData() {
      /**
       * do not log data if the user is not authenticated
       * or if the plio is opened in preview mode
       */
      if (!this.isAuthenticated || this.previewMode) return;

      if (this.hasSessionStarted) {
        // update session data
        this.updateSession();
        // if a 'watching' event exists for the current session, update that event
        // else create a new event
        if (this.watchingEventDBId == null) this.createEvent("watching");
        else this.updateEvent("watching", this.watchingEventDBId);

        this.$mixpanel.people.increment(
          "Total Watch Time",
          this.watchTimeIncrement.toFixed(2)
        );
        this.watchTimeIncrement = 0;
      }
      UPLOAD_INTERVAL_TIMEOUT = setTimeout(this.logData, UPLOAD_INTERVAL);
    },
    closeItemModal() {
      // invoked when the modal is to be closed
      this.currentItemIndex = null;
      this.playPlayer();
    },
    playPlayer() {
      // plays the video player
      this.player.play();
    },
    pausePlayer() {
      // pauses the video player
      this.player.pause();
    },
    /**
     * creates new user-plio session
     */
    createSession() {
      /**
       * do not create a session if a user is not authenticated
       * or if the plio is opened in preview mode
       */
      if (!this.isAuthenticated || this.previewMode) {
        // initiate itemResponses as an empty set of answers
        this.items.forEach((_, itemIndex) => {
          if (this.isItemMCQ(itemIndex)) {
            this.itemResponses.push({
              answer: NaN,
            });
          } else {
            this.itemResponses.push({
              answer: null,
            });
          }
        });
        return;
      }

      SessionAPIService.createSession(this.plioDBId).then((sessionDetails) => {
        this.sessionDBId = sessionDetails.id;
        // reset the user to where they left off if they are returning
        if (sessionDetails.last_event != null) {
          this.currentTimestamp = sessionDetails.last_event.player_time;
        }

        // if this is the first session for this plio-user combination
        // increment the number of plios watched by this user
        if (sessionDetails.is_first) {
          this.$mixpanel.people.increment("Total Plios Viewed");
        }

        // handle retention array
        this.retention = this.retentionStrToArray(sessionDetails.retention);

        // set watch time
        this.watchTime = sessionDetails.watch_time;

        // set item responses
        sessionDetails.session_answers.forEach((sessionAnswer, itemIndex) => {
          // removing the _id in keys like session_id, question_id
          // so that we can directly update the answers without having to
          // create another dictionary every time we want to upload
          let itemResponse = {};
          for (let key of Object.keys(sessionAnswer)) {
            itemResponse[key.replace("_id", "")] = sessionAnswer[key];
          }
          // for mcq items, convert answers to integer
          if (this.isItemMCQ(itemIndex)) {
            itemResponse.answer = parseInt(itemResponse.answer);
          }
          if (
            itemResponse.answer != null &&
            !isNaN(itemResponse.answer) &&
            !this.isSkipEnabled
          ) {
            this.lastAnsweredInteractionIndex = itemIndex;
          }
          this.itemResponses.push(itemResponse);
        });
        if (!this.isSkipEnabled) {
          const firstUnansweredInteraction = this.checkMovingToTimestampAllowed(
            this.currentTimestamp
          );
          if (firstUnansweredInteraction != null) {
            this.currentTimestamp =
              firstUnansweredInteraction.time - POP_UP_CHECKING_FREQUENCY;
          }
        }
        // once itemResponses is full, calculate all the scorecard metrics
        this.calculateScorecardMetrics();
      });
    },
    /**
     * updates the session data on the server
     */
    updateSession() {
      /**
       * do not try updating the session if the user is not authenticated
       * or if the plio is opened in preview mode
       */
      if (!this.isAuthenticated || this.previewMode) return;

      return SessionAPIService.updateSession(this.sessionDBId, {
        plio: this.plioDBId,
        watch_time: this.watchTime,
        retention: this.retentionArrayToStr(this.retention),
      }).catch((err) => console.log(err));
    },
    retentionStrToArray(retentionStr) {
      // convert retention string to retention array
      return retentionStr.split(",").map((value) => parseInt(value));
    },
    retentionArrayToStr(retentionArray) {
      // convert retention array to retention string
      return retentionArray.join(",");
    },
    getVideoIDfromURL(videoURL) {
      // gets the video Id from the YouTube URL
      let linkValidation = VideoFunctionalService.isYouTubeVideoLinkValid(videoURL);
      return linkValidation["ID"];
    },
    playerPlayed() {
      // invoked when the play button of the player is clicked
      if (this.isScorecardShown) {
        /**
         * prevents the video from playing while the
         * scorecard is being shown
         */
        this.pausePlayer();
        return;
      }
      this.createEvent("played");
    },
    playerPaused() {
      // invoked when the pause button of the player is clicked
      this.createEvent("paused");
    },
    playerInitiated() {
      // sets the aspect ratio while the player is getting ready
      this.setPlayerAspectRatio();
      this.$emit("initiated");
    },
    /**
     * sets the current time of the player to the given time
     * @param {Number} timestamp
     */
    setPlayerTime(timestamp) {
      this.player.currentTime = timestamp;
    },
    playerReady() {
      // invoked when the player is ready
      this.showItemMarkersOnSlider();
      // only show the scorecard when items are present in the plio
      if (this.isScorecardEnabled) this.showScorecardMarkerOnSlider();
      this.setPlayerTime(this.currentTimestamp);
      this.$mixpanel.track("Visit Player", {
        "Plio UUID": this.plioId,
        "Plio Video Length": this.player.duration || 0,
        "Plio Num Items": this.numItems || 0,
      });
      // sets various properties based on the screen size
      this.setScreenProperties();

      // disabling autoplay because of bug - issue #157
      // this.playPlayer();
    },
    /**
     * Places the given marker at a defined position on the plyr progress bar and sets its custom style classes
     * @param {Object} marker - The HTML element that needs to be placed on the progress bar
     * @param {Array} classList - An array of tailwind classes
     * @param {Number} positionPercent - By what % from the left should the marker be placed
     */
    placeMarkerOnSlider(marker, classList, positionPercent) {
      let plyrProgressBar = document.querySelectorAll(".plyr__progress")[0];
      if (plyrProgressBar != undefined) {
        marker.classList.add(...classList);
        marker.style.setProperty("left", `${positionPercent}%`);
        plyrProgressBar.appendChild(marker);
      }
    },
    /**
     * Removes the given marker from the plyr progress bar
     * @param {Object} marker - The HTML element that needs to be removed from the progress bar
     */
    removeMarkerOnSlider(marker) {
      var plyrProgressBar = document.querySelectorAll(".plyr__progress")[0];
      if (plyrProgressBar != undefined) {
        plyrProgressBar.removeChild(marker);
      }
    },
    /**
     * Place the markers for items on the plyr progress bar
     * @param {Object} player - The instance of plyr
     */
    showItemMarkersOnSlider() {
      this.items.forEach((item, index) => {
        let existingMarker = document.getElementById(`plioModalMarker-${index}`);
        if (existingMarker != undefined) this.removeMarkerOnSlider(existingMarker);

        // add marker to player seek bar
        let newMarker = document.createElement("SPAN");
        newMarker.setAttribute("id", `plioModalMarker-${index}`);

        // set marker style and position
        if (this.isItemResponseDone(index)) {
          this.markerClass[0] = "bg-green-600";
        } else this.markerClass[0] = "bg-red-600";

        let positionPercent = (100 * item.time) / this.player.duration;

        this.placeMarkerOnSlider(newMarker, this.markerClass, positionPercent);
      });
    },
    /**
     * Place the marker emoji for scorecard on the plyr progress bar
     */
    showScorecardMarkerOnSlider() {
      // add marker to player seek bar
      let newMarker = document.createElement("p");
      newMarker.setAttribute("id", `plioScorecardMarker`);

      // what the marker should look like - trophy cup emoji
      newMarker.innerText = "🏆";

      // set marker position

      this.placeMarkerOnSlider(newMarker, this.scorecardMarkerClass, 100);
    },
    isItemResponseDone(itemIndex) {
      // whether the response to an item is complete
      if (this.itemResponses && this.itemResponses[itemIndex]) {
        if (this.itemResponses[itemIndex].answer == null) return false;
        if (this.isItemMCQ(itemIndex))
          return !isNaN(this.itemResponses[itemIndex].answer);
        return true;
      }
      return false;
    },
    /**
     * @param {Number} itemIndex - index of an item in the items array
     */
    isItemMCQ(itemIndex) {
      return this.isItemQuestion(itemIndex) && this.itemDetails[itemIndex].type == "mcq";
    },
    /**
     * @param {Number} itemIndex - index of an item in the items array
     */
    isItemCheckboxQuestion(itemIndex) {
      return (
        this.isItemQuestion(itemIndex) && this.itemDetails[itemIndex].type == "checkbox"
      );
    },
    /**
     * @param {Number} itemIndex - index of an item in the items array
     */
    isItemSubjectiveQuestion(itemIndex) {
      return (
        this.isItemQuestion(itemIndex) && this.itemDetails[itemIndex].type == "subjective"
      );
    },
    /**
     * @param {Number} itemIndex - index of an item in the items array
     */
    isItemQuestion(itemIndex) {
      return this.items[itemIndex].type == "question";
    },
    /**
     * invoked when the current time in the video is updated
     */
    videoTimestampUpdated(timestamp) {
      // check if popups should be shown at the given timestamp or not
      this.checkForPopups(timestamp);

      // update watch time
      this.watchTime += PLYR_INTERVAL_TIME;
      this.watchTimeIncrement += PLYR_INTERVAL_TIME;
      // update retention if the array is defined
      let currentTime = Math.trunc(this.player.currentTime);
      if (currentTime != this.lastTimestampRetention && this.retention.length) {
        this.retention[currentTime] += 1;
        this.lastTimestampRetention = currentTime;
      }
    },
    /**
     * Check if any item or scorecard needs to popup at the given timestamp
     * @param {Number} timestamp - The player's current timestamp in seconds
     */
    checkForPopups(timestamp) {
      if (Math.abs(timestamp - this.lastCheckTimestamp) < POP_UP_CHECKING_FREQUENCY)
        return;
      this.lastCheckTimestamp = timestamp;
      if (!this.isAspectRatioChecked) this.checkAndSetPlayerAspectRatio();

      const itemIndex = this.checkForItemPopup(timestamp);
      if (itemIndex != null) {
        this.currentItemIndex = itemIndex;
        this.markItemSelected();
        this.createEvent("item_opened", { itemIndex: this.currentItemIndex });
      }
    },
    /**
     * checks if an item is to be selected and marks/unmarks accordingly
     * @param {Number} timestamp - The player's current timestamp in seconds
     */
    checkForItemPopup(timestamp) {
      this.isModalMinimized = false;
      return ItemFunctionalService.checkItemPopup(
        timestamp,
        this.itemTimestamps,
        POP_UP_PRECISION_TIME
      );
    },
    markItemSelected() {
      // mark the item at the currentItemIndex as selected
      this.pausePlayer();

      // if the video is in fullscreen mode, show the modal on top of it
      let modal = document.getElementById(this.plioModalElementId);
      if (modal != undefined) this.mountOnFullscreenPlyr(modal);

      let maximizeButton = document.getElementById("plioMaximizeButton");
      if (maximizeButton != undefined) this.mountOnFullscreenPlyr(maximizeButton);
    },
    enterPlayerFullscreen() {
      // sets the player to fullscreen
      this.isFullscreen = true;
      this.createEvent("enter_fullscreen");
    },
    exitPlayerFullscreen() {
      // unsets the player from fullscreen
      this.isFullscreen = false;
      this.createEvent("exit_fullscreen");
      this.setPlayerAspectRatio();
    },
    /**
     * creates a new event
     * @param {String} eventType - The type of event that needs to be logged
     * @param {Object} eventDetails - details of the event
     */
    async createEvent(eventType, eventDetails = {}) {
      /**
       * do not create an event if the session has not started
       * or the user is not authenticated or if the plio is opened
       * in preview mode
       */
      if (!this.hasSessionStarted || !this.isAuthenticated || this.previewMode) return;
      let response = await EventAPIService.createEvent({
        type: eventType,
        details: eventDetails,
        player_time: this.player.currentTime != null ? this.player.currentTime : 0,
        session: this.sessionDBId,
      });
      if (eventType == "watching") this.watchingEventDBId = response.id;
    },
    /**
     * Updates an event
     * @param {String} eventType - The type of event that needs to be logged
     * @param {Number} eventDBId - The id of the event instance which needs to be updated
     * @param {Object} eventDetails - details of the event
     */
    updateEvent(eventType, eventDBId, eventDetails = {}) {
      EventAPIService.updateEvent(eventDBId, {
        type: eventType,
        details: eventDetails,
        player_time: this.player.currentTime != null ? this.player.currentTime : 0,
        session: this.sessionDBId,
      });
    },
    goFullscreen() {
      this.isFullscreen = true;
    },
  },
  emits: ["initiated", "loaded", "item-toggle"],
};
</script>

<style lang="scss">
.maximize-btn-transition-leave {
  animation: linear 0.1s;
}

@mixin modalScale($scaleFactor) {
  transform: scale($scaleFactor);
  transform-origin: var(--t-origin-x) var(--t-origin-y);
}

@keyframes shrink {
  1% {
    @include modalScale(0.9);
  }
  10% {
    @include modalScale(0.8);
  }
  20% {
    @include modalScale(0.7);
  }
  30% {
    @include modalScale(0.6);
  }
  40% {
    @include modalScale(0.5);
  }
  50% {
    @include modalScale(0.4);
  }
  60% {
    @include modalScale(0.3);
  }
  70% {
    @include modalScale(0.2);
  }
  80% {
    @include modalScale(0.1);
  }
  90% {
    @include modalScale(0.07);
  }
  100% {
    @include modalScale(0.03);
  }
}

@keyframes grow {
  0% {
    @include modalScale(0);
  }
  1% {
    @include modalScale(0.03);
  }
  10% {
    @include modalScale(0.07);
  }
  20% {
    @include modalScale(0.1);
  }
  30% {
    @include modalScale(0.2);
  }
  40% {
    @include modalScale(0.3);
  }
  50% {
    @include modalScale(0.4);
  }
  60% {
    @include modalScale(0.5);
  }
  70% {
    @include modalScale(0.6);
  }
  80% {
    @include modalScale(0.7);
  }
  90% {
    @include modalScale(0.8);
  }
  100% {
    @include modalScale(0.9);
  }
}

.shrink {
  animation: shrink 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.grow {
  animation: grow 0.1s ease-in;
}
</style>
