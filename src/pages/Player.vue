<template>
  <div class="bg-gray-200 h-screen p-2 lg:p-5">
    <!-- skeleton loading -->
    <video-skeleton v-if="!isVideoIdValid"></video-skeleton>
    <div v-else class="flex relative shadow-lg">
      <!-- fullscreen button overlay -->
      <div
        v-if="showItemModal && !isFullscreen"
        class="z-50 absolute bp-500:hidden w-full h-full bg-transparent"
      >
        <div class="opacity-90 w-full h-full absolute bg-white"></div>
        <div class="flex w-full h-full">
          <icon-button
            :titleConfig="fullscreenButtonTitleConfig"
            :buttonClass="fullscreenButtonClass"
            @click="goFullscreen"
          ></icon-button>
        </div>
      </div>
      <!-- video player component -->
      <video-player
        :videoId="videoId"
        :plyrConfig="plyrConfig"
        ref="videoPlayer"
        id="videoPlayer"
        :currentTime="currentTimestamp"
        @ready="playerReady"
        @play="playerPlayed"
        @pause="playerPaused"
        @seeked="videoSeeked"
        @update="videoTimestampUpdated"
        @enterfullscreen="playerEntersFullscreen"
        @exitfullscreen="playerExitsFullscreen"
        class="w-full z-0"
      ></video-player>
      <!-- minimize button -->
      <transition name="maximize-btn-transition">
        <icon-button
          v-if="isModalMinimized && showItemModal"
          class="absolute z-20"
          id="maximizeButton"
          :titleConfig="maximizeButtonTitleConfig"
          :buttonClass="maximizeButtonClass"
          @click="maximizeModal"
        >
        </icon-button>
      </transition>
      <!-- transition for minimizing/maximizing item modal -->
      <transition enter-active-class="grow" leave-active-class="shrink">
        <!-- item modal component -->
        <item-modal
          v-if="!isModalMinimized"
          id="modal"
          class="absolute z-10"
          :class="{ hidden: !showItemModal }"
          :selectedItemIndex="currentItemIndex"
          :itemList="items"
          v-model:isFullscreen="isFullscreen"
          v-model:responseList="itemResponses"
          :previewMode="false"
          :isModalMinimized="isModalMinimized"
          :isFullscreen="isFullscreen"
          @skip-question="skipQuestion"
          @proceed-question="proceedQuestion"
          @revise-question="reviseQuestion"
          @submit-question="submitQuestion"
          @option-selected="optionSelected"
          @toggle-minimize="minimizeModal"
        ></item-modal>
      </transition>
    </div>
  </div>
</template>

<script>
import VideoPlayer from "@/components/UI/Player/VideoPlayer";
import VideoSkeleton from "../components/UI/Skeletons/VideoSkeleton.vue";
import PlioAPIService from "@/services/API/Plio.js";
import UserAPIService from "@/services/API/User.js";
import SessionAPIService from "@/services/API/Session.js";
import EventAPIService from "@/services/API/Event.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import ItemFunctionalService from "@/services/Functional/Item.js";
import ItemModal from "../components/Player/ItemModal.vue";
import IconButton from "@/components/UI/Buttons/IconButton.vue";
import { useToast } from "vue-toastification";
import { mapActions, mapGetters } from "vuex";

// difference in seconds between consecutive checks for item pop-up
var POP_UP_CHECKING_FREQUENCY = 0.5;
var POP_UP_PRECISION_TIME = POP_UP_CHECKING_FREQUENCY * 1000;

// The time period in which Plyr timeupdate event repeats
// in seconds
const PLYR_INTERVAL_TIME = 0.05;

// upload data periodically - period in milliseconds
const UPLOAD_INTERVAL = 10000;
var UPLOAD_INTERVAL_TIMEOUT = null;

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

// supports Array.prototype.fill for older browsers
if (!Array.prototype.fill) {
  Object.defineProperty(Array.prototype, "fill", {
    value: function (value) {
      // Steps 1-2.
      if (this == null) {
        throw new TypeError("this is null or not defined");
      }

      var O = Object(this);

      // Steps 3-5.
      var len = O.length >>> 0;

      // Steps 6-7.
      var start = arguments[1];
      var relativeStart = start >> 0;

      // Step 8.
      var k =
        relativeStart < 0
          ? Math.max(len + relativeStart, 0)
          : Math.min(relativeStart, len);

      // Steps 9-10.
      var end = arguments[2];
      var relativeEnd = end === undefined ? len : end >> 0;

      // Step 11.
      var finalValue =
        relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);

      // Step 12.
      while (k < finalValue) {
        O[k] = value;
        k++;
      }

      // Step 13.
      return O;
    },
  });
}

export default {
  components: {
    VideoPlayer,
    VideoSkeleton,
    ItemModal,
    IconButton,
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
        ],

        ratio: "16:7",

        keyboard: {
          focused: false,
          global: false,
        },

        invertTime: false,
      },
      videoId: "", // video Id for the Plio
      source: "unknown", // source from where the plio was accessed - can be passed as param in the plio url
      componentProperties: {}, // properties of the plio player
      items: [], // holds the list of all items for this plio
      itemResponses: [], // holds the responses to each item
      videoSource: "youtube", // source for the video
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
      playerHeight: 0, // height of the player - updated once the player is ready
      lastCheckTimestamp: 0, // time in milliseconds when the last check for item pop-up took place
      isFullscreen: false, // is the player in fullscreen
      currentTimestamp: null, // tracks the current timestamp in the video
      plioDBId: null, // id for this plio in the plio DB table
      sessionDBId: null, // id for this session in the plio DB table
      retention: [], // array to store video retention value
      lastTimestampRetention: null, // last recorded timestamp in the retention array
      toast: useToast(), // use the toast component
      isModalMinimized: false, // whether the item modal is minimized or not
      // styling class for the minimize button
      maximizeButtonClass:
        "bg-primary hover:bg-primary-hover p-1 pl-4 pr-4 sm:p-2 sm:pl-6 sm:pr-6 lg:p-4 lg:pl-6 lg:pr-6 rounded-md shadow-xl disabled:opacity-50 disabled:pointer-events-none",
    };
  },
  watch: {
    isFullscreen(newIsFullscreen) {
      // track the fullscreen status
      if (newIsFullscreen) this.player.fullscreen.enter();
      else this.player.fullscreen.exit();
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
          await this.setAccessToken(response.data.token);
          await this.setActiveWorkspace(this.org);
          thirdPartyAuthPromiseResolve();
        })
        .catch((error) => {
          // if there's some error in the query params,
          // reload the page and remove the auth query params
          // if the user is authenticated -- they will be able to see the plio
          // if the user is not -- they will be asked to log in and then see the plio
          if (error.response.status === 400) {
            this.$router.replace({
              name: "Player",
              params: {
                org: this.org,
                plioId: this.plioId,
              },
            });
            thirdPartyAuthPromiseResolve();
          }
        });
    } else thirdPartyAuthPromiseResolve();

    // wait for the third party auth process to complete and then proceed
    await thirdPartyAuthPromise;
    this.$mixpanel.people.set_once({
      "First Plio Viewed": new Date().toISOString(),
    });
    this.$mixpanel.people.set({
      "Last Plio Viewed": new Date().toISOString(),
    });

    // load the systemwide component properties
    this.componentProperties = require("@/services/Config/" + "Player.json");

    // load plio details
    await this.fetchPlioCreateSession();

    // update source for the plio
    if (this.$route.query.src) {
      this.source = this.$route.query.src;
    }

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
    experiment: {
      default: "",
      type: String,
    },
    plioId: {
      default: "",
      type: String,
    },
    org: {
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
  },
  computed: {
    ...mapGetters("auth", ["isAuthenticated"]),
    isThirdPartyAuth() {
      // if the app needs to authenticate using a third party auth or not
      return this.thirdPartyUniqueId != null && this.thirdPartyApiKey != null;
    },
    currentItemType() {
      // type of the current selected item -
      // eg - question, note etc
      return this.items[this.currentItemIndex].type;
    },
    maximizeButtonTitleConfig() {
      // styling class for the title of minimize button
      return {
        value: this.isModalMinimized
          ? this.$t(`editor.buttons.show_${this.currentItemType}`)
          : this.$t("editor.buttons.show_video"),
        class: "text-white text-md sm:text-base lg:text-xl font-bold",
      };
    },
    isVideoIdValid() {
      // whether the video Id is valid
      return this.videoId != "";
    },
    hasAnyItems() {
      // whether there are any itesm
      return this.items.length != 0;
    },
    isAnyItemActive() {
      // whether any item is currently active
      return this.currentItemIndex != null;
    },
    showItemModal() {
      // whether the item modal needs to be shown
      return this.hasAnyItems && this.isAnyItemActive;
    },
    itemTimestamps() {
      // list of the timestamps for each of the items
      return ItemFunctionalService.getItemTimestamps(this.items);
    },
    hasSessionStarted() {
      // whether the session has been defined and begun
      return this.sessionDBId != null;
    },
    player() {
      // returns the player instance
      return this.$refs.videoPlayer.player;
    },
    fullscreenButtonTitleConfig() {
      // config for the text of the fullscreen toggle button
      return {
        value: this.$t("player.fullscreen.enter"),
        class: "text-white text-lg font-bold",
      };
    },
    fullscreenButtonClass() {
      // class for the fullscreen button
      return `ring-2 ring-red-100 bg-primary-button hover:bg-primary-button-hover p-4 rounded-md shadow-xl place-self-center animate-bounce m-auto`;
    },
  },
  methods: {
    ...mapActions("auth", ["setAccessToken", "setActiveWorkspace"]),
    mountOnFullscreenPlyr(elementToMount) {
      var plyrInstance = document.getElementsByClassName("plyr")[0];
      plyrInstance.insertBefore(elementToMount, plyrInstance.firstChild);
    },
    maximizeModal() {
      // toggle the minimized state of the modal
      this.isModalMinimized = false;
    },
    minimizeModal(positions) {
      // invoked when minimize button is clicked

      // set some CSS variables which tells the animation where the modal should shrink to
      // and where the maximize button should pop up. These variables are defined in `Editor.vue`
      let root = document.documentElement;
      root.style.setProperty("--t-origin-x", positions.centerX + "px");
      root.style.setProperty("--t-origin-y", positions.centerY + "px");
      root.style.setProperty("--maximize-btn-left", positions.leftX + "px");
      root.style.setProperty("--maximize-btn-top", positions.leftY + "px");

      this.isModalMinimized = true;

      // insert the button inside the plyr instance so it shows up in fullscreen mode
      this.$nextTick(() => {
        var maximizeButton = document.getElementById("maximizeButton");
        if (maximizeButton != undefined) this.mountOnFullscreenPlyr(maximizeButton);
      });
    },
    videoSeeked() {
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
    submitQuestion() {
      // invoked when a question response is submitted
      // update the session answer on server
      SessionAPIService.updateSessionAnswer(this.itemResponses[this.currentItemIndex]);
      // create an event for the submit action
      this.createEvent("question_answered", {
        itemIndex: this.currentItemIndex,
        answer: this.itemResponses[this.currentItemIndex].answer,
      });
      // update the marker colors on the player
      this.showItemMarkersOnSlider(this.player);
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
    async fetchPlioCreateSession() {
      // fetches plio details and creates a new session
      await PlioAPIService.getPlio(this.plioId, true)
        .then((plioDetails) => {
          // redirect to 404 if the plio is not published
          if (plioDetails.status != "published") this.$router.replace({ name: "404" });
          this.items = plioDetails.items || [];
          this.plioDBId = plioDetails.plioDBId;
          this.videoId = this.getVideoIDfromURL(plioDetails.videoURL);
        })
        .then(() => this.createSession())
        .then(() => this.logData());
    },
    logData() {
      // periodically logs data to the server
      if (this.hasSessionStarted) {
        // update session data
        this.updateSession();
        // create an event for the user watching the plio
        this.createEvent("watching");
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
    createSession() {
      // creates new user-plio session
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
          var itemResponse = {};
          for (var key of Object.keys(sessionAnswer)) {
            itemResponse[key.replace("_id", "")] = sessionAnswer[key];
          }
          // for mcq items, convert answers to integer
          if (
            this.items[itemIndex].type == "question" &&
            this.items[itemIndex].details["type"] == "mcq"
          ) {
            itemResponse.answer = parseInt(itemResponse.answer);
          }
          this.itemResponses.push(itemResponse);
        });
      });
    },
    updateSession() {
      // update the session data on the server
      var sessionDetails = {
        plio: this.plioDBId,
        watch_time: this.watchTime,
        retention: this.retentionArrayToStr(this.retention),
      };
      return SessionAPIService.updateSession(
        this.sessionDBId,
        sessionDetails
      ).catch((err) => console.log(err));
    },
    retentionStrToArray(retentionStr) {
      // convert retention string to retention array
      return retentionStr.split(",").map((value) => parseInt(value));
    },
    retentionArrayToStr(retentionArray) {
      // convert retention array to retention string
      return retentionArray.join(",");
    },
    setScreenProperties() {
      // sets various properties based on the device screen
      this.playerHeight = document.getElementById("videoPlayer").clientHeight;
    },
    getVideoIDfromURL(videoURL) {
      // gets the video Id from the YouTube URL
      var linkValidation = VideoFunctionalService.isYouTubeVideoLinkValid(videoURL);
      return linkValidation["ID"];
    },
    playerPlayed() {
      // invoked when the play button of the player is clicked
      this.createEvent("played");
    },
    playerPaused() {
      // invoked when the pause button of the player is clicked
      this.createEvent("paused");
    },
    playerReady() {
      // invoked when the player is ready
      this.showItemMarkersOnSlider(this.player);
      this.setScreenProperties();
      this.player.currentTime = this.currentTimestamp;
      this.$mixpanel.track("Visit Player", {
        "Plio UUID": this.plioId,
        "Plio Video Length": this.player.duration || 0,
        "Plio Num Items": this.items.length || 0,
      });
      // Disabling autoplay because of bug - issue #157
      // this.playPlayer();
    },
    showItemMarkersOnSlider(player) {
      // show the markers for items on top of the video slider
      var plyrProgressBar = document.querySelectorAll(".plyr__progress")[0];
      this.items.forEach((item, index) => {
        let existingMarker = document.getElementById(`marker-${index}`);
        if (existingMarker != undefined) plyrProgressBar.removeChild(existingMarker);

        // Add marker to player seek bar
        var newMarker = document.createElement("SPAN");
        newMarker.setAttribute("id", `marker-${index}`);

        // set marker style
        if (this.isItemResponseDone(index)) {
          this.markerClass[0] = "bg-green-600";
        } else this.markerClass[0] = "bg-red-600";

        newMarker.classList.add(...this.markerClass);

        // set marker position
        var positionPercent = (100 * item.time) / player.duration;
        newMarker.style.setProperty("left", `${positionPercent}%`);
        plyrProgressBar.appendChild(newMarker);
      });
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
    isItemMCQ(itemIndex) {
      // whether the given item index is an MCQ question
      return (
        this.items[itemIndex].type == "question" &&
        this.items[itemIndex].details.type == "mcq"
      );
    },
    videoTimestampUpdated(timestamp) {
      // invoked when the current time in the video is updated
      this.checkItemToSelect(timestamp);
      // update watch time
      this.watchTime += PLYR_INTERVAL_TIME;
      this.watchTimeIncrement += PLYR_INTERVAL_TIME;
      // update retention
      var currentTime = Math.trunc(this.player.currentTime);
      if (currentTime != this.lastTimestampRetention) {
        this.retention[currentTime] += 1;
        this.lastTimestampRetention = currentTime;
      }
    },
    checkItemToSelect(timestamp) {
      // checks if an item is to be selected and marks/unmarks accordingly
      if (Math.abs(timestamp - this.lastCheckTimestamp) < POP_UP_CHECKING_FREQUENCY)
        return;
      this.lastCheckTimestamp = timestamp;
      this.isModalMinimized = false;
      this.currentItemIndex = ItemFunctionalService.checkItemPopup(
        timestamp,
        this.itemTimestamps,
        POP_UP_PRECISION_TIME
      );
      if (this.currentItemIndex != null) {
        this.markItemSelected();
        this.createEvent("item_opened", { itemIndex: this.currentItemIndex });
      }
    },
    markItemSelected() {
      // mark the item at the currentItemIndex as selected
      this.pausePlayer();

      // if the video is in fullscreen mode, show the modal on top of it
      var modal = document.getElementById("modal");
      if (modal != undefined) this.mountOnFullscreenPlyr(modal);

      var maximizeButton = document.getElementById("maximizeButton");
      if (maximizeButton != undefined) this.mountOnFullscreenPlyr(maximizeButton);
    },
    playerEntersFullscreen() {
      // invoked when the player enters fullscreen
      this.isFullscreen = true;
      this.createEvent("enter_fullscreen");
    },
    playerExitsFullscreen() {
      // invoked when the player exits fullscreen
      this.isFullscreen = false;
      this.createEvent("exit_fullscreen");
    },
    createEvent(eventType, eventDetails = {}) {
      // create a new event
      if (!this.hasSessionStarted) return;
      // create event only when the session has been initiated
      var eventData = {
        type: eventType,
        details: eventDetails,
        player_time: this.player.currentTime,
        session: this.sessionDBId,
      };
      EventAPIService.createEvent(eventData);
    },
    goFullscreen() {
      this.isFullscreen = true;
    },
  },
};
</script>
