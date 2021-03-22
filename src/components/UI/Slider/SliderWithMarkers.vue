<template>
  <!-- :style="markerStyle" -->

  <div>
    <slider v-model="timestamp" @change="updateTimestamp" :max="end">></slider>
    <div class="flex relative">
      <div
        v-for="(markerStyle, markerIndex) in markerStyles"
        :key="markerIndex"
        class="absolute"
        :style="markerStyle"
      >
        <button @click="updateTimestampFromMarker(markerIndex)">
          <font-awesome-icon
            :icon="['fas', 'map-marker']"
            class="transform rotate-180"
          ></font-awesome-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Slider from "primevue/slider";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons/faMapMarker";
library.add(faMapMarker);

export default {
  components: {
    Slider,
  },
  data() {
    return {
      timestamp: null,
    };
  },
  props: {
    markerPositions: {
      default: () => [],
      type: Array,
    },
    end: {
      default: 100,
      type: Number,
    },
  },
  methods: {
    updateTimestamp(markerIndex = null) {
      this.$emit("update", this.timestamp, markerIndex);
    },
    updateTimestampFromMarker(markerIndex) {
      this.timestamp = this.markerPositions[markerIndex];
      this.updateTimestamp(markerIndex);
    },
  },
  computed: {
    markerRelativePositions() {
      var relativePositions = [];

      this.markerPositions.forEach((position) => {
        relativePositions.push(Number(((position * 100) / this.end).toFixed(2)));
      });

      return relativePositions;
    },
    markerStyles() {
      var styles = [];

      this.markerRelativePositions.forEach((relativePosition) => {
        styles.push("left: " + relativePosition + "%");
      });

      return styles;
    },
  },
  emits: ["update"],
};
</script>
