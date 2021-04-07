<template>
  <div>
    <!-- skeleton loading -->
    <video-skeleton v-if="!isVideoIdValid"></video-skeleton>
    <div v-else class="flex relative">
      <!-- video player component -->
      <video-player
        :videoId="videoId"
        :plyrConfig="plyrConfig"
        ref="videoPlayer"
        @play="playerPlayed"
        @ready="playerReady"
        @update="videoTimestampUpdated"
        class="w-full"
      ></video-player>
      <!-- item modal component -->
      <item-modal
        class="absolute"
        v-if="showItemModal"
        :selectedItemIndex="currentItemIndex"
        :itemList="items"
      ></item-modal>
    </div>
    <!-- user properties component -->
    <user-properties ref="userProperties"></user-properties>
  </div>
</template>

<script>
import VideoPlayer from "@/components/UI/Player/VideoPlayer";
import VideoSkeleton from "../components/UI/Skeletons/VideoSkeleton.vue";
import UserProperties from "@/services/Config/User.vue";
import PlioAPIService from "@/services/API/Plio.js";
import VideoFunctionalService from "@/services/Functional/Video.js";
import ItemFunctionalService from "@/services/Functional/Item.js";
import { mapState } from "vuex";
import ItemModal from "../components/Player/ItemModal.vue";

// Immediate TODO:
// - show modals for each item
// - pop-up modal at the right time
// - fetch new session
// - update retention, watch-time etc.
// - check if everything looks okay on desktop and on mobile
// - log data function for periodic updates - can be in the form of
// journey - still watching type - can use logic in older code then to reset them
// - get events and session answers from past sessions
// - support for resetting user where they left off in the video
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
  components: { VideoPlayer, VideoSkeleton, UserProperties, ItemModal },
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
    };
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
    createSession() {
      // creates new user-plio session
      console.log(this.items[0].details.id);
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
      var selectedItemIndex = ItemFunctionalService.checkItemPopup(
        timestamp,
        this.itemTimestamps
      );
      console.log(timestamp);
      console.log(this.itemTimestamps);
      if (selectedItemIndex != -1) {
        this.markItemSelected(selectedItemIndex);
      } else this.markNoItemSelected();
    },
    markItemSelected(itemIndex) {
      // mark the item at the given index as selected
      if (itemIndex != null) {
        this.$refs.videoPlayer.player.pause();
        this.currentItemIndex = itemIndex;
      }
    },
    markNoItemSelected() {
      // mark that no item has been currently selected
      this.currentItemIndex = null;
    },
  },
};
</script>
