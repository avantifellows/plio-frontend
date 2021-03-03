<template>
<div class="options-pointer-container">
   <font-awesome-icon
      :icon="['fas', 'hand-point-left']"
      class="option-pointer"
      ref="hand-pointer"
    ></font-awesome-icon> 
  <div class="instruction-text">कोई एक चुने</div>
</div>
</template>

<script>
 import { library } from '@fortawesome/fontawesome-svg-core'
 import { faHandPointLeft } from '@fortawesome/free-solid-svg-icons/faHandPointLeft'
 library.add(faHandPointLeft)

 export default {
   name: 'mcqOptionsPointer',
 }
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

  .option-pointer{
    font-size: 3.5em;
    animation: point 1s ease-in-out infinite alternate;
  }

  .options-pointer-container{
    display:flex;
    align-items: center;
  }

  @keyframes point {
    100% {
      transform: translateX(-20px);
    }
  }
</style>