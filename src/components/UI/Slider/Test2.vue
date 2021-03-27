<template>
  <div>
    <p>{{ sliderValue }}</p>

    <slider-with-markers
      v-model:value="sliderValue"
      v-model:markerPositions="markerPositions"
    ></slider-with-markers>
  </div>
</template>

<script>
import SliderWithMarkers from "@/components/UI/Slider/SliderWithMarkers.vue";
export default {
  components: {
    SliderWithMarkers,
  },
  data() {
    return {
      sliderValue: 0,
      markerPositions: [5, 10, 20, 40, 60, 80, 120],
      sliderOptions: {
        sliderClasses: ["bg-gray-dark", "text-red-300"],
      },
    };
  },
};
</script>
