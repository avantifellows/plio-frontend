<template>
  <div>
    {{ markerPositions }}
    <slider v-model="value" @change="updateValue">></slider>
  </div>
</template>

<script>
import Slider from "primevue/slider";
export default {
  components: {
    Slider,
  },
  data() {
    return {
      value: null,
    };
  },
  props: {
    markerPositions: {
      default: () => [],
      type: Array,
    },
  },
  methods: {
    updateValue(value) {
      this.$emit("input", value);
    },
  },
  emits: ["input"],
};
</script>
