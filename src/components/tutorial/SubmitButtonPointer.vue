<template>
   <font-awesome-icon
      :icon="['fas', 'hand-point-left']"
      class="hand-pointer"
      ref="hand-pointer"
    ></font-awesome-icon>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHandPointLeft } from "@fortawesome/free-solid-svg-icons/faHandPointLeft";
library.add(faHandPointLeft);

export default {
  name: "SubmitButtonPointer"
}
</script>

<style scoped>
  .hand-pointer{
    font-size: 4em;
    animation: point 1s ease-in-out infinite alternate;
  }

  @keyframes point {
    100% {
      transform: translateX(-30px);
    }
  }
</style>
