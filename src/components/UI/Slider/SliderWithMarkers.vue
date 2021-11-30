<template>
  <div class="flex relative">
    <div class="rounded-full w-6 h-6" id="dummyMarker"></div>
    <input
      id="mainSlider"
      type="range"
      v-model.number="localValue"
      :max="end"
      :step="step"
      class="slider w-full absolute z-50 main-slider-thumb"
      @input="valueUpdated"
      data-test="mainSlider"
    />
    <input
      type="range"
      v-for="(markerStyle, markerIndex) in markerStyles"
      :key="markerIndex"
      :min="getMarkerSlideMin(markerIndex)"
      :max="getMarkerSlideMax(markerIndex)"
      :step="step"
      :style="markerStyle"
      class="slider absolute marker-slider-thumb"
      :class="getMarkerSlideClass(markerIndex)"
      v-model.number="localMarkerPositions[markerIndex]"
      @mouseover="markerSliderSelected(markerIndex)"
      @mouseout="markerSliderUnselected"
      @change="markerSliderChangeOver(markerIndex)"
      @input="markerSliderUpdated(markerIndex)"
      @touchstart="markerSliderTouched(markerIndex)"
      @touchend="markerSliderUnselected"
      @click="updateValueFromMarker(markerIndex)"
      :data-test="`marker-${markerIndex}`"
      :id="`marker-${markerIndex}`"
    />
    <!-- tooltip for markers -->
    <div
      v-if="isMarkerTooltipVisible"
      class="absolute z-10 inline-block bg-gray-900 font-semibold shadow-sm text-white py-2 px-3 text-sm rounded-lg mt-10"
      :style="markerTooltipPosition"
    >
      {{ markerTooltipContent }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeMarkerIndex: null, // index of the current active marker
      sliderWidth: null, // width of the slider
      markerWidth: null, // width of one marker
      clickAfterDragEnded: false, // indicates whether a marker click was invoked right after it was dragged
      touched: false, // whether a touch event has been initiated
      touchPosition: null, // the current position where the touch event took place
      markerTooltipContent: null, // the content that will be shown inside a marker tooltip
    };
  },
  created() {
    this.$nextTick(() => {
      this.setScreenProperties();
      window.addEventListener("resize", this.handleScreenSizeChange);
    });
  },
  unmounted() {
    window.removeEventListener("resize", this.handleScreenSizeChange);
  },
  props: {
    // positions where the markers are to be displayed
    markerPositions: {
      default: () => [],
      type: Array,
    },
    // the actual value of the main slider
    value: {
      default: 0,
      type: Number,
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
    // whether to make the markers non-draggable
    isDragDisabled: {
      default: false,
      type: Boolean,
    },
  },
  methods: {
    /**
     * Update the content and positioning of a marker tooltip
     * @param {Number} markerIndex - The index of the marker
     */
    updateMarkerTooltip(markerIndex) {
      if (markerIndex == null) {
        // don't show anything
        this.markerTooltipContent = null;
      } else {
        this.markerTooltipContent = this.localMarkerPositions[markerIndex];
        // adjust the position of the tooltip's start to take into account the marker width
        this.markerTooltipPosition =
          "left: " +
          (this.markerRelativePositions[markerIndex] - this.markerWidthPercent / 2) +
          "%";
      }
    },
    handleScreenSizeChange() {
      // invoked when the screen size is changing
      this.setScreenProperties();
    },
    setScreenProperties() {
      // sets various properties based on the device screen
      this.sliderWidth = document.getElementById("mainSlider").clientWidth;
      this.markerWidth = document.getElementById("dummyMarker").clientWidth;
    },
    isMarkerVisible(markerIndex) {
      // whether the marker at the given index should be visible
      var markerRelativePosition = this.markerRelativePositions[markerIndex];
      return (
        markerRelativePosition >= 0 &&
        markerRelativePosition <= (100 * this.markerArenaWidth) / this.sliderWidth
      );
    },
    valueUpdated() {
      this.$emit("update", this.value);
    },
    updateValueFromMarker(markerIndex) {
      // update the slider position from the marker selected
      // and emit an event for the update
      if (this.clickAfterDragEnded) {
        this.clickAfterDragEnded = false;
      } else {
        this.localValue = this.markerPositions[markerIndex];
        this.$emit("marker-selected", markerIndex);
      }
    },
    markerSliderUpdated(markerIndex) {
      // invoked when the marker slider value is changing while being dragged
      if (this.touched && !this.localMarkerPositions[markerIndex]) {
        this.localMarkerPositions[markerIndex] = this.touchPosition;
        this.touched = false;
      }
      this.updateMarkerTooltip(markerIndex);
      this.$emit("marker-drag", markerIndex);
    },
    markerSliderSelected(markerIndex) {
      // invoked when a marker has been selected
      if (!this.isDragDisabled) this.activeMarkerIndex = markerIndex;
      this.updateMarkerTooltip(this.activeMarkerIndex);
    },
    markerSliderTouched(markerIndex) {
      this.touched = true;
      this.touchPosition = this.localMarkerPositions[markerIndex];
      this.clickAfterDragEnded = false;
      this.updateValueFromMarker(markerIndex);
      this.markerSliderSelected(markerIndex);
    },
    markerSliderChangeOver(markerIndex) {
      // invoked when the marker slider value change is done
      this.clickAfterDragEnded = true;
      this.$emit("marker-drag-end", markerIndex);
      this.activeMarkerIndex = null;
    },
    markerSliderUnselected() {
      // invoked when a marker has been unselected
      this.activeMarkerIndex = null;
      this.updateMarkerTooltip(null);
    },
    getMarkerSlideClass(markerIndex) {
      var markerActive = this.isMarkerActive(markerIndex);
      return [
        {
          hidden: !this.isMarkerVisible(markerIndex),
          "w-full": markerActive,
          "z-0": markerActive,
          "z-20": !markerActive,
          "marker-slider-thumb-inactive": !markerActive && !this.isDragDisabled,
          "marker-slider-thumb-inactive-disabled": !markerActive && this.isDragDisabled,
        },
        "w-6",
      ];
    },
    getMarkerSlideMin(markerIndex) {
      // minimum value for the slider of a given marker index
      if (!this.isMarkerActive(markerIndex))
        return this.localMarkerPositions[markerIndex];
      else return 0;
    },
    getMarkerSlideMax(markerIndex) {
      // maximum value for the slider of a given marker index
      if (!this.isMarkerActive(markerIndex))
        return this.localMarkerPositions[markerIndex];
      else return this.end;
    },
    isMarkerActive(markerIndex) {
      // whether the given marker index is active
      return this.activeMarkerIndex != null && this.activeMarkerIndex == markerIndex;
    },
  },
  computed: {
    /**
     * What percent of the slider's width is the marker's width
     */
    markerWidthPercent() {
      return (this.markerWidth * 100) / this.sliderWidth;
    },
    isMarkerTooltipVisible() {
      // hide the tooltip if no marker is active or if there's no content to show
      return this.activeMarkerIndex != null && this.markerTooltipContent != null;
    },
    markerArenaWidth() {
      // the width in pixels of the possible range where the left margin of each marker
      // could start from
      if (this.sliderWidth == null || this.markerWidth == null) return null;
      return this.sliderWidth - this.markerWidth;
    },
    localValue: {
      // local copy of the value prop
      get() {
        return this.value;
      },
      set(localValue) {
        this.$emit("update:value", localValue);
      },
    },
    localMarkerPositions: {
      // local copy of the markerPositions prop
      get() {
        return this.markerPositions;
      },
    },
    markerRelativePositions() {
      // converts the absolute positions of the markers to relative to the slider length
      if (
        this.sliderWidth == null ||
        this.sliderWidth == 0 ||
        this.markerArenaWidth == null
      )
        return [];
      var relativePositions = [];
      this.markerPositions.forEach((position) => {
        var numerator = (position * this.markerArenaWidth) / this.end;
        var relativePosition = Number(((numerator * 100) / this.sliderWidth).toFixed(2));
        relativePositions.push(relativePosition);
      });

      return relativePositions;
    },
    markerStyles() {
      // computes the styles to be applied on each marker
      var styles = [];

      this.markerRelativePositions.forEach((relativePosition, markerIndex) => {
        if (this.isMarkerActive(markerIndex)) styles.push("");
        else {
          styles.push("left: " + relativePosition + "%");
        }
      });

      return styles;
    },
  },
  emits: [
    "update:value",
    "update:markerPositions",
    "marker-selected",
    "update",
    "marker-drag",
    "marker-drag-end",
  ],
};
</script>

<style lang="postcss" scoped>
.slider {
  @apply appearance-none h-2 cursor-pointer bg-gray-300 focus:outline-none;
}

.marker-slider-thumb::-webkit-slider-thumb {
  @apply appearance-none w-6 h-6 rounded-full bg-red-500 mt-8;
}
.marker-slider-thumb::-moz-range-thumb {
  width: 1.4rem;
  height: 1.4rem;
  @apply appearance-none rounded-full bg-red-500 transform translate-y-4 border-transparent;
}
.marker-slider-thumb-inactive::-webkit-slider-thumb {
  @apply bg-green-500;
}
.marker-slider-thumb-inactive::-moz-range-thumb {
  @apply bg-green-500 transform translate-y-2;
}
.marker-slider-thumb-inactive-disabled::-webkit-slider-thumb {
  @apply bg-primary;
}
.marker-slider-thumb-inactive-disabled::-moz-range-thumb {
  @apply bg-primary transform translate-y-2;
}
.main-slider-thumb::-webkit-slider-thumb {
  @apply appearance-none w-6 h-6 rounded-full bg-blue-500;
}
.main-slider-thumb::-moz-range-thumb {
  @apply appearance-none w-6 h-6 rounded-full bg-blue-500 border-transparent;
}
</style>
