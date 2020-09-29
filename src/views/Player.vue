<template>  
    <div class="container">
	<div id="player" data-plyr-provider="youtube" data-plyr-embed-id="bTqVqk7FSmY"></div>
        </div>
</template>

<script>
import Plyr from 'plyr';

export default {
  name: "Player",
  computed: {
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
        this.player = new Plyr('#player');
    },
};
</script>

<style>

@import 'https://cdn.plyr.io/3.6.2/plyr.css';

</style>