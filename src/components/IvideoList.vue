<template>
  <h3>IVideos</h3>
  <div class="ivideos">

    <div v-for="ivideo in allIvideos" :key="ivideo.object_id" class="ivideo">
        <router-link :to="'/play/' +  ivideo.object_id" >{{ ivideo.object_id }}</router-link>
    </div>
  </div>
</template>


<script>

import { mapGetters, mapActions } from 'vuex';

export default {
  name: "IvideoList",
  computed: mapGetters(['allIvideos']),
  methods: {
      ...mapActions(['fetchIvideos'])
  },
  created() {
      this.fetchIvideos();
  }
};
</script>

<style scoped>
    .ivideos {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 1rem;
    }

    .ivideo {
        border: 1px solid #ccc;
        background: #41b883;
        padding: 1rem;
        border-radius: 5px;
        text-align: center;
        position: relative;
        cursor: pointer;
    }
</style>