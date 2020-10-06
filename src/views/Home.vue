<template>
  <div id="app" class="container">
    Welcome to Plio! Have fun!
    <IvideoList />
  </div>  
</template>

<script>

import IvideoList from '../components/IvideoList.vue'

export default {
  name: "Home",
  components: {
    IvideoList
  }
};
</script>

<style>
body {
  background: #e8f7f0;
  line-height: 1.6;
}
.container {
  max-width: 1100px;
  margin: auto;
  overflow: auto;
  padding: 0 2 rem;
}
</style>
