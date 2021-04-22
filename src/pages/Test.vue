<template>
  <div>
    <slider-with-markers
      v-model:value="value"
      :markerPositions="markerPositions"
    ></slider-with-markers>
  </div>
</template>

<script>
import SliderWithMarkers from "../components/UI/Slider/SliderWithMarkers";

export default {
  data() {
    return {
      value: 10,
      markerPositions: [40, 100],
    };
  },
  components: {
    SliderWithMarkers,
  },
};
</script>
