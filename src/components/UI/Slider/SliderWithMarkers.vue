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
    />
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
    // whether to hide markers which overflow from the slider
    hideOverflowMarkers: {
      default: true,
      type: Boolean,
    },
    isDragDisabled: {
      // whether to make the markers non draggable or not
      default: false,
      type: Boolean,
    },
  },
  methods: {
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
      this.$emit("marker-drag", markerIndex);
    },
    markerSliderSelected(markerIndex) {
      // invoked when a marker has been selected
      if (!this.isDragDisabled) this.activeMarkerIndex = markerIndex;
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
      // invoked when a marker has been unselected
      this.activeMarkerIndex = null;
    },
    markerSliderUnselected() {
      // invoked when a marker has been unselected
      this.activeMarkerIndex = null;
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
    convertRemToPixels() {
      return 1.5 * parseInt(this.getBaseFontSize(), 10);
    },
    getBaseFontSize() {
      return window.getComputedStyle(document.body, null).getPropertyValue("font-size");
    },
  },
  computed: {
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
      set(localMarkerPositions) {
        this.$emit("update:markerPositions", localMarkerPositions);
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
  @apply appearance-none w-6 h-6 rounded-full bg-red-500 transform translate-y-4;
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
  @apply appearance-none w-6 h-6 rounded-full bg-blue-500;
}
</style>
