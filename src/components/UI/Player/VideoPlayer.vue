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
    coverFullscreen: {
      // whether the player should cover the full screen
      default: true,
      type: Boolean,
    },
  },
  created() {
    // start the player
    this.$nextTick(() => {
      if (this.isVideoIdValid) {
        this.initiatePlayer();
        // sets the aspect ratio while the player is getting ready
        this.setAspectRatio();
      }
    });
    // add listener for resize
    window.addEventListener("resize", this.setAspectRatio);
  },
  unmounted() {
    // remove listeners
    window.removeEventListener("resize", this.setAspectRatio);
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
    setAspectRatio() {
      /**
       * sets the aspect ratio based on the current window height and width
       * to cover the full screen
       */
      // if the player should not cover the fullscreen, then do not proceed
      if (!this.coverFullscreen) return;
      // refer to this comment from the creator of plyr on how he
      // handles responsiveness: https://github.com/sampotts/plyr/issues/339#issuecomment-287603966
      // the solution below is just generalizing what he had done
      let paddingBottom = (100 * window.innerHeight) / window.innerWidth;
      document.getElementsByClassName(
        "plyr__video-embed"
      )[0].style.paddingBottom = `${paddingBottom}%`;
    },
    initiatePlayer() {
      // creates a new instance of plyr and sets its properties
      this.player = new Plyr("#player", this.plyrConfig);
      this.setPlayerProperties(this.player);
    },
    setPlayerProperties(player) {
      // set properties of the player
      player.on("timeupdate", this.playerTimeUpdated);
      player.on("ready", this.playerReady);
      player.on("play", this.playerPlayed);
      player.on("pause", this.playerPaused);
      player.on("enterfullscreen", this.enteredFullscreen);
      player.on("exitfullscreen", this.exitedFullscreen);
      player.on("seeked", this.playerSeekEnded);
      player.on("ended", this.playbackEnded);
      player.on("progress", this.progressUpdated);

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
      // sets the aspect ratio when the player is ready
      // this is required for safari
      this.setAspectRatio();
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
      this.setAspectRatio();
    },
    playbackEnded() {
      // invoked when the video has ended (and autoPlay is not true)
      this.$emit("playback-ended");
    },
    progressUpdated() {
      // invokes whenever the amount of buffered media changes
      if (this.player.buffered > 0) this.setAspectRatio();
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
    "ready",
    "play",
    "pause",
    "update:currentTime",
    "enterfullscreen",
    "exitfullscreen",
    "seeked",
    "playback-ended",
  ],
};
</script>
<style lang="scss">
.plyr__poster {
  z-index: -1 !important;
}
// hides the youtube video title and buttons like "watch later"
.plyr iframe[id^="youtube"] {
  top: -50%;
  height: 200%;
}
</style>
