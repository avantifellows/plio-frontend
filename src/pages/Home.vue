<template>
  <div id="app" class="container">
    <PlioList />
  </div>
</template>

<script>
import PlioList from "@/components/UI/PlioList.vue";

export default {
  name: "Home",
  components: {
    PlioList,
  },
};
</script>

<style>
body {
  background: #ffffff;
  line-height: 1.6;
}
.container {
  max-width: 1100px;
  margin: auto;
  overflow: auto;
  padding: 0 2 rem;
}
</style>
