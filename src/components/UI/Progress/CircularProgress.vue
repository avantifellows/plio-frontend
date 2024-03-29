<template>
  <div class="relative">
    <svg :height="radius * 2" :width="radius * 2">
      <!-- background circle -->
      <circle
        :stroke="progressBarBackgroundColor"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="{ strokeDashoffset: 0 }"
        :stroke-width="stroke"
        fill="transparent"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
      />
      <!-- the actual progress circle -->
      <circle
        :stroke="progressBarForegroundColor"
        :stroke-dasharray="circumference + ' ' + circumference"
        :style="{ strokeDashoffset: strokeDashoffset }"
        :stroke-width="stroke"
        fill="transparent"
        :r="normalizedRadius"
        :cx="radius"
        :cy="radius"
      />
    </svg>
    <!-- progress indicator in the center of the circle  -->
    <div
      v-if="isResultShown"
      class="absolute inset-1/3 flex flex-col justify-center"
      data-test="result"
    >
      <div class="w-full flex justify-center">
        <p class="text-lg bp-360:text-xl sm:text-3xl lg:text-5xl font-bold text-center">
          {{ Math.trunc(progressBarPercent) }}%
        </p>
      </div>
      <div class="w-full flex justify-center">
        <p
          class="text-sm bp-360:text-base sm:text-sm md:text-base lg:text-xl font-bold text-center"
        >
          {{ result.title }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CircularProgress",
  data() {
    return {
      progressBarBackgroundColor: "#C4C5C5",
      progressBarForegroundColor: "#2B9D05",
    };
  },
  props: {
    radius: Number, // radius of ring
    stroke: Number, // thickness of the ring
    /**
     * the result to be shown in the centre of the progress bar
     * - whether it is enabled and its title
     */
    result: {
      default: () => {
        return {
          enabled: false,
          title: "",
        };
      },
      type: Object,
    },
  },
  computed: {
    /**
     * percentage of progress to be shown in the progress bar
     */
    progressBarPercent() {
      return this.result.value;
    },
    /**
     * Calculating a reduced radius as we don't want the ring to overflow
     * the svg viewbox if the stroke is high
     * Reference - https://css-tricks.com/building-progress-ring-quickly/
     */
    normalizedRadius() {
      return this.radius - this.stroke * 2;
    },
    /**
     * Circumference of the circle that lies halfway between the inner and outer circle
     */
    circumference() {
      return this.normalizedRadius * 2 * Math.PI;
    },
    /**
     * refer to https://css-tricks.com/building-progress-ring-quickly/
     */
    strokeDashoffset() {
      return this.circumference - (this.progressBarPercent / 100) * this.circumference;
    },
    /**
     * Whether a result will be shown in the center of the progress bar
     */
    isResultShown() {
      return this.result.enabled;
    },
  },
};
</script>
<style lang="postcss">
circle {
  transition: stroke-dashoffset 0.5s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}
</style>
