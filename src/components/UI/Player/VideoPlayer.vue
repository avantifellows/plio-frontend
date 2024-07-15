<template>
  <div>
    <!--- plyr instance -->
    <div
      id="player"
      data-plyr-provider="youtube"
      :data-plyr-embed-id="videoId"
      class="w-full"
      data-test="player"
    ></div>
  </div>
</template>

<script>
import Plyr from "plyr";

export default {
  data() {
    return {
      player: null,

      // an interval which keeps trying to find a particular div which shows time on the plyr embed.
      timeDivFindingInterval: null,

      // the div which shows time on the plyr embed
      timeDiv: null,
    };
  },
  props: {
    plyrConfig: {
      default: () => {},
      type: Object,
    },
    videoId: {
      default: "",
      type: String,
    },
    currentTime: {
      default: 0,
      type: Number,
    },
  },
  created() {
    // start the player
    this.$nextTick(() => {
      if (this.isVideoIdValid) {
        this.initiatePlayer();
        this.$emit("initiated");
      }
    });

    // find the div with class `plyr__controls__item plyr__time--current plyr__time` and save it once found.
    // keep trying in an interval and once found, store it in a variable and clear the interval
    this.timeDivFindingInterval = setInterval(() => {
      var timeDiv = document.querySelector(
        ".plyr__controls__item.plyr__time--current.plyr__time"
      );
      if (timeDiv != null) {
        this.timeDiv = timeDiv;
        clearInterval(this.timeDivFindingInterval);
      }
    }, 500);
  },
  watch: {
    currentTime(newTime) {
      // update player time if currentTime is changed
      if (this.player != undefined) this.player.currentTime = newTime;
    },
    videoId() {
      if (this.player == undefined) {
        // initiate the player when a new valid videoId is given
        this.initiatePlayer();
      } else {
        // replace the plyr instance with the new video Id
        document
          .getElementById("player")
          .setAttribute("data-plyr-embed-id", this.videoId);
        // reinitiate player
        this.$nextTick(() => {
          this.initiatePlayer();
        });
      }
    },
  },
  methods: {
    /**
     * creates a new instance of plyr and sets its properties
     */
    initiatePlayer() {
      this.player = this.createPlayer();
      this.setPlayerProperties(this.player);
    },
    /**
     * creates a new instance of plyr
     */
    createPlayer() {
      return new Plyr("#player", this.plyrConfig);
    },
    /**
     * sets the properties of the player
     */
    setPlayerProperties(player) {
      player.on("timeupdate", this.playerTimeUpdated);
      player.on("ready", this.playerReady);
      player.on("play", this.playerPlayed);
      player.on("pause", this.playerPaused);
      player.on("enterfullscreen", this.enteredFullscreen);
      player.on("exitfullscreen", this.exitedFullscreen);
      player.on("seeked", this.playerSeekEnded);
      player.on("ended", this.playbackEnded);
      player.on("progress", this.progressUpdated);

      /**
       * prevents entering into fullscreen by double clicking
       * on a modal added on top of the video; double clicking
       * on the video still enters fullscreen
       */
      if (player.eventListeners != undefined) {
        player.eventListeners.forEach((eventListener) => {
          if (eventListener != undefined && eventListener.type === "dblclick") {
            eventListener.element.removeEventListener(
              eventListener.type,
              eventListener.callback,
              eventListener.options
            );
          }
        });
      }

      this.removePlyrPoster();
    },
    removePlyrPoster() {
      // allow user to interact with the youtube iframe elements
      var plyrPoster = document.getElementById("plyr__poster");
      if (plyrPoster != null && plyrPoster.remove === "function") plyrPoster.remove();
    },
    playerTimeUpdated() {
      // invoked when the player time has been updated
      var updatedTime = Number(this.player.currentTime.toFixed(2));
      this.$emit("update:currentTime", updatedTime);
      this.$emit("update", updatedTime);
    },
    playerReady() {
      // invoked when the player instance is ready
      this.$emit("ready");
    },
    playerPlayed() {
      // invoked when the player has been played
      this.$emit("play");
    },
    playerSeekEnded() {
      // invoked when a seek operation has ended
      this.$emit("seeked");
    },
    playerPaused() {
      // invoked when the player has been paused
      this.$emit("pause");
    },
    enteredFullscreen() {
      // invoked when the player is entering fullscreen
      this.$emit("enterfullscreen");
    },
    exitedFullscreen() {
      // invoked when the player is exiting fullscreen
      this.$emit("exitfullscreen");
    },
    playbackEnded() {
      // invoked when the video has ended (and autoPlay is not true)
      this.$emit("playback-ended");
    },
    progressUpdated() {
      // invokes whenever the amount of buffered media changes
      if (this.player.buffered > 0) this.$emit("buffered");
    },
  },
  computed: {
    isVideoIdValid() {
      // whether the video Id is valid
      return this.videoId != null && this.videoId != "";
    },
  },
  emits: [
    "update",
    "initiated",
    "ready",
    "play",
    "pause",
    "update:currentTime",
    "enterfullscreen",
    "exitfullscreen",
    "seeked",
    "playback-ended",
    "buffered",
  ],
};
</script>
<style lang="scss">
.plyr__poster {
  z-index: -1 !important;
}
// hides the youtube video title and buttons like "watch later" + the more videos section
.plyr iframe[id^="youtube"] {
  top: -50%;
  height: 200%;
}
</style>
