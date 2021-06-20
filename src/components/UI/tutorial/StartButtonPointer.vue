<template>
  <inline-svg
    :src="getIconSource('hand-point-left-solid.svg')"
    class="hand-pointer transform rotate-90"
  ></inline-svg>
</template>

<script>
import Utilities from "@/services/Functional/Utilities.js";
export default {
  name: "StartButtonPointer",
  methods: {
    ...Utilities,
  },
};
</script>

<style scoped>
.hand-pointer {
  font-size: 4em;
  animation: point 1s ease-in-out infinite alternate;
}

@keyframes point {
  100% {
    transform: translateY(-30px);
  }
}
</style>
