<template>
  <div class="options-pointer-container">
    <inline-svg
      :src="getIconSource('hand-point-left-solid.svg')"
      class="option-pointer"
    ></inline-svg>
    <div class="instruction-text">{{ $t("player.tutorial.mcq") }}</div>
  </div>
</template>

<script>
import Utilities from "@/services/Functional/Utilities.js";
export default {
  name: "mcqOptionsPointer",
  methods: {
    ...Utilities,
  },
};
</script>

<style scoped>
.instruction-text {
  background-color: #eae531;
  border: none;
  color: black;
  padding: 10px;
  text-align: center;
  text-decoration: none;
  margin: 2px;
  transition-duration: 0.4s;
  cursor: pointer;
  height: auto;
  align-self: center;
  font-weight: 700;
  font-size: 1.3rem;
  border-style: solid;
}

.option-pointer {
  font-size: 3.5em;
  animation: point 1s ease-in-out infinite alternate;
}

.options-pointer-container {
  display: flex;
  align-items: center;
}

@keyframes point {
  100% {
    transform: translateX(-20px);
  }
}
</style>
