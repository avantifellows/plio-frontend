<template>
   <font-awesome-icon
      :icon="['fas', 'hand-point-up']"
      class="hand-pointer"
      ref="hand-pointer"
    ></font-awesome-icon> 
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHandPointUp } from "@fortawesome/free-solid-svg-icons/faHandPointUp";
library.add(faHandPointUp);

export default {
  name: "StartButtonPointer"
}
</script>

<style scoped>
  .hand-pointer{
    font-size: 4em;
    animation: point 1s ease-in-out infinite alternate;
  }

  @keyframes point {
    100% {
      transform: translateY(-30px);
    }
  }
</style>