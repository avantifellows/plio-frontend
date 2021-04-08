<template>
  <div class="bg-gray-200 h-screen p-2 lg:p-5">
    <!-- skeleton loading -->
    <video-skeleton v-if="!isVideoIdValid"></video-skeleton>
    <div v-else class="flex relative shadow-lg">
      <!-- video player component -->
      <video-player
        :videoId="videoId"
        :plyrConfig="plyrConfig"
        ref="videoPlayer"
        id="videoPlayer"
        @play="playerPlayed"
        @ready="playerReady"
        @update="videoTimestampUpdated"
        @enterfullscreen="playerEntersFullscreen"
        @exitfullscreen="playerExitsFullscreen"
        :currentTime="currentTimestamp"
        class="w-full z-0"
      ></video-player>
      <!-- item modal component -->
      <item-modal
        id="modal"
        class="absolute z-10"
        :class="{ hidden: !showItemModal }"
        :selectedItemIndex="currentItemIndex"
        :itemList="items"
        :height="playerHeight"
        @close="closeItemModal"
        @revise-question="reviseQuestion"
        v-model:isFullscreen="isFullscreen"
      ></item-modal>
    </div>
  </div>
</template>

<script>
import VideoPlayer from "@/components/UI/Player/VideoPlayer";
import VideoSkeleton from "../components/UI/Skeletons/VideoSkeleton.vue";
import PlioAPIService from "@/services/API/Plio.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import ItemFunctionalService from "@/services/Functional/Item.js";
import { mapState } from "vuex";
import ItemModal from "../components/Player/ItemModal.vue";

// difference in seconds between consecutive checks for item pop-up
var POP_UP_CHECKING_FREQUENCY = 0.5;
var POP_UP_PRECISION_TIME = POP_UP_CHECKING_FREQUENCY * 1000;

// Immediate TODO:
// - fetch new session
// - update retention, watch-time etc.
// - question popping up as event track
// - check if everything looks okay on desktop and on mobile
// - log data function for periodic updates - can be in the form of
// journey - still watching type - can use logic in older code then to reset them
// - get events and session answers from past sessions
// - support for resetting user where they left off in the video based on last event discussed
// - mark already answered question as green

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

export default {
  components: {
    VideoPlayer,
    VideoSkeleton,
    ItemModal,
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
      //   isDataLoaded: false, // whether data has been fetched from the server
      videoId: "", // video Id for the Plio
      source: "unknown", // source from where the plio was accessed - can be passed as param in the plio url
      componentProperties: {}, // properties of the plio player
      // TODO: dummy user ID
      created_by: 1,
      items: [], // holds the list of all items for this plio
      itemResponses: [], // holds the responses to each item
      videoSource: "youtube", // source for the video
      watchTime: 0, // keeps a count of the watch time for the plio by the user
      currentItemIndex: null, // current item being displayed
      markerClass: [
        // class for the item marker displayed on top of the video slider
        "bg-red-500",
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
    };
  },
  watch: {
    isFullscreen(newIsFullscreen) {
      if (newIsFullscreen) this.$refs.videoPlayer.player.fullscreen.enter();
      else this.$refs.videoPlayer.player.fullscreen.exit();
    },
  },
  async created() {
    // redirect to login page if unauthenticated
    if (!this.userId) {
      this.$router.push({
        name: "PhoneSignIn",
        params: { id: this.id },
      });
    }
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
  unmounted() {
    // remove listeners
    window.removeEventListener("resize", this.setScreenProperties);
  },
  props: {
    experiment: {
      default: "",
      type: String,
    },
    id: {
      default: "",
      type: String,
    },
  },
  computed: {
    ...mapState(["userId"]),
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
  },
  methods: {
    reviseQuestion() {
      // after revise is clicked, take the user either to the beginning
      // of the video if the question is the first item else to the end of
      // the previous item
      this.$refs.videoPlayer.player.currentTime =
        this.currentItemIndex == 0
          ? 0
          : this.itemTimestamps[this.currentItemIndex - 1] + POP_UP_PRECISION_TIME / 1000;
      this.playPlayer();
    },
    async fetchPlioCreateSession() {
      // fetches plio details and creates a new session
      await PlioAPIService.getPlio(this.id)
        .then((plioDetails) => {
          this.items = plioDetails.items || [];
          this.videoId = this.getVideoIDfromURL(plioDetails.video_url);
        })
        .then(() => this.createSession())
        .catch((err) => this.handleQueryError(err));
    },
    closeItemModal() {
      // invoked when the modal is to be closed
      this.playPlayer();
    },
    playPlayer() {
      // plays the video player
      this.$refs.videoPlayer.player.play();
    },
    pausePlayer() {
      // pauses the video player
      this.$refs.videoPlayer.player.pause();
    },
    createSession() {
      // creates new user-plio session
      console.log(this.items[0].details.id);
    },
    setScreenProperties() {
      // sets various properties based on the device screen
      this.playerHeight = document.getElementById("videoPlayer").clientHeight;
    },
    handleQueryError(err) {
      // handles error encountered when fetching plio or creating new session
      if (err.response && err.response.status == 404) {
        this.$router.push({ name: "404" });
      } else {
        console.log(err);
      }
    },
    getVideoIDfromURL(videoURL) {
      // gets the video Id from the YouTube URL
      var linkValidation = VideoFunctionalService.isYouTubeVideoLinkValid(videoURL);
      return linkValidation["ID"];
    },
    playerPlayed() {
      // invoked when the play button of the player is clicked
      console.log("here");
    },
    playerReady(player) {
      // invoked when the player is ready
      this.showItemMarkersOnSlider(player);
      this.setScreenProperties();
    },
    showItemMarkersOnSlider(player) {
      // show the markers for items on top of the video slider
      var plyrProgressBar = document.querySelectorAll(".plyr__progress")[0];
      this.items.forEach((item, index) => {
        // Add marker to player seek bar
        var marker = document.createElement("SPAN");
        marker.setAttribute("id", "marker");

        // set marker style
        if (this.isItemResponseDone(index)) {
          this.markerClass[0] = "bg-green-600";
        } else this.markerClass[0] = "bg-red-600";

        marker.classList.add(...this.markerClass);

        // set marker position
        var positionPercent = (100 * item.time) / player.duration;
        marker.style.setProperty("left", `${positionPercent}%`);
        plyrProgressBar.appendChild(marker);
      });
    },
    isItemResponseDone(itemIndex) {
      // whether the response to an item is complete
      console.log(itemIndex);
      return false;
      // TODO: dummy response - update this after session answers has been incorporated
      //   return this.itemResponses[itemIndex] != "";
    },
    videoTimestampUpdated(timestamp) {
      // invoked when the current time in the video is updated
      this.checkItemToSelect(timestamp);
    },
    checkItemToSelect(timestamp) {
      // checks if an item is to be selected and marks/unmarks accordingly
      if (Math.abs(timestamp - this.lastCheckTimestamp) < POP_UP_CHECKING_FREQUENCY)
        return;
      this.lastCheckTimestamp = timestamp;
      this.currentItemIndex = ItemFunctionalService.checkItemPopup(
        timestamp,
        this.itemTimestamps,
        POP_UP_PRECISION_TIME
      );
      if (this.currentItemIndex != null) {
        this.markItemSelected();
      }
    },
    markItemSelected() {
      // mark the item at the currentItemIndex as selected
      this.pausePlayer();

      // if the video is in fullscreen mode, show the modal on top of it
      var modal = document.getElementById("modal");
      if (modal != undefined) {
        document.getElementsByClassName("plyr")[0].appendChild(modal);
      }
    },
    playerEntersFullscreen() {
      // invoked when the player enters fullscreen
      this.isFullscreen = true;
    },
    playerExitsFullscreen() {
      // invoked when the player exits fullscreen
      this.isFullscreen = false;
    },
  },
};
</script>
