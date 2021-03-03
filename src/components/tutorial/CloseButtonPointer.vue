<template>
   <font-awesome-icon
      :icon="['fas', 'hand-point-right']"
      class="hand-pointer"
      ref="hand-pointer"
    ></font-awesome-icon> 
</template>

<script>
 import { library } from '@fortawesome/fontawesome-svg-core'
 import { faHandPointRight } from '@fortawesome/free-solid-svg-icons/faHandPointRight'
 library.add(faHandPointRight)

 export default {
   name: 'CloseButtonPointer',
 }
</script>

<style scoped>
  .hand-pointer{
    font-size: 4em;
    animation: point 1s ease-in-out infinite alternate;
  }

  @keyframes point {
    100% {
      transform: translateX(30px);
    }
  }
</style>