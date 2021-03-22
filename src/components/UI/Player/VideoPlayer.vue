<template>
  <div>
    <div class="player_container">
      <div id="player" data-plyr-provider="youtube" :data-plyr-embed-id="videoId"></div>
    </div>
  </div>
</template>

<script>
import Plyr from "plyr";

export default {
  created() {
    // load plio details
    this.$nextTick(() => this.initiatePlayer());
  },
  watch: {
    currentTime(newTime) {
      this.player.currentTime = newTime;
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
    currentTime: {
      default: 0,
      type: Number,
    },
  },
  methods: {
    initiatePlayer() {
      this.player = new Plyr("#player", this.plyrConfig);
      this.setPlayerProperties(this.player);
    },
    setPlayerProperties(player) {
      player.on("timeupdate", this.emitTimeUpdate);
    },
    emitTimeUpdate() {
      this.$emit("update", this.player.currentTime);
    },
  },
  emits: ["update"],
};
</script>

<style scoped>
.player_container {
  max-width: 800px;
  margin: auto;
  position: relative;
}
</style>
