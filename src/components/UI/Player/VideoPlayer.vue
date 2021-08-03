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
      playerplayerControlsHidden: false,
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
      }
    });
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
    initiatePlayer() {
      // creates a new instance of plyr and sets its properties
      this.player = new Plyr("#player", this.plyrConfig);
      this.setPlayerProperties(this.player);
    },
    setPlayerProperties(player) {
      // set properties of the player
      player.on("timeupdate", this.emitTimeUpdate);
      player.on("ready", this.emitReady);
      player.on("play", this.emitPlay);
      player.on("pause", this.emitPause);
      player.on("enterfullscreen", this.emitEnterFullscreen);
      player.on("exitfullscreen", this.emitExitFullscreen);
      player.on("seeked", this.emitSeeked);
      player.on("progress", this.handleProgress);

      this.removePlyrPoster();
    },
    removePlyrPoster() {
      // allow user to interact with the youtube iframe elements
      var plyrPoster = document.getElementById("plyr__poster");
      if (plyrPoster != null && plyrPoster.remove === "function") plyrPoster.remove();
    },
    emitTimeUpdate() {
      // emit an event saying that the player time has been updated
      var updatedTime = Number(this.player.currentTime.toFixed(2));
      this.$emit("update:currentTime", updatedTime);
      this.$emit("update", updatedTime);
    },
    emitReady() {
      // emit an event indicating that the player instance is ready
      this.$emit("ready");
      // hide the play buttons - will be made visible when buffering is complete
      this.toggleControlVisibility();
    },
    emitPlay() {
      // emit an event indicating that the player has been played
      this.$emit("play");
    },
    emitSeeked() {
      // emit an event indicating that a seek operation has ended
      this.$emit("seeked");
    },
    emitPause() {
      // emit an event indicating that the player has been paused
      this.$emit("pause");
    },
    emitEnterFullscreen() {
      // emit an event indicating that the player is entering fullscreen
      this.$emit("enterfullscreen");
    },
    emitExitFullscreen() {
      // emit an event indicating that the player is exiting fullscreen
      this.$emit("exitfullscreen");
    },
    handleProgress() {
      // check if some buffering is done and unhide the controls if hidden
      if (this.player.buffered > 0 && this.playerControlsHidden) {
        this.toggleControlVisibility();
      }
    },
    toggleControlVisibility() {
      // select the control elements and hide / show them
      let controlElements = document.querySelectorAll(".plyr__control");
      if (this.playerControlsHidden) {
        controlElements.forEach((control) => {
          control.style.display = "";
        });
        this.playerControlsHidden = false;
      } else {
        controlElements.forEach((control) => {
          control.style.display = "none";
        });
        this.playerControlsHidden = true;
      }
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
  ],
};
</script>
<style lang="scss">
.plyr__poster {
  z-index: -1 !important;
}
</style>
