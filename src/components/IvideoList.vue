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
        color:white;
        border: 1px solid #ccc;
        background: #CC593D;
        padding: 2rem;
        border-radius: 5px;
        text-align: center;
        position: relative;
        cursor: pointer;
        text-decoration: none;
    }

    .ivideo a {
        text-decoration: none;
        color: white;
    }

    .ivideo a:visited {
        text-decoration: none;
        color: white;
    }
</style>