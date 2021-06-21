<template>
  <inline-svg
    :src="getIconSource('hand-point-left-solid.svg')"
    class="hand-pointer"
  ></inline-svg>
</template>

<script>
import Utilities from "@/services/Functional/Utilities.js";
export default {
  name: "SubmitButtonPointer",
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
    transform: translateX(-30px);
  }
}
</style>
