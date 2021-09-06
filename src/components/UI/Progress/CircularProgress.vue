<template>
  <div class="relative">
    <svg :height="radius * 2" :width="radius * 2">
      <!-- background circle -->
      <circle
        stroke="#C4C5C5"
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
        stroke="#2B9D05"
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
      v-if="toShowNumberIndicator"
      class="absolute inset-1/3 flex flex-col justify-center"
    >
      <div class="text-sm sm:text-base md:text-2xl lg:text-4xl font-bold text-center">
        {{ Math.trunc(progress) }}%
      </div>
      <div class="text-xsm sm:text-sm md:text-base lg:text-xl font-bold text-center">
        {{ progressNumberIndicator.additionalText }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CircularProgress",
  props: {
    radius: Number, // radius of ring
    progress: Number, // progress of the ring
    stroke: Number, // thickness of the ring
    progressNumberIndicator: {
      // to show a number indicator in between and if yes
      // what additional text to show along with it
      default: () => {
        return {
          enabled: false,
          additionalText: "",
        };
      },
      type: Object,
    },
  },
  computed: {
    normalizedRadius() {
      // refer - https://css-tricks.com/building-progress-ring-quickly/
      return this.radius - this.stroke * 2;
    },
    circumference() {
      return this.normalizedRadius * 2 * Math.PI;
    },
    strokeDashoffset() {
      return this.circumference - (this.progress / 100) * this.circumference;
    },
    toShowNumberIndicator() {
      return this.progressNumberIndicator.enabled;
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
