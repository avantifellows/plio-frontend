<template>
  <div>
    <!--- plyr instance -->
    <div id="player" data-plyr-provider="youtube" :data-plyr-embed-id="videoId"></div>
  </div>
</template>

<script>
import Plyr from "plyr";

export default {
  data() {
    return {
      currentTime: {
        default: 0,
        type: Number,
      },
      player: null,
    };
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
      this.player.currentTime = newTime;
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
  props: {
    plyrConfig: {
      default: () => {},
      type: Object,
    },
    videoId: {
      default: "",
      type: String,
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
    },
    emitTimeUpdate() {
      // emit an event saying that the player time has been updated
      this.$emit("update", Number(this.player.currentTime.toFixed(2)));
    },
    emitReady() {
      // emit an event indicating that the player instance is ready
      this.$emit("ready", this.player);
    },
    emitPlay() {
      // emit an event indicating that the player has been played
      this.$emit("play", this.player);
    },
  },
  computed: {
    isVideoIdValid() {
      // whether the video Id is valid
      return this.videoId != null && this.videoId != "";
    },
  },
  emits: ["update", "ready", "play"],
};
</script>
