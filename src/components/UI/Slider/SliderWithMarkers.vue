<template>
  <!-- :style="markerStyle" -->
  <!-- :class="{ 'markerVisibility(markerIndex)': hidden }" -->
  <div>
    <!-- PrimeVue Slider -->
    <slider
      v-model="timestamp"
      @change="updateSliderValue"
      :max="end"
      :step="step"
    ></slider>
    <div class="flex relative">
      <!-- markers shown at the given positions -->
      <div
        v-for="(markerStyle, markerIndex) in markerStyles"
        :key="markerIndex"
        class="absolute"
        :class="{ hidden: !isMarkerVisible(markerIndex) }"
        :style="markerStyle"
      >
        <button @click="updateSliderValueFromMarker(markerIndex)">
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
    // positions where the markers are to be displayed
    markerPositions: {
      default: () => [],
      type: Array,
    },
    // maximum boundary value.
    end: {
      default: 100,
      type: Number,
    },
    // step factor to increment/decrement the value
    step: {
      default: 1,
      type: Number,
    },
    // whether to hide markers which overflow from the slider
    hideOverflowMarkers: {
      default: true,
      type: Boolean,
    },
  },
  methods: {
    isMarkerVisible(markerIndex) {
      var markerRelativePosition = this.markerRelativePositions[markerIndex];
      return markerRelativePosition >= 0 && markerRelativePosition <= 100;
    },
    updateSliderValue(timestamp, markerIndex = null) {
      // emit an event indicating the slider value has been updated
      this.$emit("update", timestamp, markerIndex);
    },
    updateSliderValueFromMarker(markerIndex) {
      // update the slider position from the marker selected
      // and emit an event for the update
      this.timestamp = this.markerPositions[markerIndex];
      this.updateSliderValue(this.timestamp, markerIndex);
    },
  },
  computed: {
    markerRelativePositions() {
      // converts the absolute positions of the markers to relative to the slider length
      var relativePositions = [];

      this.markerPositions.forEach((position) => {
        relativePositions.push(Number(((position * 100) / this.end).toFixed(2)));
      });

      return relativePositions;
    },
    markerStyles() {
      // computes the styles to be applied on each marker
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
