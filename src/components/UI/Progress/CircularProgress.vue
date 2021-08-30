<template>
  <svg :height="radius * 2" :width="radius * 2">
    <circle
      stroke="blue"
      :stroke-dasharray="circumference + ' ' + circumference"
      :style="{ strokeDashoffset: strokeDashoffset }"
      :stroke-width="stroke"
      fill="transparent"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
    />
  </svg>
</template>

<script>
export default {
  name: "CircularProgress",
  props: {
    radius: Number,
    progress: Number,
    stroke: Number,
  },
  data() {
    const normalizedRadius = this.radius - this.stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    return {
      normalizedRadius,
      circumference,
    };
  },
  computed: {
    strokeDashoffset() {
      return this.circumference - (this.progress / 100) * this.circumference;
    },
  },
};
</script>
<style lang="postcss">
circle {
  transition: stroke-dashoffset 0.35s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}
</style>
