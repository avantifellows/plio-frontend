<template>  
    {{ $route.params.id }}
    
    <div class="player_container" v-if="video_data">
        {{ video_data }}

        <div id="player" data-plyr-provider="youtube" :data-plyr-embed-id="video_data.ivideo_details.video_id"></div>
    </div>
    
</template>

<script>
import Plyr from "plyr";
import axios from "axios";

export default {
  name: "Player",
  data() {
    return {
      video_data: null,
    };
  },
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
    console.log(process.env.VUE_APP_BACKEND_URL +
          process.env.VUE_APP_BACKEND_IVIDEO_DETAILS +
          "?ivideo_id=" + this.$route.params.id)
    axios
      .get(
        process.env.VUE_APP_BACKEND_URL +
          process.env.VUE_APP_BACKEND_IVIDEO_DETAILS +
          "?ivideo_id=" + this.$route.params.id
      )
      .then((res) => (this.video_data = res.data ))
      .then( () => this.player = new Plyr("#player"))
      .catch((err) => console.log(err));
    
  },
};
</script>

<style>
@import "https://cdn.plyr.io/3.6.2/plyr.css";
#player {
    height: 300px;
}
</style>